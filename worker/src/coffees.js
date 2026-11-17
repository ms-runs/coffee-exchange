// Saving a coffee from the card maker: POST /api/coffees.
//
// The coffee goes into data/coffees.json in the GitHub repo (and its bag photo into assets/bags/), in one commit
// on main, so the repo stays the one place the site's data lives. GitHub Pages republishes in a minute or two.
//
// Needs a GITHUB_TOKEN secret on the Worker: a fine-grained token for ms-runs/coffee-exchange with
// Contents: read and write. Without it the route answers 503 and the card maker falls back to Copy JSON.
//
// Body: { code, coffee: {number, name, roaster, roasterCity, pickedBy, colour, origins, details, tastingNotes, link},
//         photo?: 'data:image/jpeg;base64,…', keepPhoto?: 'assets/bags/03-name.jpg', replace?: true }
// A number already on the site answers 409 {exists, name} unless replace is true.
//
// Removing: POST /api/coffees/remove { code, number, withReviews? } takes the entry out of data/coffees.json and
// deletes its bag photo (if no other coffee uses it) in one commit. If the coffee has ratings in D1 it answers
// 409 {reviews, name} unless withReviews is true; then the ratings are deleted too, so a reused number starts clean.

const REPO = 'ms-runs/coffee-exchange';
const BRANCH = 'main';
const DATA_PATH = 'data/coffees.json';
const MAX_PHOTO_BYTES = 1.5e6;
const ORDER = ['number', 'name', 'roaster', 'roasterCity', 'pickedBy', 'colour', 'origins', 'details', 'tastingNotes', 'bagImage', 'link'];

export class SaveError extends Error {
  constructor(message, status = 400, extra = {}) { super(message); this.status = status; this.extra = extra; }
}

