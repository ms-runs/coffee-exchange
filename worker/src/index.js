// Coffee exchange Worker: saves and serves the group's reviews (D1), and a CSV for Google Sheets.
//
//   GET  /api/reviews            → { scale, reviews: [...] }   (optional ?number=01)
//   GET  /api/reviews.csv        → CSV, one row per review     (for =IMPORTDATA in Google Sheets)
//   POST /api/reviews            → save a review; one per person per coffee, saving again updates it
//
// Group code: POST needs the group's code (body.code or X-Group-Code header). The code is checked against a
// SHA-256 hash in the D1 settings table (key group_code_sha256), so it can be changed without redeploying;
// a GROUP_CODE secret, if set, takes priority. Codes are compared trimmed and lower-case.

const ALLOWED_ORIGINS = [
  'https://ms-runs.github.io',
  'https://migsousa.com',
  'https://www.migsousa.com',
];
const SCALE = 10;
const PROFILE_KEYS = ['acidity', 'body', 'sweetness', 'bitterness', 'finish'];
const AGAIN = ['yes', 'maybe', 'no'];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === '/api/reviews' && request.method === 'GET') {
        const number = url.searchParams.get('number');
        const rows = await listReviews(env, number);
        return json({ scale: SCALE, reviews: rows }, 200, { ...cors, 'Cache-Control': 'no-store' });
      }

      if (url.pathname === '/api/reviews.csv' && request.method === 'GET') {
        const rows = await listReviews(env);
        return new Response(toCSV(rows), {
          headers: { ...cors, 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store',
            'Content-Disposition': 'inline; filename="coffee-exchange-reviews.csv"' },
        });
      }

      if (url.pathname === '/api/reviews' && request.method === 'POST') {
        let body;
        try { body = await request.json(); } catch { return json({ error: 'Send the review as JSON.' }, 400, cors); }

        const code = String(body.code || request.headers.get('X-Group-Code') || '');
        if (!(await codeOk(env, code))) {
          return json({ error: code ? 'That group code is not right.' : 'Enter the group code to save.', code: 'group_code' }, 403, cors);
        }

        const r = validate(body);
        if (r.error) return json({ error: r.error }, 400, cors);

        await env.DB.prepare(
          `INSERT INTO reviews (number, by_name, by_key, city, date, score, tasting, profile, method, recipe, again, notes, verdict, brew)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
           ON CONFLICT (number, by_key) DO UPDATE SET
             by_name = excluded.by_name, city = excluded.city, date = excluded.date, score = excluded.score,
             tasting = excluded.tasting, profile = excluded.profile, method = excluded.method, recipe = excluded.recipe,
             again = excluded.again, notes = excluded.notes, verdict = excluded.verdict, brew = excluded.brew, updated_at = datetime('now')`
        ).bind(r.number, r.by, r.by.toLowerCase(), r.city, r.date, r.score,
               JSON.stringify(r.tasting), JSON.stringify(r.profile), JSON.stringify(r.method),
               r.recipe, r.again, r.notes, r.verdict, JSON.stringify(r.brew)).run();

        const saved = await listReviews(env, r.number);
        return json({ ok: true, review: saved.find(x => x.by.toLowerCase() === r.by.toLowerCase()) }, 200, cors);
      }

      // lets the review page check a code before someone fills in the whole form
      if (url.pathname === '/api/code' && request.method === 'POST') {
        let body = {}; try { body = await request.json(); } catch {}
        return json({ ok: await codeOk(env, String(body.code || '')) }, 200, cors);
      }

      if (url.pathname === '/' || url.pathname === '/api') {
        return new Response('Coffee exchange API. GET /api/reviews, GET /api/reviews.csv, POST /api/reviews\n',
          { headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8' } });
      }

      return json({ error: 'Not found' }, 404, cors);
    } catch (err) {
      console.error(err);
      return json({ error: 'Something went wrong saving or reading reviews.' }, 500, cors);
    }
  },
};

const norm = c => String(c || '').trim().toLowerCase();
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function codeOk(env, code) {
  if (env.GROUP_CODE) return norm(code) === norm(env.GROUP_CODE);
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'group_code_sha256'").first().catch(() => null);
  if (!row) return true;                                  // no code set: open
  return !!code && (await sha256(norm(code))) === row.value;
}

