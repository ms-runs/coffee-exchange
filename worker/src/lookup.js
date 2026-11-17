// Roaster lookup: turn a product link into draft card fields.
//
// Sources, best first:
//   1. Shopify's product feed (<product link>.json): title, vendor, description, tags, photos
//   2. The product page itself: og: tags, schema.org Product data, and labelled sections
//      (some shops keep tasting notes and origins in page sections, not in the description)
//
// Everything here is plain string work (no DOM), so it runs the same in the Worker, in Node tests
// and in a browser console.

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

// Coffee-growing countries: [what we print, how the globe (Natural Earth) spells it, other spellings]
const COUNTRIES = [
  ['Brazil'], ['Colombia'], ['Ethiopia'], ['Kenya'], ['Guatemala'], ['Honduras'], ['Costa Rica'], ['El Salvador'],
  ['Nicaragua'], ['Panama'], ['Mexico', 'Mexico', ['México']], ['Peru', 'Peru', ['Perú']], ['Bolivia'], ['Ecuador'],
  ['Rwanda'], ['Burundi'], ['Uganda'], ['Tanzania'], ['DR Congo', 'Dem. Rep. Congo', ['Democratic Republic of the Congo', 'Democratic Republic of Congo', 'DR Congo']],
  ['Yemen'], ['India'], ['Indonesia', 'Indonesia', ['Sumatra', 'Java', 'Sulawesi', 'Bali', 'Flores']], ['Vietnam', 'Vietnam', ['Viet Nam']],
  ['China', 'China', ['Yunnan']], ['Myanmar'], ['Laos'], ['Thailand'], ['Philippines'], ['Papua New Guinea'],
  ['Timor-Leste', 'Timor-Leste', ['East Timor']], ['Jamaica'], ['Haiti'], ['Dominican Republic', 'Dominican Rep.'], ['Cuba'], ['Puerto Rico'],
  ['Hawaii', 'United States of America', ['Kona']], ['Malawi'], ['Zambia'], ['Zimbabwe'], ['Cameroon'], ["Côte d'Ivoire", "Côte d'Ivoire", ['Ivory Coast']],
  ['Madagascar'], ['Venezuela'], ['Taiwan'], ['Nepal'], ['Australia'],
].map(([name, ne, alts]) => {
  // case-sensitive (Title Case or ALL CAPS), so words like "java" or a shop's initials don't count
  const words = [name, ...(alts || [])].flatMap(w => [w, w.toUpperCase()]);
  return { name, ne: ne || name, re: new RegExp('(?<![\\w-])(' + words.map(escRe).join('|') + ')(?![\\w-])') };
});

