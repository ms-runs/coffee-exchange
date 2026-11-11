# Rate a coffee

Roadmap step 3. One page per person per coffee: `ratings/?coffee=02` (this is what the QR code on each card will open).

- Coffee header in that coffee's colour; switch coffee from the header.
- Name and city (remembered on the phone), score out of 10 (required), tasting-note chips grouped as fruity, sweet, nutty, floral, spice and roast, other and texture, plus your own notes. Notes the roaster lists are marked with a dot.
- How it felt: acidity, body, sweetness, bitterness and finish on five steps each.
- A one-line verdict under the score (typed, or a quick pick like "Best so far").
- Brew method chips and optional recipe details in a fold-out: coffee and water in grams (ratio worked out), grinder and setting, water temperature, brew time, plus anything else about the recipe.
- "Would you buy a bag?" and free-text notes.
- Drafts save on the phone as you go. Saving shows a summary with "Copy for the group chat" and "Copy as data" (an entry for `data/reviews.json`).

Review shape in `data/reviews.json`:

```json
{"number":"01","by":"Miguel","city":"London","date":"2026-11-11","score":8,"verdict":"Best so far",
 "tasting":["Cherry","Toffee"],"profile":{"acidity":3,"body":4},
 "method":["Pour-over"],"brew":{"dose":15,"water":250,"grinder":"Comandante","setting":"24 clicks","temp":94,"time":"2:40"},"recipe":"30 s bloom","again":"yes","notes":"Sweeter as it cooled."}
```

Storage: Save posts to the Worker (`worker/`), which keeps reviews in Cloudflare D1; the site reads them back. Until `assets/config.js` points at the Worker, the page falls back to copying the review for the group chat.
