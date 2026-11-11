# Coffee exchange — project brief

Updated 11 Nov 2026

## What it is

A rotating coffee swap between friends in Cincinnati, London, New York and Barcelona, plus a small set of web tools that make it easy to run.

- **The exchange:** one person picks 1–2 coffees each round and posts a small bag of each to everyone, with a card explaining the coffee. The group tastes and rates them in the style of Sergio's coffee rating page, then catches up on a call or in voice notes.
- **Card maker:** design the cards. Look up a coffee from the roaster's link (or type it in), add a bag photo, print A6 cards.
- **Ratings page:** a grid of every coffee by number, where the group adds scores, what they liked, brew method and notes.
- **Globe:** a turning globe with a coffee cup on each friend's city.

## Decisions so far

| Area | Decision |
| --- | --- |
| Format | Cards dropped in the bag (not stickers), A6 (105 × 148 mm), four to an A4 sheet |
| Layout | Swiss grid on white: big number top-left, name and roaster, a ruled details table, bag photo and tasting notes at the bottom |
| Header text | "Coffee exchange" and "Picked by <name>"; no round number |
| Number | 01, 02… numbers each coffee; also how coffees appear on the ratings grid |
| Number colour | Chosen, or one of the 3 most dominant bag colours, darkened to at least 3:1 contrast on white; near-identical shades merged |
| Details rows | Origin, process, variety, altitude, roast, harvest by default; rename or drop per coffee |
| Font | Helvetica (TeX Gyre Heros as the free stand-in) |
| Logo | Worldy from Global 'Stache holding a cup and a moka pot, one colour (Stache Blue #0000FF). Held back for now |

## Framework

| Piece | Choice | Notes |
| --- | --- | --- |
| Front end | Vanilla JS on GitHub Pages, embedded on migsousa.com (Squarespace Code block) | Same pattern as Zine Maker |
| Print export | jsPDF, A6 pages and an A4 sheet of four | |
| Coffee lookup | One Cloudflare Worker that fetches a roaster link and returns clean fields | Free plan: 100,000 requests/day (checked Nov 2026) |
| Shopify shops | Add `.json` to the product link | Tested on Little Wolf |
| Fallback | Type the details and upload a bag photo | Always available |
| Ratings data | Cloudflare D1 behind the same Worker, or a Google Form/Sheet | Decide once Sergio's page is reviewed |
| Round data | JSON files and images in this repo | |
| Access | Anyone with the link for now; later editing limited to the group | |

## Roadmap

1. **Card maker, manual** — form, bag photo, colour picker with detected colours, A6 and 4-up A4 PDF.
2. **Lookup** — the Worker, Shopify `.json` first, then plain pages.
3. **Ratings page** — grid of numbers in their colours, card + reviews per coffee, QR code on each card.
4. **Globe** — first version done (11 Nov 2026): dot globe in Stache Blue, cup pins, swap-ring routes, drag, click to fly, local times.

## Open questions

- How does Sergio's coffee rating page work, and can reviews feed into it directly?
- Monthly or quarterly rounds, and who is in the group?
- Group-only editing: shared code or personal links?
