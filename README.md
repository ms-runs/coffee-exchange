# Round

Round is the coffee exchange: a rotating coffee swap between friends in Cincinnati, New York, London and Barcelona, plus the web tools that run it. Each turn, one person picks one or two coffees and posts a small bag of each to everyone, with a printed card. The group tastes, rates and catches up.

Live: https://ms-runs.github.io/coffee-exchange/ (embedded on migsousa.com with a Squarespace Code block, same as Zine Maker)

## What's here

| Folder | What | Status |
| --- | --- | --- |
| [`globe/`](globe/) | Turning dot globe. **Our cities**: cup pins, swap-ring routes, local times. **Coffees we've tried**: origin countries lit in each coffee's number colour | First version |
| [`cards/`](cards/) | A6 card maker, Swiss grid, jsPDF export | First version |
| [`worker/`](worker/) | Cloudflare Worker: roaster link → coffee fields | Next |
| [`ratings/`](ratings/) | Ratings grid and review forms | Planned |
| [`about/`](about/) | Who we are and how a turn works; people come from `data/people.json` | First version |
| [`index.html`](index.html) | The site: the record of every coffee by number, a page per coffee with ratings, and the globe beside it (they talk via `postMessage`) | Draft |
| [`data/`](data/) | `coffees.json`, `cities.json`, `people.json`, `reviews.json` (empty until ratings open), one JSON file per round in `rounds/` | Started |
| [`assets/`](assets/) | Shared brand files (`round.css`, `round.js`, Outfit fonts, icons), theme script, bag photos | Started |
| [`docs/`](docs/) | Project brief and card design spec | |
| [`tools/`](tools/) | Build scripts (land dots for the globe) | |

## Stack

Vanilla JS and static files on GitHub Pages. No build step for the pages. Free Cloudflare services (one Worker, D1 if needed) for lookups and saved ratings. No Supabase.

## Globe embed options

`globe/index.html` takes query options: `?bg=transparent`, `?controls=0`, `?caption=0`, `?color=1A3FA0` (any hex; default Atlantic blue), `?mode=coffees` (or `#coffees`).

The coffees view reads `data/coffees.json` when hosted on GitHub Pages. Each coffee's `origins` are country names as Natural Earth spells them (e.g. `Brazil`, `Ethiopia`, `Colombia`); a country shared by several coffees shows all their numbers and takes the latest coffee's colour.

```html
<iframe src="https://ms-runs.github.io/coffee-exchange/globe/?bg=transparent"
        style="width:100%;max-width:640px;aspect-ratio:4/5;border:0" title="Round globe"></iframe>
```

## Working locally

```sh
npm install          # only needed for tools/
npm run serve        # static server at localhost:3000
npm run land-dots    # rebuild land dots + country lookup (writes tools/land-dots.json, ~2 min)
```

## Design

The Round brand guidelines (v1.0) set the look. Every page loads `assets/round.css` (colour tokens for light and dark, self-hosted Outfit 400 and 600) and `assets/round.js` (the mark).

- **The mark** is a cup seen from above. The rim is the brand colour, the disc is the coffee's colour, and the handle points at the seat of whoever picked it. `Round.mark({size, coffee, seat})` returns an SVG, `Round.lockup({height})` the logo with the name, and `Round.drawCup(ctx, x, y, d, {seat})` draws it on a canvas (the globe). Three cuts keep it readable down to 16 px.
- **Seats** live in `data/cities.json` (`"seat"`: degrees clockwise from 12 o'clock): Cincinnati 270, New York 0, London 90, Barcelona 180. A coffee's seat comes from its `pickedBy` person's city. With no picker, the handle sits at three o'clock, the logo's own position.
- **Colour:** Atlantic blue `#1A3FA0`, deep water `#0F2566`, ink `#10162A`, secondary `#46506A`, muted `#5F6984`, rules `#C5CEE2`, spray `#E9EEF8`. Coffee colours only for numbers and discs.
- **Type:** Outfit, 400 and 600 only. Tabular figures in data; big coffee numbers use proportional figures.
- **Dark mode:** `assets/theme.js` follows the system setting until someone uses the sun/moon toggle (shared across pages and the globe). Midnight `#0B1124`, surface `#151D3A`, white text and accent (buttons white with midnight text, links underlined), secondary `#B4BEDB`. Coffee colours are lifted in OKLab to 4.5:1 on Midnight. Embeds can force a theme with `?theme=dark` or `?theme=light`. Printed cards stay white.
- **Cards:** the card maker embeds Outfit in its PDFs (`cards/vendor/Outfit-*.ttf`) and draws the Round lockup as outlines.

Outfit is licensed under the SIL Open Font License (`assets/fonts/OFL.txt`).
