# Coffee exchange

A rotating coffee swap between friends in Cincinnati, New York, London and Barcelona, plus the web tools that run it. Each round one person picks one or two coffees and posts a small bag of each to everyone, with a printed card. The group tastes, rates and catches up.

Live: https://ms-runs.github.io/coffee-exchange/ (embedded on migsousa.com with a Squarespace Code block, same as Zine Maker)

## What's here

| Folder | What | Status |
| --- | --- | --- |
| [`globe/`](globe/) | Turning dot globe with cup pins on the four cities, swap-ring routes, local times | First version |
| [`cards/`](cards/) | A6 card maker, Swiss grid, jsPDF export | Next |
| [`worker/`](worker/) | Cloudflare Worker: roaster link → coffee fields | Planned |
| [`ratings/`](ratings/) | Ratings grid and review forms | Planned |
| [`data/`](data/) | `coffees.json`, `cities.json`, one JSON file per round in `rounds/` | Started |
| [`assets/`](assets/) | Bag photos and shared images | Empty |
| [`docs/`](docs/) | Project brief and card design spec | |
| [`tools/`](tools/) | Build scripts (land dots for the globe) | |

## Stack

Vanilla JS and static files on GitHub Pages. No build step for the pages. Free Cloudflare services (one Worker, D1 if needed) for lookups and saved ratings. No Supabase.

## Globe embed options

`globe/index.html` takes query options: `?bg=transparent`, `?controls=0`, `?caption=0`, `?color=0000FF`.

```html
<iframe src="https://ms-runs.github.io/coffee-exchange/globe/?bg=transparent"
        style="width:100%;max-width:640px;aspect-ratio:4/5;border:0" title="Coffee exchange globe"></iframe>
```

## Working locally

```sh
npm install          # only needed for tools/
npm run serve        # static server at localhost:3000
npm run land-dots    # rebuild the globe's land dots from Natural Earth (world-atlas)
```

## Design

Helvetica, white, ink `#14171F`, accent Stache Blue `#0000FF`, tabular numbers. Logo: Worldy from Global 'Stache holding a cup and a moka pot (held back for now).