// "Label: value" lines we understand. Order = order on the card.
const LABELS = [
  ['Origin',   /^(origins?|country|countries|region|growing region)$/i],
  ['Blend',    /^(blend|components?|current components?|composition|blend components?)$/i],
  ['Process',  /^(process|processing|processing method|process method)$/i],
  ['Variety',  /^(varietals?|variet(?:y|ies)|cultivars?)$/i],
  ['Altitude', /^(altitude|elevation|growing altitude|masl)$/i],
  ['Roast',    /^(roast|roast level|roast profile|roast degree)$/i],
  ['Harvest',  /^(harvest|harvested|harvest season|crop)$/i],
  ['Producer', /^(producers?|farm|farmer|estate|washing station|cooperative|co-op|grower)$/i],
  ['Notes',    /^(tasting notes?|flavou?r notes?|cup notes?|notes|we taste|we're tasting|tastes? like|flavou?r profile|cupping notes?)$/i],
];
const labelOf = s => { const t = s.trim().replace(/[:\s]+$/, ''); const hit = LABELS.find(([, re]) => re.test(t)); return hit ? hit[0] : null; };

const GENERIC_VENDOR = /^(my store|shop|store|default|vendor|unknown|)$/i;

/* ---------- entry point (Worker) ---------- */
export async function lookup(rawUrl) {
  const url = cleanUrl(rawUrl);
  if (!url) return { ok: false, error: 'That does not look like a web link.' };

  const shopifyPath = /\/products\/[^/?#]+/.exec(url.pathname);
  const feedUrl = shopifyPath ? url.origin + shopifyPath[0] + '.json' : null;
  const [feed, html] = await Promise.all([
    feedUrl ? get(feedUrl, 'json') : null,
    get(url.href, 'text'),
  ]);
  const product = feed && feed.product ? feed.product : null;
  if (!product && !html) return { ok: false, error: 'The shop did not let us read that page. Fill the card in by hand.' };
  return { ok: true, url: url.href, ...extract({ product, html: html || '', url: url.href }) };
}

async function get(href, as) {
  try {
    const r = await fetch(href, { headers: { 'User-Agent': UA, 'Accept': as === 'json' ? 'application/json' : 'text/html,*/*' },
      redirect: 'follow', signal: AbortSignal.timeout(9000), cf: { cacheTtl: 3600 } });
    if (!r.ok) return null;
    if (as === 'json') { try { return await r.json(); } catch { return null; } }
    const t = await r.text();
    return t.length > 3_000_000 ? t.slice(0, 3_000_000) : t;
  } catch { return null; }
}

function cleanUrl(s) {
  try {
    const u = new URL(String(s || '').trim());
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = '';
    return u;
  } catch { return null; }
}

/* ---------- pure extraction (tested in Node and in a browser) ---------- */
export function extract({ product, html, url }) {
  const meta = readMeta(html);
  const ld = readLdProduct(html);
  const found = [];

  // Name and roaster
  const rawTitle = (product && product.title) || ld.name || meta['og:title'] || titleTag(html) || '';
  let roaster = [product && product.vendor, ld.brand, meta['og:site_name'], titleSuffix(html)]
    .map(s => decode(String(s || '')).trim()).find(s => s && !GENERIC_VENDOR.test(s)) || '';
  const { name, style } = splitTitle(decode(rawTitle), roaster);
  if (name) found.push('name');
  if (roaster) found.push('roaster');

  // Text to read: the description first, then the page (only for what the description lacks)
  const descText = htmlToText((product && product.body_html) || ld.description || '');
  const pageText = htmlToText(html);
  const desc = readText(descText);
  const page = readText(pageText);

  const pick = k => desc.fields[k] && desc.fields[k].length ? desc.fields[k] : (page.fields[k] || []);
  const details = [];

  // Origin: labelled origins, else countries named in the description or a coffee profile section
  let originVals = pick('Origin');
  let countries = uniq(originVals.flatMap(findCountries));
  if (!countries.length) countries = findCountries(descText);
  if (!countries.length) countries = findCountries(profileSections(pageText));
  if (!countries.length && desc.fields.Blend) countries = findCountries(desc.fields.Blend.join(' '));
  if (!countries.length && product && product.tags) countries = findCountries(tagList(product.tags).join(', '));
  const origins = countries.map(c => c.ne);
  let originText = '';
  if (originVals.length === 1 && originVals[0].length <= 60) originText = originVals[0];
  else if (countries.length) originText = countries.map(c => c.name).join(', ');
  if (originText) details.push(['Origin', originText]);

  const blend = pick('Blend');
  if (blend.length) details.push(['Blend', blend.join('; ').replace(/\s*\|\s*/g, ' / ')]);

  // Process: labelled, else washed/natural/honey words in the description
  let process = uniqCase(pick('Process').map(cap));
  if (!process.length) process = processWords(descText + '\n' + blend.join(' '));
  if (process.length) details.push(['Process', joinAnd(process)]);

  const variety = uniqCase(pick('Variety').flatMap(v => v.split(/\s*[,/&]\s*|\s+and\s+/)).map(cap).filter(Boolean));
  if (variety.length) details.push(['Variety', variety.join(', ')]);

  const alt = altitude(pick('Altitude'));
  if (alt) details.push(['Altitude', alt]);

  let roast = pick('Roast')[0] || roastWords(descText) || roastFromTags(product && product.tags);
  if (roast) details.push(['Roast', cap(roast)]);

  const harvest = pick('Harvest')[0];
  if (harvest) details.push(['Harvest', harvest]);

  const producer = pick('Producer');
  if (producer.length === 1) details.push(['Producer', producer[0]]);

  if (style) details.push(['Style', style]);

  // Tasting notes: labelled line, a heading followed by short lines, or "we're tasting …" prose
  let notes = desc.notes.length ? desc.notes : prose(descText);
  if (!notes.length) notes = page.notes;
  notes = notes.slice(0, 5).map((n, i) => i ? n.toLowerCase() : n);

  // Photos: feed images first, then og:image / schema image
  const images = uniq([
    ...((product && product.images) || []).map(i => i.src || i),
    ld.image, meta['og:image:secure_url'], meta['og:image'],
  ].filter(Boolean).map(s => absolute(String(s), url))).slice(0, 6);

  return {
    source: product ? 'shopify' : 'page',
    name, roaster, roasterCity: '',
    details, tastingNotes: notes, origins,
    image: images[0] || null, images,
    found: [...found, ...details.map(d => d[0].toLowerCase()), ...(notes.length ? ['notes'] : []), ...(images.length ? ['photo'] : [])],
  };
}

/* ---------- reading text ---------- */
function readText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fields = {}, notes = [];
  const add = (k, v) => { v = tidy(v); if (!v || v.length > 160 || shopJunk(v)) return; (fields[k] = fields[k] || []).push(v); };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // "Label: value" (also "Label – value")
    const m = /^([A-Za-z][A-Za-z' /-]{1,28}?)\s*[:：]\s*(.+)$/.exec(line) || /^([A-Za-z][A-Za-z' ]{1,20}?)\s+[–—]\s+(.+)$/.exec(line);
    if (m) {
      const k = labelOf(m[1]);
      if (k === 'Notes') { if (!notes.length) notes.push(...splitNotes(m[2])); continue; }
      if (k) { add(k, m[2]); continue; }
    }
    // A label on its own line, value(s) underneath
    const k = labelOf(line);
    if (k && line.length <= 30) {
      if (k === 'Notes') {
        if (notes.length) continue;
        const next = lines[i + 1] || '';
        if (/[,|•·]/.test(next) && next.length <= 120) { notes.push(...splitNotes(next)); i++; continue; }
        const items = [];
        for (let j = i + 1; j < lines.length && items.length < 6; j++) {
          const l = lines[j];
          if (labelOf(l) || l.length > 28 || l.split(/\s+/).length > 4 || /[.!?]$/.test(l) || isShout(l)) break;
          items.push(l);
        }
        if (items.length >= 2) { notes.push(...items.map(noteCase)); i += items.length; }
        continue;
      }
      const next = lines[i + 1];
      if (next && next.length <= 80 && !labelOf(next) && !/[.!?]$/.test(next)) { add(k, next); i++; }
    }
  }
  return { fields, notes: notes.filter(Boolean) };
}

function splitNotes(s) {
  return tidy(s).replace(/\.$/, '').split(/\s*(?:,|\||•|·|\/|;|\+)\s*|\s+(?:and|&)\s+/i)
    .map(x => x.replace(/^(?:and|a|an|the|notes of|hints? of)\s+/i, '').replace(/\s+(?:flavou?rs?|notes|finish)$/i, m => /finish/i.test(m) ? m : '').trim())
    .filter(x => x && x.length <= 30 && x.split(/\s+/).length <= 4)
    .map(noteCase);
}
const noteCase = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

// "We are tasting blueberry jam, chocolate and hazelnut." / "layers of cherry, toffee … flavors"
function prose(text) {
  const res = [
    /(?:we(?:'re| are)? tasting|we taste|tasting notes? (?:of|are|include)|cup(?:s)? (?:of|with))\s+([^.\n]{3,140})/i,
    /(?:notes of|flavou?rs? of|layers of|hints of|tastes? (?:of|like))\s+([^.\n]{3,140})/i,
  ];
  for (const re of res) {
    const m = re.exec(text);
    if (!m) continue;
    const notes = splitNotes(m[1].replace(/\s+(?:when|in|as|with|that|which)\b.*$/i, ''));
    if (notes.length >= 2) return notes;
  }
  return [];
}

// Text that sits under a "coffee profile / about this coffee / origin / story" heading
function profileSections(text) {
  const lines = text.split('\n');
  const under = re => lines.flatMap((l, i) => re.test(l.trim()) ? [lines.slice(i + 1, i + 3).join(' ')] : []).join('\n');
  // sections about the coffee itself first; general "about" text often tells the roaster's story instead
  const close = under(/^(coffee profile|about (?:this|the) coffee|the coffee|origins?|sourcing|where it'?s from)$/i);
  if (findCountries(close).length) return close;
  return under(/^(behind the cup|story|the story|about)$/i);
}

function findCountries(text) {
  const hits = [];
  for (const c of COUNTRIES) {
    const m = c.re.exec(text);
    if (m && !hits.some(h => h.c.name === c.name)) hits.push({ c, at: m.index });
  }
  return hits.sort((a, b) => a.at - b.at).map(h => h.c);
}

function processWords(text) {
  const words = [['Washed', /\b(washed|fully washed|wet[- ]processed)\b/i], ['Natural', /\b(natural|dry[- ]processed|sun[- ]dried)\b/i],
    ['Honey', /\b(honey|pulped natural)\b/i], ['Anaerobic', /\banaerobic\b/i], ['Wet-hulled', /\bwet[- ]hulled\b/i], ['Carbonic maceration', /\bcarbonic maceration\b/i]];
  const hits = words.map(([w, re]) => { const m = re.exec(text); return m ? { w, at: m.index } : null; }).filter(Boolean);
  return hits.sort((a, b) => a.at - b.at).map(h => h.w);
}

function roastWords(text) {
  const m = /\b(light|medium|dark|filter|espresso|omni)(?:[- ](?:to|–)[- ](light|medium|dark))?[- ]roast(?:ed)?\b/i.exec(text);
  return m ? (m[2] ? `${m[1]}–${m[2]}` : m[1]).toLowerCase() : '';
}
function roastFromTags(tags) {
  const t = tagList(tags).find(x => /^(light|medium|dark|light[- ]medium|medium[- ]dark)( roast)?$/i.test(x));
  return t ? t.replace(/ roast$/i, '').replace(/[- ]/, '–') : '';
}
const tagList = tags => (Array.isArray(tags) ? tags : String(tags || '').split(',')).map(s => s.trim()).filter(Boolean);

function altitude(vals) {
  const nums = vals.join(' ').replace(/(\d),(\d{3})/g, '$1$2').match(/\d{3,4}/g);
  if (!nums) return vals[0] || '';
  const n = nums.map(Number).filter(x => x >= 200 && x <= 3500);
  if (!n.length) return vals[0] || '';
  const lo = Math.min(...n), hi = Math.max(...n);
  return (lo === hi ? lo : `${lo}–${hi}`) + ' masl';
}

/* ---------- titles ---------- */
function splitTitle(title, roaster) {
  let t = title.replace(/\s+/g, ' ').trim(), style = '';
  if (roaster) t = t.replace(new RegExp('^' + escRe(roaster) + '\\s*[-–—|:]\\s*', 'i'), '');
  const bar = /^(.+?)\s+[|]\s+(.+)$/.exec(t);
  if (bar) { t = bar[1]; style = cap(bar[2].toLowerCase()); }
  t = t.replace(/\s*\((?:[^)]*)\)\s*$/, '')             // "(Ethiopia, Brazil, Ethiopia)"
       .replace(/\s*[-–—]\s*\d+\s?(?:g|kg|oz|lb)s?\b.*$/i, '')
       .replace(/\s+(?:subscription)$/i, '').trim();
  return { name: t, style };
}
function titleTag(html) { const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html); return m ? decode(m[1]).trim() : ''; }
function titleSuffix(html) { const m = /\s[–—|-]\s([^–—|]+)$/.exec(titleTag(html)); return m ? m[1].trim() : ''; }

/* ---------- page metadata ---------- */
function readMeta(html) {
  const out = {};
  const re = /<meta\s+[^>]*>/gi; let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const key = attr(tag, 'property') || attr(tag, 'name');
    const val = attr(tag, 'content');
    if (key && val != null && !(key in out)) out[key.toLowerCase()] = decode(val);
  }
  return out;
}
function attr(tag, name) { const m = new RegExp('\\s' + name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i').exec(tag); return m ? (m[2] ?? m[3]) : null; }

function readLdProduct(html) {
  const re = /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi; let m;
  while ((m = re.exec(html))) {
    let data; try { data = JSON.parse(m[1].trim()); } catch { continue; }
    const all = [].concat(data, data['@graph'] || []).flat();
    const p = all.find(x => x && /^(Product|ProductGroup)$/.test([].concat(x['@type'])[0]));
    if (p) {
      const img = [].concat(p.image || (p.hasVariant && p.hasVariant[0] && p.hasVariant[0].image) || [])[0];
      return { name: p.name || '', description: p.description || '', brand: typeof p.brand === 'string' ? p.brand : (p.brand && p.brand.name) || '',
        image: typeof img === 'string' ? img : (img && img.url) || '' };
    }
  }
  return {};
}

/* ---------- small helpers ---------- */
export function htmlToText(html) {
  return decode(String(html || '')
    .replace(/<(script|style|svg|noscript|template|head|iframe|select|button|form|fieldset|variant-selects|variant-radios|variant-picker|product-form|nav)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li|ul|ol|h[1-6]|tr|td|th|dt|dd|summary|details|section|article|header|footer|table|span class="metafield[^"]*")\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ''))
    .replace(/[ \t\u00a0]+/g, ' ')
    .split('\n').map(l => l.trim()).filter(Boolean).join('\n');
}
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…', eacute: 'é', egrave: 'è', ntilde: 'ñ', oacute: 'ó', iacute: 'í', aacute: 'á', uacute: 'ú', ocirc: 'ô', deg: '°' };
function decode(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENT[e.toLowerCase()] ?? m));
}
function absolute(src, base) { try { const u = new URL(src.startsWith('//') ? 'https:' + src : src, base); u.protocol = 'https:'; return u.href; } catch { return src; } }
function tidy(s) { return String(s || '').replace(/\s+/g, ' ').replace(/^[\s:–—-]+|[\s,;]+$/g, '').trim(); }
const cap = s => { s = tidy(s); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
const uniq = a => [...new Set(a)];
const uniqCase = a => a.filter((x, i) => a.findIndex(y => y.toLowerCase() === x.toLowerCase()) === i);
const joinAnd = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1].toLowerCase();
// shop interface text that slips into page text (buttons, stock messages, words run together from hidden labels)
const shopJunk = s => /sold out|unavailable|add to (?:cart|bag|basket)|select (?:a|an|your)|out of stock|subscribe|quantity/i.test(s) || /[a-z][A-Z][a-z]/.test(s);
const isShout = s => s.length > 3 && s === s.toUpperCase() && /[A-Z]{3}/.test(s) && /\s/.test(s);
function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
