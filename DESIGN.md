---
name: CharlesVCS
description: A dark identity card read like a quiet RPG menu — name, track, and six ways to reach or learn about him inside a bordered box.
colors:
  bg: "#000000"
  ink: "#f1f0ec"
  ink-soft: "#8d8d93"
  accent: "#eb3f82"
  accent-deep: "#ff6fa4"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 8vw, 4rem)"
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  displayPage:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2rem, 6vw, 2.75rem)"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.02em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "clamp(0.85rem, 1.6vw, 0.95rem)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.01em"
  labelTitle:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.95rem"
    fontWeight: 500
    letterSpacing: "0.01em"
  labelSm:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.85rem"
    fontWeight: 400
    letterSpacing: "0.01em"
  labelXs:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.05em"
---

# Design System: CharlesVCS

## Overview

**Creative North Star: "The Bordered Readout"**

The page keeps its original discipline — one short identity statement, a technical mono doing the metadata work, a single reserved accent — but now sits inside a drawn box on true black, the way a dialogue or stat readout sits inside a frame in a turn-based RPG. The reference is structural, not costumed: a hairline perimeter, two opposing HUD corner marks, and a selector glyph (`▸`) that steps in from the left on hover, the way a cursor steps up to a menu row. Nothing is pixel-fonted, nothing blinks for its own sake, no icon set — the game read comes from geometry and interaction, not decoration.

A 480×480 looping GIF (pure black background, so it fuses with the page ground) sits beside the name like a portrait tile next to a save-file name — the one willfully playful element, everywhere else stays measured.

**Key Characteristics:**
- True black ground inside a 1px bordered box with two opposing corner HUD marks — the "no chrome" rule from v1 is gone; the box *is* the chrome now, kept to a single hairline plus two small brackets.
- One accent color (neon pink, pulled from the mascot GIF's dominant hue), still reserved for interactive states, the hairline rule, and the corner marks — never resting text.
- Links read as a two-row menu: identity links (GitHub, About, Arts, Sciences, MCTA) on the left, contact links (Email, Matrix) on the right, split by a hairline divider — grouped the way an RPG menu clusters related actions.
- The hover mark moved from a trailing "↗" to a leading "▸" that slides in from the left — a menu-selector cue instead of an external-link cue.
- On `index.html`, the whole card is grabbable and can be turned all the way over like a credit card, revealing the real ENAC logo in a license-card-style back.

## Colors

A near-black ground with a single saturated accent kept out of resting text.

### Primary
- **Accent Deep** (`#ff6fa4`): the color text turns on hover/focus — link labels and the underline. Never used at rest.

### Neutral
- **True Black** (`#000000`): page background. Chosen to exactly match the mascot GIF's own background so the sprite fuses with the page rather than sitting in a visible tile.
- **Ink** (`#f1f0ec`): primary text — the name, resting link color.
- **Ink Soft** (`#8d8d93`): secondary text (the context line, project descriptions, the back-link).
- **Accent** (`#eb3f82`): decorative + the resting color of the hover-selector mark and the card's corner brackets. Never used for resting body text.

### Named Rules
**The One Accent Rule.** The accent (in either weight) never appears as resting-state text or fill beyond the hairline rule, the corner marks, and interactive link states. If a third resting use appears, the element is wrong, not the rule.

## Typography

**Display Font:** Bricolage Grotesque (with system-ui, sans-serif fallback)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace fallback)

No pixel/bitmap font was introduced — the game register comes from layout and motion, not a costumed typeface.

Six named size roles, each a CSS custom property (`:root` in `css/style.css`) rather than a bare value, so every user of a role stays identical and a future addition reaches for an existing token before inventing a seventh:

### Hierarchy
- **`--display-size`** (650, `clamp(2.5rem, 8vw, 4rem)`, line-height 0.98, tracking -0.03em): `.name` on `index.html` only — the one headline on the whole site.
- **`--display-size-page`** (650, `clamp(2rem, 6vw, 2.75rem)`, line-height 1, tracking -0.02em): `.page-title` on every sub-page — same display face and weight, one size step down, since it's a page title rather than the identity itself.
- **`--label-size`** (400, `clamp(0.85rem, 1.6vw, 0.95rem)`, tracking 0.01em): the primary label tier — `.context` and every `.link` (GitHub/About/Arts/Sciences/MCTA/Email/Matrix). Fluid on purpose: the context line and the nav links are meant to read as one register and shrink in lockstep on narrow viewports, not drift apart.
- **`--label-size-title`** (500, `0.95rem` flat, tracking 0.01em): `.project-title` — a mini-heading inside the label register, so it stays full-size at every width rather than shrinking in sync with body-ish text around it.
- **`--label-size-sm`** (400, `0.85rem` flat, tracking 0.01em): the secondary label tier — `.back-link` and `.project-desc`. Pinned to `--label-size`'s own floor rather than an unrelated number.
- **`--label-size-xs`** (400, `0.75rem` flat, tracking 0.05em, `0.22em` on the all-caps `.license-label`): fine print — the three card-back license details (`.license-label`, `.license-id`, `.license-caption`). One size for everything that plays "small print on an ID card," rather than three near-identical values that happened to get picked in three different passes.