async function listReviews(env, number) {
  const sql = `SELECT number, by_name, city, date, score, tasting, profile, method, recipe, again, notes, verdict, brew, created_at, updated_at
               FROM reviews ${number ? 'WHERE number = ?1' : ''} ORDER BY number, created_at`;
  const stmt = number ? env.DB.prepare(sql).bind(number) : env.DB.prepare(sql);
  const { results } = await stmt.all();
  return results.map(row => ({
    number: row.number, by: row.by_name, city: row.city, date: row.date, score: row.score,
    tasting: parse(row.tasting, []), profile: parse(row.profile, {}), method: parse(row.method, []),
    recipe: row.recipe, again: row.again, notes: row.notes, verdict: row.verdict || '', brew: parse(row.brew, {}),
    created: row.created_at, updated: row.updated_at,
  }));
}

function validate(b) {
  const str = (v, max) => String(v ?? '').trim().slice(0, max);
  const list = (v, n, max) => (Array.isArray(v) ? v : []).map(x => str(x, max)).filter(Boolean).slice(0, n);
  const number = str(b.number, 3);
  if (!/^\d{1,3}$/.test(number)) return { error: 'Which coffee is this for?' };
  const by = str(b.by, 40);
  if (!by) return { error: 'Add your name.' };
  const score = Number(b.score);
  if (!Number.isInteger(score) || score < 1 || score > SCALE) return { error: `Score must be 1 to ${SCALE}.` };
  const profile = {};
  for (const k of PROFILE_KEYS) {
    const v = Number(b.profile?.[k]);
    if (Number.isInteger(v) && v >= 1 && v <= 5) profile[k] = v;
  }
  const num = (v, lo, hi) => { const n = Math.round(Number(v) * 10) / 10; return Number.isFinite(n) && n >= lo && n <= hi ? n : undefined; };
  const bw = b.brew || {}, brew = {};
  const dose = num(bw.dose, 1, 100), water = num(bw.water, 1, 2000), temp = num(bw.temp, 40, 100);
  if (dose !== undefined) brew.dose = dose;
  if (water !== undefined) brew.water = water;
  if (temp !== undefined) brew.temp = temp;
  if (str(bw.grinder, 40)) brew.grinder = str(bw.grinder, 40);
  if (str(bw.setting, 20)) brew.setting = str(bw.setting, 20);
  if (/^\d{1,2}:\d{2}$/.test(str(bw.time, 5))) brew.time = str(bw.time, 5);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(b.date)) ? String(b.date) : new Date().toISOString().slice(0, 10);
  return {
    number, by, score, profile, date,
    city: str(b.city, 40) || null,
    tasting: list(b.tasting, 40, 40),
    method: list(b.method, 10, 30),
    recipe: str(b.recipe, 200),
    again: AGAIN.includes(b.again) ? b.again : null,
    notes: str(b.notes, 4000),
    verdict: str(b.verdict, 80),
    brew,
  };
}

function toCSV(rows) {
  const head = ['Coffee', 'Name', 'City', 'Date', 'Score', 'Verdict', 'Tasting notes', ...PROFILE_KEYS.map(k => k[0].toUpperCase() + k.slice(1)),
                'Brew method', 'Coffee (g)', 'Water (g)', 'Ratio', 'Grinder', 'Setting', 'Water temp (C)', 'Brew time', 'Recipe', 'Buy a bag', 'Notes', 'Saved', 'Updated'];
  const cell = v => {
    const s = v == null ? '' : String(v);
    // stop spreadsheets reading text as formulas
    const safe = /^[=+\-@]/.test(s) ? "'" + s : s;
    return /[",\n\r]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe;
  };
  const lines = rows.map(r => [
    '#' + r.number, r.by, r.city, r.date, r.score, r.verdict, r.tasting.join(', '),
    ...PROFILE_KEYS.map(k => r.profile[k] ?? ''),
    r.method.join(', '), r.brew.dose ?? '', r.brew.water ?? '', r.brew.dose && r.brew.water ? '1:' + (r.brew.water / r.brew.dose).toFixed(1) : '',
    r.brew.grinder ?? '', r.brew.setting ?? '', r.brew.temp ?? '', r.brew.time ?? '', r.recipe, r.again, r.notes, r.created, r.updated,
  ].map(cell).join(','));
  return [head.map(cell).join(','), ...lines].join('\r\n') + '\r\n';
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const ok = ALLOWED_ORIGINS.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Group-Code',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' } });
const parse = (s, fallback) => { try { return JSON.parse(s); } catch { return fallback; } };
