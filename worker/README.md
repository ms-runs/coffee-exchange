# Cloudflare Worker

Roadmap step 2. One Worker on the free plan that takes a roaster link and returns clean coffee fields.

1. Shopify shops: fetch `<product url>.json` for title, description, notes and bag image
2. Other shops: fetch the page and read JSON-LD / Open Graph tags
3. Later: ratings API in front of D1

Keep secrets in `.dev.vars` locally and Worker secrets in production; never commit them.
