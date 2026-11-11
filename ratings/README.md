# Rate a coffee

Roadmap step 3. One page per person per coffee: `ratings/?coffee=02` (this is what the QR code on each card will open).

- Coffee header in that coffee's colour; switch coffee from the header.
- Name and city (remembered on the phone), score out of 10 (required), tasting-note chips grouped as fruity, sweet, nutty, floral, spice and roast, other and texture, plus your own notes. Notes the roaster lists are marked with a dot.
- How it felt: acidity, body, sweetness, bitterness and finish on five steps each.
- Brew method chips and an optional recipe, "Would you buy a bag?", and free-text notes.
- Drafts save on the phone as you go. Saving shows a summary with "Copy for the group chat" and "Copy as data" (an entry for `data/reviews.json`).

Review shape in `data/reviews.json`:

```json
{"number":"01","by":"Miguel","city":"London","date":"2026-11-11","score":8,
 "tasting":["Cherry","Toffee"],"profile":{"acidity":3,"body":4},
 "method":["Moka pot"],"recipe":"15 g, medium heat","again":"yes","notes":"Sweeter as it cooled."}
```

Storage: Save posts to the Worker (`worker/`), which keeps reviews in Cloudflare D1; the site reads them back. Until `assets/config.js` points at the Worker, the page falls back to copying the review for the group chat.
