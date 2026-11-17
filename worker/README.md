# Cloudflare Worker

Saves the group's reviews in Cloudflare D1 and serves them to the site, looks up roaster links, and saves new coffees from the card maker into this repo. Free plan.

| Route | What |
| --- | --- |
| `GET /api/reviews` | `{scale, reviews:[...]}`, optional `?number=01` |
| `GET /api/reviews.csv` | One row per review, for Google Sheets: `=IMPORTDATA("https://<worker>/api/reviews.csv")` |
| `POST /api/code` | `{ok}` for a group code, so the page can check it before saving |
| `POST /api/reviews` | Save a review (needs the group code). One per person per coffee (name, case-insensitive); saving again replaces it |
| `POST /api/coffees` | Save a coffee from the card maker (needs the group code). Commits `data/coffees.json` and the bag photo (`assets/bags/NN-name.jpg`) to `main` in one commit; Pages republishes in a minute or two. A number already on the site answers 409 unless `replace` is set. See `src/coffees.js` |
| `GET /api/lookup?url=` | Draft card fields from a roaster's product link: `{ok, source, name, roaster, details:[[label,value]], tastingNotes, origins, image, images}`. Cached for an hour |
| `GET /api/image?url=` | A product photo passed through (images only, up to 8 MB) so the card maker can read its colours |

- Database: D1 `coffee-exchange` (id in `wrangler.toml`), table from `migrations/0001_reviews.sql` (already applied to the live database).
- Allowed sites (CORS): ms-runs.github.io and localhost. The site is standalone (not embedded on migsousa.com).
- Group code: saving needs the group's code. Its SHA-256 (trimmed, lower-case) lives in the D1 `settings` table (`group_code_sha256`), so it can be changed from the D1 console without redeploying; see `migrations/0002_settings.sql`. No row = anyone can save. A `GROUP_CODE` secret, if set, takes priority. The review page asks for the code once per phone and checks it as you type (`POST /api/code`).
- The pages find the Worker through `assets/config.js` (`window.CX_API`). Empty means the review page falls back to copy and paste.

## Saving coffees: one-time setup

The Worker writes to GitHub with a token, kept as a Worker secret (never in the repo):

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
   Repository access: **Only select repositories** → `ms-runs/coffee-exchange`. Permissions: **Contents: Read and write** (Metadata read-only is added for you). Pick the longest expiry and note the date.
2. Cloudflare dashboard → Workers & Pages → `coffee-exchange` → Settings → Variables and Secrets → Add → Type **Secret**, name `GITHUB_TOKEN`, paste the token → Deploy.

Until the secret is there, `POST /api/coffees` answers 503 and the card maker says to use Copy JSON. When the token expires, saving shows "The token on the Worker may have expired": make a new one and replace the secret.

Commits show as made by the token's owner, with the message `Add coffee 03: <name>, picked by <name>`.

## Deploy

Live at https://coffee-exchange.migsousa2.workers.dev (deployed 17 Nov 2026).

Connected to GitHub through Cloudflare Workers Builds: Workers & Pages → Create → Import a repository → `ms-runs/coffee-exchange`, root directory `worker`. Every push to `main` that touches `worker/` redeploys.

Local: `npx wrangler d1 migrations apply coffee-exchange --local` then `npx wrangler dev`.

## Manual checks and fixes

- Read: the Google Sheet above (refreshes about every hour), or open `/api/reviews.csv`.
- Fix or delete a review: Cloudflare dashboard → Storage & Databases → D1 → `coffee-exchange` → Console, e.g. `DELETE FROM reviews WHERE number = '01' AND by_key = 'ben';`

## Roaster lookup (`src/lookup.js`)

Reads the Shopify feed (`<product link>.json`) and the product page together:

- **Name and roaster:** feed title and vendor; a generic vendor ("My Store") falls back to the page's `og:site_name` or title. Bracketed origins and `| Espresso blend` suffixes come off the name (the suffix becomes a Style row).
- **Details:** `Label: value` lines (Origin, Blend/Components, Process, Variety, Altitude, Roast, Harvest, Producer) in the description first, then the page. Several origins collapse to countries; altitudes become one range.
- **Fallbacks:** countries named in the description or a "Coffee profile" section; washed/natural words for process; roast words or tags.
- **Tasting notes:** a labelled line, a "Tasting notes" heading with short lines under it, or prose like "we are tasting …" / "layers of …".
- Page forms, variant pickers and shop text ("sold out") are skipped. Countries match case-sensitively, so a shop's initials (e.g. DRC) don't count.

Checked on Carter Coffee, Little Wolf, Deeper Roots and Seattle Coffee Gear (Nov 2026). Retailers (like Seattle Coffee Gear) give less than the roaster's own shop.