export async function saveCoffee(env, body) {
  if (!env.GITHUB_TOKEN) throw new SaveError('Saving to the site is not set up yet. Use Copy JSON for now.', 503, { code: 'not_set_up' });

  const coffee = validateCoffee(body.coffee || {});
  const photo = body.photo ? decodePhoto(body.photo) : null;
  const keep = typeof body.keepPhoto === 'string' && /^assets\/bags\/[\w.-]+\.(jpe?g|png|webp)$/i.test(body.keepPhoto) ? body.keepPhoto : null;
  const photoPath = photo ? `assets/bags/${coffee.number}-${slug(coffee.name)}.jpg` : null;
  coffee.bagImage = photoPath || keep || null;

  // Read main, change the list, commit. If main moved in between (someone else saved), go round once more.
  for (let attempt = 0; ; attempt++) {
    const gh = github(env.GITHUB_TOKEN);
    const ref = await gh('GET', `/git/ref/heads/${BRANCH}`);
    const head = await gh('GET', `/git/commits/${ref.object.sha}`);
    const text = await gh('GET', `/contents/${DATA_PATH}?ref=${ref.object.sha}`, null, 'raw');

    let data;
    try { data = JSON.parse(text); } catch { throw new SaveError('data/coffees.json on GitHub is not valid JSON. Fix it there first.', 500); }
    const list = Array.isArray(data.coffees) ? data.coffees : (data.coffees = []);
    const i = list.findIndex(c => String(c.number) === coffee.number);
    if (i >= 0 && !body.replace) throw new SaveError(`Coffee ${coffee.number} is already on the site.`, 409, { exists: true, name: list[i].name || '' });

    const entry = ordered(i >= 0 ? { ...list[i], ...coffee } : coffee);
    if (i >= 0) list[i] = entry; else list.push(entry);
    list.sort((a, b) => (parseInt(a.number, 10) || 0) - (parseInt(b.number, 10) || 0));

    const tree = [{ path: DATA_PATH, mode: '100644', type: 'blob', content: JSON.stringify(data, null, 2) + '\n' }];
    if (photo) {
      const blob = await gh('POST', '/git/blobs', { content: photo, encoding: 'base64' });
      tree.push({ path: photoPath, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const newTree = await gh('POST', '/git/trees', { base_tree: head.tree.sha, tree });
    const who = coffee.pickedBy ? `, picked by ${coffee.pickedBy}` : '';
    const commit = await gh('POST', '/git/commits', {
      message: `${i >= 0 ? 'Update' : 'Add'} coffee ${coffee.number}: ${coffee.name}${who}\n\nSaved from the card maker.`,
      tree: newTree.sha, parents: [ref.object.sha],
    });
    try {
      await gh('PATCH', `/git/refs/heads/${BRANCH}`, { sha: commit.sha, force: false });
    } catch (err) {
      if (err.status === 422 && attempt < 2) continue;      // main moved: rebuild on top of it
      throw err;
    }
    return { ok: true, replaced: i >= 0, coffee: entry, commit: `https://github.com/${REPO}/commit/${commit.sha}` };
  }
}

export async function removeCoffee(env, body) {
  if (!env.GITHUB_TOKEN) throw new SaveError('Removing from the site is not set up yet.', 503, { code: 'not_set_up' });
  const raw = String(body.number ?? '').trim();
  if (!/^\d{1,3}$/.test(raw)) throw new SaveError('Which coffee should be removed?');
  const number = raw.padStart(2, '0');

  const { count } = await env.DB.prepare('SELECT COUNT(*) AS count FROM reviews WHERE number = ?1').bind(number).first();

  for (let attempt = 0; ; attempt++) {
    const gh = github(env.GITHUB_TOKEN);
    const ref = await gh('GET', `/git/ref/heads/${BRANCH}`);
    const head = await gh('GET', `/git/commits/${ref.object.sha}`);
    const text = await gh('GET', `/contents/${DATA_PATH}?ref=${ref.object.sha}`, null, 'raw');
    let data;
    try { data = JSON.parse(text); } catch { throw new SaveError('data/coffees.json on GitHub is not valid JSON. Fix it there first.', 500); }
    const list = Array.isArray(data.coffees) ? data.coffees : [];
    const i = list.findIndex(c => String(c.number) === number);
    if (i < 0) throw new SaveError(`Coffee ${number} is not on the site.`, 404, { code: 'not_found' });
    const gone = list[i];
    if (count > 0 && !body.withReviews) throw new SaveError(`Coffee ${number} has ${count} rating${count === 1 ? '' : 's'}.`, 409, { reviews: count, name: gone.name || '' });

    list.splice(i, 1);
    const tree = [{ path: DATA_PATH, mode: '100644', type: 'blob', content: JSON.stringify(data, null, 2) + '\n' }];
    const photo = typeof gone.bagImage === 'string' && /^assets\/bags\/[\w.-]+$/.test(gone.bagImage) ? gone.bagImage : null;
    if (photo && !list.some(c => c.bagImage === photo) && await gh('GET', `/contents/${photo}?ref=${ref.object.sha}`, null, null, true)) {
      tree.push({ path: photo, mode: '100644', type: 'blob', sha: null });   // sha null deletes the file
    }
    const newTree = await gh('POST', '/git/trees', { base_tree: head.tree.sha, tree });
    const commit = await gh('POST', '/git/commits', {
      message: `Remove coffee ${number}: ${gone.name || ''}\n\nRemoved from the card maker${count && body.withReviews ? `, with its ${count} rating${count === 1 ? '' : 's'}` : ''}.`,
      tree: newTree.sha, parents: [ref.object.sha],
    });
    try {
      await gh('PATCH', `/git/refs/heads/${BRANCH}`, { sha: commit.sha, force: false });
    } catch (err) {
      if (err.status === 422 && attempt < 2) continue;
      throw err;
    }
    let reviewsDeleted = 0;
    if (count > 0 && body.withReviews) {
      const r = await env.DB.prepare('DELETE FROM reviews WHERE number = ?1').bind(number).run();
      reviewsDeleted = r.meta?.changes ?? count;
    }
    return { ok: true, number, name: gone.name || '', photoDeleted: tree.length > 1, reviewsDeleted, commit: `https://github.com/${REPO}/commit/${commit.sha}` };
  }
}

export function validateCoffee(c) {
  const str = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  const list = (v, n, max) => (Array.isArray(v) ? v : []).map(x => str(x, max)).filter(Boolean).slice(0, n);
  const num = str(c.number, 3);
  if (!/^\d{1,3}$/.test(num) || Number(num) < 1) throw new SaveError('Give the coffee a number, like 03.');
  const name = str(c.name, 80);
  if (!name) throw new SaveError('Add the coffee\'s name.');
  const link = str(c.link, 500);
  const details = (Array.isArray(c.details) ? c.details : [])
    .map(r => Array.isArray(r) ? [str(r[0], 40), str(r[1], 200)] : null)
    .filter(r => r && r[0] && r[1]).slice(0, 20);
  return {
    number: num.padStart(2, '0'),
    name,
    roaster: str(c.roaster, 80),
    roasterCity: str(c.roasterCity, 60) || null,
    pickedBy: str(c.pickedBy, 40) || null,
    colour: /^#[0-9a-f]{6}$/i.test(c.colour || '') ? c.colour.toUpperCase() : '#1A3FA0',
    origins: list(c.origins, 12, 60),
    details,
    tastingNotes: list(c.tastingNotes, 20, 40),
    link: /^https?:\/\//i.test(link) ? link : '',
  };
}

function decodePhoto(dataUrl) {
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl));
  if (!m || !m[1].startsWith('/9j/')) throw new SaveError('The bag photo should be a JPEG.');
  if (m[1].length * 0.75 > MAX_PHOTO_BYTES) throw new SaveError('The bag photo is too big (1.5 MB at most).', 413);
  return m[1];
}

function ordered(o) {
  const out = {};
  for (const k of ORDER) if (k in o) out[k] = o[k];
  for (const k of Object.keys(o)) if (!(k in out)) out[k] = o[k];   // keep any fields added by hand
  return out;
}

const slug = s => (s || 'coffee').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'coffee';

function github(token) {
  return async (method, path, body, accept, allow404) => {
    const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': accept === 'raw' ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'coffee-exchange-worker',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 404 && allow404) return null;
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('GitHub', method, path, res.status, detail.slice(0, 300));
      const msg = res.status === 401 || res.status === 403 || res.status === 404
        ? 'The site could not write to GitHub. The token on the Worker may have expired or lack Contents access.'
        : 'GitHub did not accept the save. Try again in a minute.';
      const err = new SaveError(msg, res.status === 422 ? 422 : 502, { code: 'github' });
      err.status = res.status === 422 ? 422 : 502;
      throw err;
    }
    return accept === 'raw' ? res.text() : res.json();
  };
}
