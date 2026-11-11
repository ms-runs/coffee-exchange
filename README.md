# Coffee exchange

A rotating coffee swap between friends in Cincinnati, New York, London and Barcelona, plus the web tools that run it. Each round one person picks one or two coffees and posts a small bag of each to everyone, with a printed card. The group tastes, rates and catches up.

Live: https://ms-runs.github.io/coffee-exchange/ (embedded on migsousa.com with a Squarespace Code block, same as Zine Maker)

## What's here

| Folder | What | Status |
| --- | --- | --- |
| [`globe/`](globe/) | Turning dot globe. **Our cities**: cup pins, swap-ring routes, local times. **Coffees we've tried**: origin countries lit in each coffee's number colour | First version |
| [`cards/`](cards/) | A6 card maker, Swiss grid, jsPDF export | First version |
| [`worker/`](worker/) | Cloudflare Worker: roaster link → coffee fields | Next |
| [`ratings/`](ratings/) | Ratings grid and review forms | Planned |
| [`about/`](about/) | Who we are and how a round works; people come from `data/people.json` | First version |
| [`index.html`](index.html) | The site: the record of every coffee by number, a page per coffee with ratings, and the globe beside it (they talk via `postMessage`) | Draft |
| [`data/`](data/) | `coffees.json`, `cities.json`, `people.json`, `reviews.json` (empty until ratings open), one JSON file per round in `rounds/` | Started |
| [`assets/`](assets/) | Bag photos and shared images | Empty |
| [`docs/`](docs/) | Project brief and card design spec | |
| [`tools/`](tools/) | Build scripts (land dots for the globe) | |

## Stack

Vanilla JS and static files on GitHub Pages. No build step for the pages. Free Cloudflare services (one Worker, D1 if needed) for lookups and saved ratings. No Supabase.

## Globe embed options

`globe/index.html` takes query options: `?bg=transparent`, `?controls=0`, `?caption=0`, `?color=0000FF`, `?mode=coffees` (or `#coffees`).

The coffees view reads `data/coffees.json` when hosted on GitHub Pages. Each coffee's `origins` are country names as Natural Earth spells them (e.g. `Brazil`, `Ethiopia`, `Colombia`); a country shared by several coffees shows all their numbers and takes the latest coffee's colour.

```html
<iframe src="https://ms-runs.github.io/coffee-exchange/globe/?bg=transparent"
        style="width:100%;max-width:640px;aspect-ratio:4/5;border:0" title="Coffee exchange globe"></iframe>
```

## Working locally

```sh
npm install          # only needed for tools/
npm run serve        # static server at localhost:3000
npm run land-dots    # rebuild land dots + country lookup (writes tools/land-dots.json, ~2 min)
```

## Design

Helvetica, white, ink `#14171F`, accent Stache Blue `#0000FF`, tabular numbers.

Dark mode: every page loads `assets/theme.js`, which follows the system setting until someone uses the sun/moon toggle (the choice is shared across pages and the globe). Midnight `#141B2A` background, white text, secondary `#B7BFCF`, accent white (buttons white with midnight text, links underlined), white globe. Coffee colours are lifted in OKLab to 4.5:1 on the dark background; printed cards stay as designed. Embeds can force a theme with `?theme=dark` or `?theme=light`. Logo: Worldy from Global 'Stache holding a cup and a moka pot (held back for now).