### Named Rules
**The No-Prose Rule.** Nothing on either page is a paragraph of running text; project descriptions stay to one label-register sentence.

## Layout

Five pages, same frame:
- **`index.html`** — single full-bleed viewport, the bordered card centered both horizontally and vertically (flex-centered body, `min(660px, 100%)` card capped width, `1.5rem` body padding as the small-screen gutter), every element inside centered on the card's own axis. The card width (560→600→660px across three revisions) and the nav row's gaps (`.links` 0.6rem, `.link-group` 0.75rem, divider padding 0.6rem) are both sized to keep all seven links — GitHub/About/Arts/Sciences/MCTA/Email/Matrix — on one row at ordinary desktop widths; measured against real JetBrains Mono metrics, the row needs ~539px and the card offers ~572px even at max padding. Re-measure before adding an 8th link — see `DESIGN_DIRECTIVE.md` §6.4 for the exact method.
- **`about.html`** / **`arts.html`** / **`sciences.html`** / **`projects.html`** — the "About," "Arts," "Sciences," and "MCTA" links' destinations; same card frame, a back-link to the identity card, a page title, and a short label-register list. `about.html` carries facts plus the CTF Leaderboard; `sciences.html` (renamed from `maths.html`) carries two "coming soon" placeholders for revision/exercise sheets; `arts.html` carries one generic "coming soon" placeholder (content not yet specified); `projects.html` carries two real-destination links (E-Portfolio, MCTA25C) rather than invented project copy. Reached, never shown inline — the identity card stays one viewport, exactly as v1 intended.

Vertical rhythm inside the card is unchanged from v1: name row → 0.9rem → context line → 1.9rem (rule) → 1.6rem → link row.

## Elevation & Depth

Still flat — no shadows, no blur, no gradient anywhere. The one box border and two corner marks read as a frame, not as elevation.

## Shapes

Square corners everywhere, no exceptions — the card's own border is a plain 1px rectangle, the two corner marks are straight hairline brackets, the mascot GIF is never rounded. The game reference is geometric precision (a drawn frame), not rounded "friendly" UI chrome.

## Components

### Links (signature component)
A menu row rather than a measured readout: a selector glyph (`▸`) hidden at rest, label, underline that draws in on hover/focus.
- **Shape:** no border, no background, no radius — mark + text + a 1px underline.
- **Resting state:** ink-colored label, invisible mark (opacity 0, offset left 0.4em), invisible underline.
- **Hover / focus:** label shifts to Accent Deep; mark fades in and slides to rest at the label's left edge; underline draws in left-to-right (`scaleX(0→1)`, 0.3s, exponential ease-out).
- **Keyboard:** `:focus-visible` gets the same treatment as hover, plus a 2px Accent-Deep outline offset 3px.
- **Grouping:** links sit in two `.link-group`s (identity / contact) separated by a hairline `border-left` divider with its own padding — never a bare gap alone.

### Leaderboard (`about.html`)
A scoreboard reading, kept inside the same label-register and centered-card discipline as everything else: a bordered rank badge (`.leaderboard-rank`, 1px Accent border, `--label-size-xs`, Accent Deep text) above an event line (`--label-size-sm`, Ink) and a result line (`--label-size-xs`, Ink Soft) — stacked and centered, not a left-aligned table. Currently one entry (Orion / Bellatrix); built as an `<ol>` so more can be added without a new component.

### Card frame
- 1px solid hairline border (`color-mix(in srgb, var(--ink) 18%, transparent)`) around the whole card.
- Two opposing 14px corner marks (top-left, bottom-right only — not all four) in Accent, offset 7px outside the border, fading in last in the entrance sequence. Two corners, not four: enough to read as a HUD frame without tipping into decoration.

### Mascot
- The root `giphy.gif` (480×480, true-black background), shown at `clamp(56px, 11vw, 84px)` beside the name. `object-fit: cover`, `image-rendering: pixelated`, no border, no radius — it's meant to look like it's standing in the same black void as the page, not sitting in a framed thumbnail.

