# Cloudflare Worker

Saves the group's reviews in Cloudflare D1 and serves them to the site. Free plan. Roaster lookup will be added here next.

| Route | What |
| --- | --- |
| `GET /api/reviews` | `{scale, reviews:[...]}`, optional `?number=01` |
| `GET /api/reviews.csv` | One row per review, for Google Sheets: `=IMPORTDATA("https://<worker>/api/reviews.csv")` |
| `POST /api/reviews` | Save a review. One per person per coffee (name, case-insensitive); saving again replaces it |

- Database: D1 `coffee-exchange` (id in `wrangler.toml`), table from `migrations/0001_reviews.sql` (already applied to the live database).
- Allowed sites (CORS): ms-runs.github.io, migsousa.com, localhost.
- Optional secret `GROUP_CODE`: set it in the Worker's settings and the review page asks for the code once per phone before saving.
- The pages find the Worker through `assets/config.js` (`window.CX_API`). Empty means the review page falls back to copy and paste.

## Deploy

Connected to GitHub through Cloudflare Workers Builds: Workers & Pages → Create → Import a repository → `ms-runs/coffee-exchange`, root directory `worker`. Every push to `main` that touches `worker/` redeploys.

Local: `npx wrangler d1 migrations apply coffee-exchange --local` then `npx wrangler dev`.

## Manual checks and fixes

- Read: the Google Sheet above (refreshes about every hour), or open `/api/reviews.csv`.
- Fix or delete a review: Cloudflare dashboard → Storage & Databases → D1 → `coffee-exchange` → Console, e.g. `DELETE FROM reviews WHERE number = '01' AND by_key = 'ben';`
