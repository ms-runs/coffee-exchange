# Card design spec (Swiss grid)

> Updated for the Round brand (Nov 2026): Outfit replaces Helvetica, the colours follow the Round palette, and the header shows the Round lockup instead of the words "Coffee exchange". The layout is unchanged.

The exact build spec for the coffee card, taken from the approved design on the Coffee Exchange Labels canvas (Alchemy and Companion cards).

## Page

- A6 portrait, 105 × 148 mm (397 × 559 CSS px at 96 dpi). Four cards to an A4 sheet.
- White background, 40 px (about 10.5 mm) margin all round.
- Ink #10162A, secondary text #46506A, rules #10162A (top) and #C5CEE2 (between rows), photo placeholder #E9EEF8.
- Font: Outfit 400 and 600, embedded in the PDF. Bold text uses 600.

## Layout, top to bottom

1. **Header row:** big number top-left (about 104 px, weight 600, line-height 0.8, letter-spacing -0.04em, in the coffee's colour). Top-right: the Round lockup, 22 px tall (small cut), Atlantic blue #1A3FA0 with the disc in the coffee's colour, drawn as outlines; below it, right-aligned 13 px secondary "Picked by <name>".
2. **Name and roaster:** coffee name 30 px weight 600; below it 15 px secondary "<Roaster> · <City, State>".
3. **Details table:** 1 px ink rule on top, then rows of 14 px text, label column 96 px (secondary) and value (weight 500), 7 px vertical padding, 1 px #C9CED8 rule under each row. Default rows: Origin, Process, Variety, Altitude, Roast, Harvest. Rows can be renamed (e.g. "Blend", "Style", "Trade") or dropped; a value can wrap to two lines.
4. **Bottom row (pinned to bottom):** bag photo 96 × 120 px (object-fit contain) on the left; right of it a 12 px secondary "Tasting notes" label and the notes at 20 px weight 500, one per line with commas.

## Number colour

- Options: a colour the picker chooses, or one of the 3 dominant colours detected from the bag photo.
- Detection: quantise the bag photo, merge near-identical shades, then for each colour keep its hue and lower lightness until contrast on white is at least 3:1.
- Examples: Alchemy (Deeper Roots) teal #344545, kraft darkened #B18343, yellow darkened #AE8803 (chosen for the group brief). Companion (Little Wolf) text blue #008CFF (chosen), sky darkened #1D93D5, deep #00559E.

## Example data

| | 01 Alchemy | 02 Companion |
| --- | --- | --- |
| Roaster | Deeper Roots Coffee · Cincinnati, OH | Little Wolf Coffee · Ipswich, MA |
| Origin | Brazil, Ethiopia, Guatemala | Colombia |
| Process / Blend | Washed and natural | 60% washed Colombia / 40% natural Colombia, Willow |
| Roast | Medium | Light–medium |
| Style | Espresso blend | Espresso or drip |
| Trade | Direct trade | — |
| Tasting notes | Cherry, toffee, chocolate | Berry, chocolate, creamy |
| Number colour | #AE8803 | #008CFF |

Blends rotate; check the bag. Companion's current components came from Little Wolf's own Shopify feed (Nov 2026); Alchemy's origins from the bag itself.

## Group brief

A one-page A4 proposal in Helvetica (title with a joined "ff" in "Coffee"): pitch, four numbered steps, the two example cards, "Coming later" (ratings page, card maker) and "To decide together" (round frequency, who's in). Shared as PNG and PDF in the project chat.