### Grabbable card
The card is a physics toy, and its kinetics are one continuous damped spring (stiffness 140, damping 22 — light, close to critically damped) that *chases a moving target* rather than snapping to the pointer. Turning and moving are deliberately decoupled: the twist (depth tilt — `rotateX`/`rotateY` under `perspective: 1100px` on `body`, horizontal drag leaning it around its vertical axis, vertical drag around its horizontal axis) follows the full drag distance, unclamped, so it can turn all the way over like a flipped credit card — but position only drifts a fraction of that same drag (12%, capped at ±46px) rather than following 1:1. The result reads as turning the card over in place — you catch the back face mid-turn, with only a slight sideways give — rather than flinging it across the screen while it happens to spin. On release, the target becomes the origin for all four axes; the same spring, same loop, carries it home with a small controlled swing rather than coasting.
- The tilt sensitivity scales to the viewport (targeting "dragging ~85% of the shorter screen dimension completes a full 180° flip") instead of a fixed px-to-degree ratio — a flat ratio tuned for a mouse's drag range made the flip physically unreachable on a phone, which this fixes.
- A few small accent-colored star particles emanate from the pointer while the card is actively being turned (not during the automatic return swing), flying outward and fading — a floor-level nod to a "shine-get" moment, kept to the one accent hue and spawned into a flat screen-space overlay so they don't inherit the card's own 3D tilt.
- `cursor: grab` at rest, `cursor: grabbing` while held.
- A genuine click (pointer never moves past a 6px threshold) still reaches links normally; a real drag swallows the trailing ghost-click so flinging the card never accidentally fires a link underneath the pointer.
- Disabled entirely under `prefers-reduced-motion: reduce` — the card simply doesn't attach the drag listeners, rather than attaching them and skipping only the motion.

### Card faces (`index.html` only)
On the home page, `.flip-card` wraps two stacked `.card` faces (`.card-face--front` / `.card-face--back`) via a CSS grid "stacked cell" trick (`grid-area: 1/1` on both, so the implicit row auto-sizes to the taller face) and `transform-style: preserve-3d` — so the front (the identity content) and back can be turned to face the viewer independently, `backface-visibility: hidden` keeping only the correctly-facing one visible at any rotation. The front is unchanged from the earlier single-face version; the back is a decorative license-style face (`aria-hidden="true"`, no interactive content) reached only by dragging/flinging the card past 90°:
- The real **ENAC logo** (`enac-mark.png` — the white eagle + wordmark, cropped from the official file on Wikimedia Commons, sourced from enac.fr, Licence Ouverte 1.0/Etalab), centered. Its trapezoid field, originally ENAC blue, is recolored to match `--bg` exactly rather than kept in brand color — it disappears into the card, leaving only the white line-art eagle and wordmark floating on black, so the One Accent Rule holds without exception after all.
- A license-card layout around it, evoking a Hunter License back without reproducing it: a `.license-header` (a small chip glyph — a bordered rectangle with a few hairline contacts — plus a spaced-caps "LICENSE" label), the mark flanked by two accent-pink diamonds (`.license-diamond`), and a `.license-footer` below (a decorative `N° 0043 · MCTA` id line over a dashed `.license-strip`, standing in for a magstripe/barcode).
- A small caption ("Turn it back over") in the label register, same as the rest of the site.
- Both faces carry the same card frame (border + two corner marks) via the shared `.card` class, so flipped over the object still reads as "the same card," just showing its other side.

## Do's and Don'ts

### Do:
- **Do** keep the accent off every resting-state text color; it only speaks on interaction, the hairline rule, and the two corner marks.
- **Do** reuse the extending-line motion for any future hover/entrance moment; reuse the leading-`▸`-slide for any future menu-style interaction rather than inventing a third idiom.
- **Do** keep `index.html` to one viewport with no scroll — new content is a new page (like `projects.html`), linked, not appended below the fold.
- **Do** keep the grabbable-card gesture off under `prefers-reduced-motion: reduce` — skip attaching it rather than attaching it and only muting the bounce.

### Don't:
- **Don't** introduce a second accent color, a gradient, or a pixel/bitmap font — the game register stays carried by geometry (the frame, the corner marks, the selector glyph), not by costume.
- **Don't** round any corner — the card border, the corner marks, and the mascot image all stay perfectly square.
- **Don't** add a third corner mark or a full four-corner frame — two opposing corners is the calibrated amount of HUD signal; four reads as a decorative border, not a readout.
