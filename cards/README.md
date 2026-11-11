# Card maker

Roadmap step 1. Swiss-grid A6 coffee cards, four to an A4 sheet. Live at `/cards/`.

- **Start from** a coffee in `data/coffees.json`, your last card (kept in the browser), or a new coffee with the next number.
- **Form** for number, picked by, name, roaster and city; details rows can be renamed, added or removed; tasting notes comma-separated.
- **Bag photo**: drop or choose an image. It is flattened onto white and capped at 600 px (about 300 dpi at the card's photo size).
- **Number colour**: the bag's 3 main colours (background white skipped, near-identical shades merged, each darkened in OKLab until it reaches 3:1 on white), or your own colour. Contrast is shown; anything under 3:1 gets a one-tap fix.
- **Print**: one A6 PDF, or add cards to a sheet and download A4 pages of four with faint cut guides.
- **Copy JSON** gives an entry for `data/coffees.json`; "Save photo for the repo" downloads the bag image named to match (`assets/bags/<number>-<name>.jpg`).

The preview and the PDF come from the same layout function and both use jsPDF's Helvetica metrics, so line breaks match. The card warns when the details run into the photo and notes.

jsPDF 2.5.2 is vendored in `vendor/` so the page has no CDN dependency.

Embed on migsousa.com:

```html
<iframe src="https://ms-runs.github.io/coffee-exchange/cards/"
        style="width:100%;height:1900px;border:0" title="Coffee card maker"></iframe>
```

Layout spec: [`docs/card-design-spec.md`](../docs/card-design-spec.md).
