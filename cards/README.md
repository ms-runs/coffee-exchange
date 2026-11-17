# Card maker

Roadmap step 1. Swiss-grid A6 coffee cards, four to an A4 sheet. Live at `/cards/`.

- **Roaster link**: paste a coffee's shop page and it fills the name, roaster, details it finds, tasting notes, bag photo and number colour (via the Worker's `/api/lookup` and `/api/image`). Only rows the shop gives are added; the status line says what wasn't on the page, and Undo puts back the previous card. Works best on Shopify shops.
- **Start from** a coffee in `data/coffees.json`, your last card (kept in the browser), or a new coffee with the next number.
- **Form** for number, picked by, name, roaster and city; details rows can be renamed, added or removed; tasting notes comma-separated.
- **Bag photo**: drop or choose an image. It is flattened onto white and capped at 600 px (about 300 dpi at the card's photo size).
- **Number colour**: starts on the most colourful of the bag's 3 main colours (a small vivid print colour, like a logo on a dark pouch, is always one of them) (background white skipped, near-identical shades merged, each darkened in OKLab until it reaches 3:1 on white), or your own colour. Contrast is shown; anything under 3:1 gets a one-tap fix.
- **Print**: one A6 PDF, or add cards to a sheet and download A4 pages of four with faint cut guides.
- **Copy JSON** gives an entry for `data/coffees.json`; "Save photo for the repo" downloads the bag image named to match (`assets/bags/<number>-<name>.jpg`).

The preview and the PDF come from the same layout function and both use jsPDF's Helvetica metrics, so line breaks match. The card warns when the details run into the photo and notes.

jsPDF 2.5.2 is vendored in `vendor/` so the page has no CDN dependency.

Lives at https://ms-runs.github.io/coffee-exchange/cards/, with the same site menu as the other pages.

Layout spec: [`docs/card-design-spec.md`](../docs/card-design-spec.md).
