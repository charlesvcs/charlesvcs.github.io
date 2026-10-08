# DESIGN_DIRECTIVE.md — CharlesVCS Portfolio

**Purpose of this file:** a strict, machine-oriented specification of the implemented design system. It is written for an AI agent that will write new HTML/CSS/JS for this project. It is denser and more literal than `DESIGN.md` (which stays the narrative/creative-rationale document — read it for *why*; read this file for *exactly how*). Every value below is copied from the shipped source, not inferred or rounded. If this file and the shipped code ever disagree, the shipped code is correct and this file is stale — re-derive it, don't trust memory of it.

**Source of truth files:** `css/style.css` (single stylesheet, shared by every page), `index.html`, `about.html`, `arts.html`, `sciences.html`, `projects.html`, `js/main.js`. No build step, no preprocessor, no framework. Plain static files served as-is (GitHub Pages).

**Non-negotiable platform constraints (do not propose alternatives to these):**
- Static HTML + CSS + vanilla JS only. No build tooling, no bundler, no framework, no npm dependency of any kind.
- Every page loads exactly one stylesheet (`css/style.css`) and, if it needs the card/email/drag behavior, exactly one script (`js/main.js`). Never add a second stylesheet or a per-page `<style>` block.
- Dark mode is not a toggle — it is the only mode. `html{color-scheme:dark}`, no light variant exists or should be built.

---

## 1. Hard invariants (violating any of these is a defect, not a style choice)

1. **Zero border-radius, anywhere, ever.** The only explicit `border-radius` in the codebase is `border-radius:0` on `:focus-visible`, written specifically to *override* a browser default. No element — card, button, badge, image, input, chip — may receive a rounded corner. Verify: `grep -n "border-radius" css/style.css` must only ever show `0`.
2. **Zero `box-shadow`, anywhere.** Depth is never implied with a shadow. The system is flat; the only depth cues are the 1px border and the two corner marks (§6).
3. **Exactly one accent hue family in play at rest.** `--accent` (`#eb3f82`) and `--accent-deep` (`#ff6fa4`) are the *only* saturated colors on the whole site. A new color token is a design decision that needs explicit sign-off, not something to add while building a component.
4. **The accent never sits in resting-state body text.** It appears only as: (a) the corner marks, (b) the hairline rule under the context line, (c) the hover/focus state of a link, (d) the license-chip/diamond/rank-badge decorations on the card back. If a new component wants to use `--accent`/`--accent-deep` as its *default*, unconditional text color, stop and reconsider — that is the one rule this system treats as load-bearing.
5. **No gradient as decoration.** The two gradients that exist (`.license-chip`'s contact lines, `.license-strip`'s dash pattern) are 1px-hard-edged linear-gradients used as *line-art/texture substitutes* (a chip's contacts, a magstripe), not color washes. They are the only two gradients allowed to exist as precedent; do not cite them to justify a soft/blurred/multi-stop decorative gradient elsewhere.
6. **No icon font, no emoji, no third-party icon library.** The only non-text glyphs in the system are the single characters `▸`, `◂`, and the SVG favicon/`enac-mark.png` raster. Any new "icon" need is met by typing a single Unicode glyph in the same restrained register, or by a hairline-stroke inline SVG authored specifically for this site — never a library import.
7. **No shadow DOM, no CSS-in-JS, no utility-class framework (Tailwind etc.).** Hand-written CSS in `css/style.css`, plain class names, kebab-case.
8. **`prefers-reduced-motion: reduce` must be honored by every new animated/interactive addition.** See §8 and §9 for the exact mechanism already in place; extend it, don't bypass it.
9. **The email address must never sit as a plaintext `mailto:` anywhere in any HTML source**, and no future contact method may regress this. See §10.4 for the exact pattern.
10. **`index.html` is one viewport, no scroll.** New content never gets appended below the fold on the home page. A new topic is a new page (`about.html`/`arts.html`/`sciences.html`/`projects.html` are the model), linked from the nav row, not an addition to the home card's vertical stack.

---

## 2. Design tokens (CSS custom properties, `:root` in `css/style.css`)

Copy these verbatim. Never hardcode a hex value or a bare font-size number in a new rule when a token already names it.

```css
:root {
  /* Color */
  --bg: #000000;
  --ink: #f1f0ec;
  --ink-soft: #8d8d93;
  --accent: #eb3f82;
  --accent-deep: #ff6fa4;
  --border: color-mix(in srgb, var(--ink) 18%, transparent);
  --rule: color-mix(in srgb, var(--accent) 55%, transparent);
  --focus: var(--accent-deep);

  /* Type scale */
  --display-size: clamp(2.5rem, 8vw, 4rem);
  --display-size-page: clamp(2rem, 6vw, 2.75rem);
  --label-size: clamp(0.85rem, 1.6vw, 0.95rem);
  --label-size-title: 0.95rem;
  --label-size-sm: 0.85rem;
  --label-size-xs: 0.75rem;
}
```

### 2.1 Color table (role → token → hex → verified contrast vs `#000000`)

| Role | Token | Hex | Contrast vs bg | WCAG floor it clears |
|---|---|---|---|---|
| Page background | `--bg` | `#000000` | — | — |
| Primary text (name, resting link color) | `--ink` | `#f1f0ec` | **18.42:1** | AAA for any size |
| Secondary text (context lines, descriptions, fine print) | `--ink-soft` | `#8d8d93` | **6.36:1** | AA body text (≥4.5:1) |
| Accent — decoration + resting hover-mark color + corner marks + card-back badges | `--accent` | `#eb3f82` | **5.57:1** | AA body text |
| Accent-deep — hover/focus text color, project-title resting color, rank badge text | `--accent-deep` | `#ff6fa4` | **8.06:1** | AAA body text |
| Hairline borders (card frame, dividers) | `--border` | `color-mix(in srgb, var(--ink) 18%, transparent)` ≈ a faint gray-white line | — | decorative, not text |
| Hairline rule under context line | `--rule` | `color-mix(in srgb, var(--accent) 55%, transparent)` | — | decorative |
| Focus ring | `--focus` | = `--accent-deep` | — | — |

**Never introduce a new named color.** Every text/fill color in a new component must resolve to one of `--ink`, `--ink-soft`, `--accent`, `--accent-deep`, or `--bg`. If a contrast check is needed for a new pairing, recompute it (WCAG relative-luminance formula) rather than assume — don't eyeball it.

### 2.2 Type scale table (token → value → used by → why it's fluid or fixed)

| Token | Value | Used by (selector) | Fluid? |
|---|---|---|---|
| `--display-size` | `clamp(2.5rem, 8vw, 4rem)` | `.name` (index.html h1 only) | Yes — the one headline on the whole site, never reused elsewhere. |
| `--display-size-page` | `clamp(2rem, 6vw, 2.75rem)` | `.page-title` (about/arts/sciences/projects h1) | Yes — one step down from `--display-size`. |
| `--label-size` | `clamp(0.85rem, 1.6vw, 0.95rem)` | `.context`, `.link` | Yes, deliberately: the context line and every nav link must shrink in lockstep on narrow viewports. Do not give one of these a fixed size while leaving the other fluid. |
| `--label-size-title` | `0.95rem` (fixed) | `.project-title` | No — a mini-heading that must stay full-size at every width, not shrink with body-ish text around it. |
| `--label-size-sm` | `0.85rem` (fixed) | `.back-link`, `.project-desc`, `.leaderboard-event` | No — pinned to `--label-size`'s own floor value on purpose. |
| `--label-size-xs` | `0.75rem` (fixed) | `.license-label`, `.license-id`, `.license-caption`, `.leaderboard-rank`, `.leaderboard-result` | No — "fine print" tier: card-back details and the leaderboard's secondary lines. |

Rule for adding a 7th role: don't. Map the new text to the closest existing role by *function* (headline / page-title / primary-label / mini-heading / secondary-label / fine-print), not by eyeballing a size that looks right. If truly nothing fits, that is itself a signal to reconsider the component rather than mint a token.

---

## 3. Typography

### 3.1 Font loading (exact `<head>` snippet, required on every page)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- `Bricolage Grotesque` is loaded as a variable font across its full optical-size/weight range, but **only weight 650 is actually used** (`.name`, `.page-title`). This is intentional over-fetch (how Google Fonts serves a variable font) — not a license to use other weights without updating this note.
- `JetBrains Mono` is loaded at **exactly** `wght@400;500` because those are the only two weights the CSS uses (400 = default/unset everywhere; 500 = `.project-title` only). **If a new component needs a third weight, the `<link>` on every page must be updated to request it — do not use a weight the `<link>` doesn't load.**
- Never add a third font family. Two families, two jobs: Bricolage Grotesque for the single display role, JetBrains Mono for everything else.

### 3.2 Role → family → weight → letter-spacing map

| Role | Family | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Display (`.name`) | Bricolage Grotesque | 650 | `-0.03em` | `0.98` |
| Display-page (`.page-title`) | Bricolage Grotesque | 650 | `-0.02em` | `1` |
| Label — primary (`.context`, `.link`) | JetBrains Mono | 400 | `0.01em` | browser default (single-line content only) |
| Label — title (`.project-title`) | JetBrains Mono | 500 | `0.01em` | browser default |
| Label — sm (`.back-link`, `.project-desc`) | JetBrains Mono | 400 | `0.01em` | `.project-desc` sets `1.55` explicitly (only multi-line text block in the system); `.back-link` default |
| Label — xs, sentence-case (`.license-id`, `.license-caption`, `.leaderboard-result`) | JetBrains Mono | 400 | `0.05em` | `.leaderboard-result` sets `1.55`; others default |
| Label — xs, all-caps tag (`.license-label`) | JetBrains Mono | 400 | `0.22em` | default |

**Rule:** all-caps micro-labels get `letter-spacing: 0.22em` (wider, because uppercase mono needs it to stay legible at `--label-size-xs`). Sentence-case fine print gets `0.05em`. Everything else in the primary/sm tiers gets `0.01em`. Do not invent a fourth tracking value.

### 3.3 Named rule: No-Prose

Nothing on any page is a paragraph of running text. The longest text node in the system is one sentence (`.project-desc`, `.leaderboard-result`, max `54ch`). If new copy needs more than one sentence to say something, the copy is wrong for this surface, not the CSS.

### 3.4 Centering discipline (load-bearing, caused a real bug once — see commit history)

`.card { text-align: center }` cascades to everything inside it. Three failure modes to avoid when adding a new text element:
1. **A block with `max-width` needs `margin: 0 auto`**, not `margin: 0`, or it renders flush-left inside a centered-text parent (the text inside centers, the box itself does not). Pattern already used correctly: `.context`, `.project-desc`, `.leaderboard-result`.
2. **Inside a flex container with `align-items: center` on the cross-axis, `margin: 0 auto` is unnecessary** — flex alignment already centers the item regardless of its own margin. (`.leaderboard-entry`, `.license-footer`, `.card-face--back` are all `flex-direction: column; align-items: center` for exactly this reason — new children dropped into them are centered for free.)
3. **Never prefix centered text with a decorative `::before { content: "..." }` glyph.** A leading pseudo-element becomes part of the centered inline run, so the *visible* text's optical center shifts away from true center by half the glyph+gap width. This project shipped and then removed exactly this bug (`.project-title::before { content: "▸ " }`) — do not reintroduce it. If a bullet/marker is wanted next to centered text, it must be a flex sibling of the text (own element, own box), never a `::before` glued to it.

---

## 4. Spacing & geometry

There is no formal spacing scale (no `--space-1..n` tokens) — spacing is authored per-component in `rem`, chosen for that component's rhythm. The values actually in use, so a new component picks from this set rather than inventing a stray number:

`0.2em` `0.3em` `0.35em` `0.4em` `0.4rem` `0.6rem` `0.75rem` `0.8rem` `0.9rem` `1rem` `1.1rem` `1.25rem` `1.4rem` `1.5rem` `1.6rem` `1.75rem` `1.9rem` — plus the responsive paddings `clamp(1.75rem, 4vw, 2.5rem)` (card vertical padding) and `clamp(1.75rem, 4.5vw, 2.75rem)` (card horizontal padding).

Geometry constants:
- Card width: `min(660px, 100%)` — on both `.flip-card` and `.card`. (Raised twice — `560px`→`600px`→`660px` — each time so the nav row would fit one line at desktop widths as links were added/renamed; see §6.4 for the current arithmetic. Don't shrink it back without re-deriving that fit.)
- Card border: `1px solid var(--border)`.
- Corner marks: `14px × 14px`, offset `-7px` (i.e. straddling the border), `1px solid var(--accent)`.
- Body side-gutter on narrow screens: `padding: 1.5rem` on `body`.
- Mobile breakpoint: a single `@media (max-width: 420px)` block, used only to tighten the nav-row gaps further (see §6.4). There is no breakpoint ladder — this system is fluid (`clamp`/`vw`) first, with one narrow-phone exception.

**Border-radius policy: `0` everywhere, no exceptions** (restated from §1 because it is the single most load-bearing geometry rule). Square card, square corner marks, square mascot image, square license-chip, square diamonds (a diamond here is a square `rotate(45deg)`, not a rounded shape).

---

## 5. Layout model

- `body` is `display: flex; align-items: center; justify-content: center; min-height: 100vh;` — every page is one element (`.flip-card` on index, `.card` on the three sub-pages) centered in the viewport, both axes, always.
- `perspective: 1100px` lives on `body` (not on the card) so the 3D depth-tilt of the flip-card has a stable vanishing point regardless of the card's own transform.
- Inside the card: a simple vertical stack, centered (`text-align: center` + flex children where needed). No grid-based page layout exists or should be introduced for a content page — a second column, a sidebar, a grid of cards: none of that exists in this system and a request for one is a request to invent new layout language, which needs explicit direction, not silent improvisation.
- Five pages, same frame: `index.html` (the identity card, two-faced — see §7), `about.html`, `arts.html`, `sciences.html`, `projects.html` (all four sub-pages are single-face `.card` with a `.back-link`, a `.page-title`, a `.context` line, a `.rule`, and then page-specific content).

---

## 6. Components (exact markup + CSS contract)

For each component: the markup shape that must be reused verbatim (only text/href content changes), and the states it supports.

### 6.1 Card frame (`.card`)

```html
<main class="card"> <!-- or .card.card-face.card-face--front inside .flip-card -->
  ...
</main>
```
```css
.card {
  position: relative;
  width: min(660px, 100%);
  padding: clamp(1.75rem, 4vw, 2.5rem) clamp(1.75rem, 4.5vw, 2.75rem);
  border: 1px solid var(--border);
  text-align: center;
  cursor: grab;
}
```
Plus two corner marks via `::before`/`::after` (top-left and bottom-right **only** — never add the other two corners, never add a third mark; two opposing corners is the calibrated amount of HUD signal, four reads as decoration):
```css
.card::before, .card::after {
  content: ""; position: absolute; width: 14px; height: 14px; opacity: 0;
  animation: corner-in 0.5s ease 0.75s forwards;
}
.card::before { top: -7px; left: -7px; border-top: 1px solid var(--accent); border-left: 1px solid var(--accent); }
.card::after  { bottom: -7px; right: -7px; border-bottom: 1px solid var(--accent); border-right: 1px solid var(--accent); }
```
Every page's root content element is `.card`. Never ship a page whose root element lacks this class — it is what makes the page recognizably part of the system.

### 6.2 Nav link (`.link`) — the signature interactive component

```html
<a class="link" href="...">
  <span class="link-mark" aria-hidden="true">▸</span>
  <span class="link-label">Label</span>
</a>
```
```css
.link {
  position: relative; display: inline-flex; align-items: baseline; gap: 0.4em;
  color: var(--ink); text-decoration: none;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: var(--label-size); letter-spacing: 0.01em;
  padding-bottom: 0.2em; cursor: pointer;
}
.link-mark { font-size: 0.8em; color: var(--accent); opacity: 0; transform: translateX(-0.4em);
  transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease; }
.link::after { content: ""; position: absolute; left: 0; bottom: 0; width: 100%; height: 1px;
  background: var(--accent-deep); transform: scaleX(0); transform-origin: left;
  transition: transform 0.3s cubic-bezier(0.16,1,0.3,1); }
.link:hover, .link:focus-visible { color: var(--accent-deep); }
.link:hover .link-mark, .link:focus-visible .link-mark { opacity: 1; transform: translateX(0); }
.link:hover::after, .link:focus-visible::after { transform: scaleX(1); }
```
**State contract — exactly these three states, nothing more:**
- Resting: ink-colored label, mark invisible (`opacity:0`, offset `-0.4em`), underline invisible.
- Hover **and** `:focus-visible` (always paired, never styled separately): label → `--accent-deep`, mark fades/slides in, underline draws left→right.
- No `:active` state is defined; don't add one without reason — the hover/focus treatment already covers press feedback adequately for this system's density.

**Modifier:** `.link-inline` (used once, for a link embedded mid-sentence in `.project-desc`): `font-size: 1em; padding-bottom: 0;` — makes the link inherit the surrounding paragraph's size instead of the nav's `--label-size`. Reuse this modifier for any future inline-in-prose link; don't invent a second one.

### 6.3 Link grouping (`.links` / `.link-group`)

```html
<nav class="links" aria-label="...">
  <div class="link-group">
    <a class="link" ...>...</a>
    <a class="link" ...>...</a>
  </div>
  <div class="link-group">
    <a class="link" ...>...</a>
  </div>
</nav>
```
```css
.links { display: flex; align-items: center; justify-content: center; gap: 0.6rem; flex-wrap: wrap;
  opacity: 0; transform: translateY(0.4em); animation: rise 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s forwards; }
.link-group { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; position: relative; }
.link-group + .link-group { padding-left: 0.6rem; border-left: 1px solid var(--border); }
```
Links are **always** grouped by function (e.g. identity links vs. contact links), never a single flat row once there are ≥2 functional clusters. The divider between groups is this exact `border-left` + `padding-left` pattern — never a bare larger `gap` standing in for a divider.

### 6.4 Nav-row fit budget (read before adding an 8th link to `index.html`)

The home page's nav row currently holds 7 links (GitHub / About / Arts / Sciences / MCTA / Email / Matrix) across two groups: group 1 = GitHub/About/Arts/Sciences/MCTA (5 links, 4 internal gaps), group 2 = Email/Matrix (2 links, 1 internal gap). Measured against real JetBrains Mono metrics at `0.95rem` (the desktop-resolved value of `--label-size`):

- Per-link content width (label + reserved mark space) sums to **~459.8px** across all 7 links (the renamed "Sciences" is the longest single label at ~74.3px — about the same as "GitHub"/"Matrix").
- Internal gaps (`.link-group` gap `0.75rem`=12px × 5 gaps) = **60px**.
- Between-group spacing (`.links` gap `0.6rem`=9.6px + divider `padding-left` `0.6rem`=9.6px) = **~19.2px**.
- Total row: **~539px**.
- Available content width at `.card`'s max padding (`660px` card − `2×44px` padding): **~572px**.
- Margin: **~33px**.

**Before adding link #8:** recompute this with the real method (measure actual glyph widths for the real font at the real desktop-resolved size — don't eyeball it; a Python script using `PIL.ImageFont.getbbox` against the installed `JetBrainsMono-Regular.otf`, replicating §6.4's own arithmetic, is how every revision of this budget was actually verified). A new ~6-character label costs roughly `45px` of content plus one more `12px` internal gap ≈ `57px`, which would already overrun the current ~33px margin. Options, in order of preference: (a) shorten an existing label before adding a new long one, (b) widen the card again (and re-verify §4's geometry note and re-run this arithmetic), or (c) accept and *intend* a two-line wrap (and then also retune the `@media (max-width: 420px)` gaps to match the new intent). Don't add an 8th link without doing this arithmetic — "looks like it still fits" at one window width is how the original regression happened, twice.

### 6.5 Back-link (`.back-link`) — sub-page return navigation

```html
<a class="back-link" href="index.html">
  <span class="link-mark" aria-hidden="true">◂</span>
  <span>CharlesVCS</span>
</a>
```
```css
.back-link { display: inline-flex; align-items: center; gap: 0.4em; color: var(--ink-soft);
  text-decoration: none; font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: var(--label-size-sm); letter-spacing: 0.01em; cursor: pointer; }
.back-link .link-mark { opacity: 1; transform: none; /* always visible — unlike nav .link-mark */
  transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), color 0.25s ease; }
.back-link:hover, .back-link:focus-visible { color: var(--accent-deep); }
.back-link:hover .link-mark, .back-link:focus-visible .link-mark { color: var(--accent-deep); transform: translateX(-0.2em); }
```
Reuses the `.link-mark` class but **overrides it to always-visible** (`opacity:1`), because here the `◂` is a permanent part of the phrase ("go back"), not a hover-reveal selector cue. This is the one place `.link-mark`'s resting state is intentionally overridden — don't generalize that override elsewhere.

Every sub-page's first content element, immediately inside `.card`, is this exact back-link to `index.html`, with the literal text `CharlesVCS` (the site's display name — update only if the name itself changes, per `PRODUCT.md`).

### 6.6 Page header block (sub-pages)

```html
<a class="back-link" href="index.html">...</a>
<h1 class="page-title">PageName</h1>
<p class="context">Left label <span class="context-dim">/</span> right label</p>
<hr class="rule" aria-hidden="true">
```
`.context-dim` is the only sanctioned way to join two short label fragments on one line: `color: color-mix(in srgb, var(--ink-soft) 55%, transparent); padding: 0 0.35em;`. It is a plain inline span wrapping the separator character (usually `/`), never a `::before`/`::after` (see §3.4 rule 3 on why pseudo-element prefixes are banned on centered text — the same reasoning applies to any separator: it must be a real sibling node a reader's eye can skip, not a glued-on decoration).

### 6.7 Fact/content list (`.project-list` / `.project-title` / `.project-desc`)

```html
<ul class="project-list">
  <li class="project">
    <h2 class="project-title">Heading</h2>
    <p class="project-desc">One sentence, ≤54ch effective width.</p>
  </li>
</ul>
```
```css
.project-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1.5rem; }
.project-title { margin: 0 0 0.4rem; font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: var(--label-size-title); font-weight: 500; letter-spacing: 0.01em; color: var(--accent-deep); }
.project-desc { margin: 0 auto; max-width: 54ch; font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: var(--label-size-sm); line-height: 1.55; color: var(--ink-soft); }
```
This is the generic "one fact, one sentence" block used for School/Path/Track/Association on `about.html`, Revision/Exercise-sheets on `sciences.html`, and the single "Coming soon" placeholder on `arts.html`. **`.project-title` carries no icon, bullet, or prefix glyph** (see §3.4 rule 3 — this is exactly where that bug lived and was fixed). Its only visual distinction from body text is color (`--accent-deep`) + weight (500) + size (`--label-size-title`). That is sufficient; don't add a fourth distinguishing signal.

A list item's content need not be `.project-title` + `.project-desc` only — it may itself contain a different sub-component (see §6.8, the CTF leaderboard nested inside a `.project` `<li>`). The `<li class="project">` wrapper is the unit; what's inside it can vary by function.

### 6.8 Leaderboard (`.leaderboard-list` family) — scoreboard framing for ranked/competitive facts

```html
<li class="project">
  <h2 class="project-title">Section Heading</h2>
  <ol class="leaderboard-list">
    <li class="leaderboard-entry">
      <span class="leaderboard-rank">###</span>
      <p class="leaderboard-event">Event name <span class="context-dim">/</span> context</p>
      <p class="leaderboard-result">One sentence describing the outcome, honestly.</p>
    </li>
  </ol>
</li>
```
```css
.leaderboard-list { list-style: none; margin: 0.8rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 1.5rem; }
.leaderboard-entry { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.leaderboard-rank { display: inline-flex; align-items: center; justify-content: center; min-width: 2.5em;
  padding: 0.15em 0.6em; border: 1px solid var(--accent); font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: var(--label-size-xs); letter-spacing: 0.05em; color: var(--accent-deep); }
.leaderboard-event { margin: 0; font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: var(--label-size-sm); color: var(--ink); }
.leaderboard-result { margin: 0; max-width: 54ch; font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: var(--label-size-xs); line-height: 1.55; color: var(--ink-soft); }
```
Built as an `<ol>` so more entries can be appended without a new component — each additional entry is one more `<li class="leaderboard-entry">`. Rank badge is a bordered box (not filled), same visual family as `.license-chip`'s outline treatment. **Tone rule:** results are reported honestly, including unflattering ones (the shipped example: "spent most of the event debugging the CTF's own challenges rather than solving them as intended") — this is a personality trait of the copy voice, not something to polish into a generic achievement line.

### 6.9 License/ID card back face (`.license-*` family, `index.html` only)

```html
<div class="card card-face card-face--back" aria-hidden="true">
  <div class="license-header">
    <span class="license-chip"></span>
    <span class="license-label">License</span>
  </div>
  <div class="license-mark">
    <span class="license-diamond"></span>
    <img class="enac-mark" src="enac-mark.png" alt="" width="796" height="694">
    <span class="license-diamond"></span>
  </div>
  <div class="license-footer">
    <span class="license-id">N° 0043 · MCTA</span>
    <div class="license-strip"></div>
  </div>
  <p class="license-caption">Turn it back over</p>
</div>
```
```css
.license-header { display: flex; align-items: center; gap: 0.6rem; }
.license-chip { flex: none; width: 22px; height: 16px; border: 1px solid var(--accent);
  background-image: linear-gradient(var(--accent) 1px, transparent 1px),
                     linear-gradient(var(--accent) 1px, transparent 1px),
                     linear-gradient(90deg, var(--accent) 1px, transparent 1px);
  background-size: 100% 1px, 100% 1px, 1px 100%;
  background-position: 0 34%, 0 68%, 50% 0; background-repeat: no-repeat; }
.license-label { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: var(--label-size-xs);
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--ink-soft); }
.license-mark { display: flex; align-items: center; gap: 1rem; }
.license-diamond { flex: none; width: 8px; height: 8px; background: var(--accent); transform: rotate(45deg); }
.license-footer { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
.license-id { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: var(--label-size-xs);
  letter-spacing: 0.05em; color: var(--ink-soft); }
.license-strip { width: min(200px, 60%); height: 8px;
  background-image: repeating-linear-gradient(90deg, var(--ink-soft) 0, var(--ink-soft) 1px, transparent 1px, transparent 5px);
  opacity: 0.6; }
.license-caption { margin: 0; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: var(--label-size-xs);
  letter-spacing: 0.05em; color: var(--ink-soft); }
```
This whole face is `aria-hidden="true"` (decorative, no interactive content, reached only by the drag gesture in §7) and `display:flex; flex-direction:column; align-items:center; gap:1.1rem` (that container rule lives on `.card-face--back`, §7.2). Genre reference: a Hunter License card's "official ID" graphic language (chip, diamond accent, magstripe/barcode stripe) — reinterpreted in this site's own palette, never the source material's actual colors/text. `enac-mark.png` is a real external asset (the ENAC school logo, Wikimedia Commons, Licence Ouverte 1.0/Etalab) with its original blue field recolored to exactly `--bg` so only the white line-art survives — this is the **one sanctioned exception to "no new colors"**: a reproduced third-party logo is content, not a site-UI color choice, so it is allowed to carry whatever color it needs for correct attribution, *but only on first paint before any recolor decision, and only for this one specific asset*. Don't use this exception to justify a differently-colored new element.

### 6.10 Email anti-scrape pattern (`#email-link`)

```html
<!-- data-contact holds the email, base64-encoded; decoded only inside the click handler, so it's never
     written into href and never appears in the live DOM unless the link is actually clicked -->
<a class="link" id="email-link" href="#" data-contact="BASE64_OF_THE_ADDRESS">
  <span class="link-mark" aria-hidden="true">▸</span>
  <span class="link-label">Email</span>
</a>
```
```js
const emailLink = document.getElementById("email-link");
if (emailLink) {
  const encoded = emailLink.getAttribute("data-contact");
  emailLink.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "mailto:" + atob(encoded);
  });
}
```
**Exact contract, do not weaken it:**
- `href` stays `"#"` in the markup and in the live DOM at all times except the instant of a genuine click (never pre-decoded on page load — that was a real regression this project shipped and fixed; the whole point is that `href` must not resolve to the plaintext address even if someone inspects the element without clicking).
- The address lives only as base64 in `data-contact`.
- Decoding happens inside a `click` listener that immediately calls `window.location.href = "mailto:" + atob(encoded)` — never assign the decoded value back onto the `href` attribute at any point, including inside the handler.
- Any future second contact method that needs similar protection (there currently isn't one — Matrix/GitHub are public handles, not secrets) follows this exact pattern: base64 in a `data-*` attribute, decode-and-navigate inside a click handler, `href` never touched.

---

## 7. The flip-card system (`index.html` only) — full technical contract

### 7.1 Why it's structured this way

A two-sided object needs both faces to occupy the same box and only one to be visible at a time, depending on a live 3D rotation the user controls by dragging. CSS Grid's "stacked cell" trick (two children sharing `grid-area: 1/1`) handles the sizing problem (the shared cell auto-sizes to the taller face) without JS measuring either face's height.

### 7.2 Exact structure

```html
<div class="flip-card">
  <main class="card card-face card-face--front"> ... index.html's identity content ... </main>
  <div class="card card-face card-face--back" aria-hidden="true"> ... §6.9 ... </div>
</div>
```
```css
.flip-card { position: relative; width: min(660px, 100%); display: grid;
  transform-style: preserve-3d; cursor: grab; }
.flip-card.is-grabbed { cursor: grabbing; user-select: none; }
.flip-card .card { grid-area: 1 / 1; width: 100%; backface-visibility: hidden; cursor: inherit; }
.card-face--back { transform: rotateY(180deg); display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1.1rem; }
body { perspective: 1100px; /* must be on body, not on .flip-card, for a stable vanishing point */ }
```
**Non-obvious but required:** `.flip-card` needs `transform-style: preserve-3d` (so the back face's fixed `rotateY(180deg)` composes correctly with the JS-driven outer rotation instead of being flattened into the same plane as the front — without this, both faces would coincide identically instead of sitting back-to-back). `backface-visibility: hidden` on each face is what makes exactly one of them visible at any given rotation; it is not optional styling, it's the mechanism.

**Pages without a back face** (`about.html`, `arts.html`, `sciences.html`, `projects.html`) use bare `.card` directly — no `.flip-card` wrapper, no second face. Don't wrap a single-face page in `.flip-card` "for consistency" — the wrapper exists only to solve the two-face stacking problem and has no purpose on a page with one face.

### 7.3 Interaction physics — reusable model, `js/main.js`

The card is not dragged 1:1. It is a continuously-running damped spring that **chases a moving target**: while the pointer is down, the target is derived from the drag delta; on release, the target snaps to the origin. Same spring, same `requestAnimationFrame` loop, the entire time — there is no separate "drag mode" vs. "spring-back mode" code path.

**Exact constants (`initGrabbableCard`, `js/main.js`):**
```js
const DRAG_THRESHOLD = 6;        // px of pointer movement before a pointerdown counts as a drag, not a click
const TILT_SENSITIVITY = 0.22;   // deg of rotateX/rotateY per px of drag — UNCLAMPED (can exceed 90°/180°)
const DRIFT_SENSITIVITY = 0.12;  // translateX/Y moves at only 12% of the raw drag distance
const MAX_DRIFT = 46;            // px, hard clamp on translateX/Y regardless of drag distance
const STIFFNESS = 140;
const DAMPING = 22;              // together: lightly-underdamped, "light but controlled," not floaty
const REST_EPSILON = 0.05;       // per-axis threshold (px or deg) below which the spring is considered settled
```

**Per-frame integration (semi-implicit Euler, applied identically to all four axes `tx, ty, rx, ry`):**
```js
v += (-STIFFNESS * (value - target) - DAMPING * v) * dt;
value += v * dt;
```
`dt` is clamped to `0.032` (≈31fps floor) to keep the integration stable through frame hitches. Render every frame via:
```js
el.style.transform = `translate(${tx}px, ${ty}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
```

**Target derivation while dragging** (pointermove, after the 6px threshold is crossed):
```js
targetRy = startRy + dx * TILT_SENSITIVITY;                              // unclamped — can flip past 90°/180°
targetRx = startRx - dy * TILT_SENSITIVITY;
targetTx = clamp(startTx + dx * DRIFT_SENSITIVITY, -MAX_DRIFT, MAX_DRIFT); // clamped — stays near-centered
targetTy = clamp(startTy + dy * DRIFT_SENSITIVITY, -MAX_DRIFT, MAX_DRIFT);
```
**On release:** all four targets snap to `0`. The spring, already running, just keeps integrating toward the new target — no re-initialization, no velocity reset. This is what makes the release feel like a continuation rather than a mode switch.

**Pointer-capture timing is deliberate and must not be "simplified":** `setPointerCapture` is called **only once the 6px threshold is crossed** inside `pointermove`, never inside `pointerdown`. Capturing on every `pointerdown` (even a plain click that never moves) was shipped once and caused ordinary link clicks inside the card to silently fail to navigate on some browsers — it was identified and fixed. Any new pointer-driven interaction on this card must keep this ordering: treat every `pointerdown` as "maybe a click" and only escalate to "this is a drag" (and only then take pointer capture, add the `is-grabbed` class, start calling `preventDefault()`) after real movement is observed.

**Click-swallowing:** a capture-phase `click` listener on the dragged element checks a `swallowNextClick` flag (set only when `moved === true` at release) and calls `preventDefault()`/`stopPropagation()` exactly once, then clears the flag. This exists so flinging the card doesn't also fire whatever link happens to be under the pointer at release. A plain click (never crossed the threshold) never sets this flag and is never touched.

**Accessibility gate:** the entire system — event listeners, pointer capture, the whole physics loop — is skipped at setup time when `window.matchMedia("(prefers-reduced-motion: reduce)").matches`. Not "attached but animations shortened" — *not attached at all*. The card remains a static, non-interactive `.card`/`.flip-card` for those users; no keyboard equivalent exists or is expected, because no link or content depends on the gesture (the back face is purely decorative).

**If a future component wants similar physical drag behavior:** reuse this exact spring model (same constants are a reasonable default; retune `STIFFNESS`/`DAMPING` deliberately if the object has a different implied "weight," but keep the chase-a-moving-target architecture and the deferred-pointer-capture rule).

---

## 8. Motion catalogue (every animation/transition in the system, exhaustively)

### 8.1 Entrance sequence (`index.html` load, each `animation-delay` staggers the next)

| Element | Animation | Duration | Easing | Delay |
|---|---|---|---|---|
| `.name` | `rise` (opacity 0→1, `translateY(0.4em)→0`) | 0.7s | `cubic-bezier(0.16,1,0.3,1)` | 0 |
| `.mascot` | `rise` | 0.7s | same | 0.1s |
| `.context` | `rise` | 0.7s | same | 0.15s |
| `.rule` | `extend` (`width: 0%→100%`) | 0.8s | same | 0.45s |
| `.links` | `rise` | 0.7s | same | 0.55s |
| `.card::before`/`::after` (corner marks) | `corner-in` (opacity 0→1) | 0.5s | `ease` (not the bezier) | 0.75s |

All `forwards`-filled. The easing `cubic-bezier(0.16, 1, 0.3, 1)` ("exponential ease-out") is the **one** authored entrance/motion curve in the system — reuse it for any new entrance or hover/focus transform transition. The corner marks are the only thing using plain `ease`, because they're a fade, not a directional reveal — keep that distinction if adding a third easing-worthy case (directional motion → the bezier; plain opacity fade → `ease`).

### 8.2 Interaction transitions

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| `.link-mark` hover/focus reveal | `transform` | 0.25s | the bezier |
| `.link-mark` hover/focus reveal | `opacity` | 0.2s | `ease` |
| `.link::after` underline draw | `transform` (scaleX) | 0.3s | the bezier |
| `.back-link .link-mark` hover/focus | `transform` | 0.25s | the bezier |
| `.back-link` hover/focus | `color` | 0.25s | `ease` |

### 8.3 `prefers-reduced-motion: reduce` handling

```css
@media (prefers-reduced-motion: reduce) {
  .name, .mascot, .context, .links { animation: none; opacity: 1; transform: none; }
  .rule { animation: none; width: 100%; }
  .card::before, .card::after { animation: none; opacity: 1; }
  .link-mark, .link::after { transition: none; }
}
```
Pattern: every animated/transitioning rule gets a matching override here that lands the element in its **end state** immediately (not just `animation:none` leaving it stuck at its *start* state — that would hide content). Any new `animation` or `transition` declaration added to the stylesheet must get a corresponding line in this block. The flip-card's JS-driven motion is handled separately (§7.3's accessibility gate), not through this CSS block.

### 8.4 Named rule: one motion idea, two families

The entrance choreography and the hover reveals are the *only* two motion ideas in the system: a staggered rise/reveal on load, and a slide-in selector + draw-in underline on interaction. The 3D card-flip (§7) is a third, but it's gesture-driven physics, not an authored keyframe — don't add a fourth authored keyframe animation (a fourth "flavor" of motion) without very deliberate reason; extend one of the two existing families first.

---

## 9. Shapes & elevation

- **Shapes:** square corners, full stop (§1, §4). The only non-rectilinear shape in the system is the `rotate(45deg)` square used as a diamond (`.license-diamond`) — a rotated square is still "no border-radius," so it's compliant; a true circle/rounded shape is not.
- **Elevation:** flat. No shadow, no blur, no backdrop-filter, no z-index stacking beyond the implicit DOM order (`z-index` appears zero times in the stylesheet — don't introduce it casually; the flip-card's face-stacking is solved by 3D transform + `backface-visibility`, not by `z-index`). Depth is implied only by: the 1px border, the two corner marks, and (on `index.html`) the literal 3D rotation of the card itself.

---

## 10. Per-page conventions (copy exactly when adding a 5th page)

### 10.1 `<head>` template (every page)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CharlesVCS[ — PageName]</title>
<meta name="description" content="CharlesVCS — [one sentence].">
<meta name="theme-color" content="#000000">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000000'/%3E%3Ctext x='32' y='43' font-family='Georgia,serif' font-size='34' fill='%23eb3f82' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
```
The favicon is a fixed inline SVG data-URI: black `64×64` square, the single letter **"C"** (first letter of "CharlesVCS") in Georgia serif 34px, fill `#eb3f82` (`--accent`), centered. Identical on every page. If the display name ever changes, this letter and the `<title>`/`<meta description>` text are the only things that change — the SVG's structure, colors, and sizing stay fixed.

### 10.2 `<body>` template — index (two-faced) vs. sub-page (single-faced)

Index: `<div class="flip-card">` wrapping `<main class="card card-face card-face--front">...` and `<div class="card card-face card-face--back" aria-hidden="true">...`, then `<script src="js/main.js"></script>`.

Sub-page: `<main class="card">` containing, in this exact order: `.back-link` → `.page-title` → `.context` → `<hr class="rule">` → page-specific content, then `<script src="js/main.js"></script>` (needed on every page because it also drives that page's own single-face drag behavior, §7.3).

### 10.3 File/asset naming

- Pages: lowercase, no hyphens so far (`about.html`, `arts.html`, `sciences.html`, `projects.html`) — follow that precedent for a 6th page (single lowercase word, `.html`), not `kebab-case.html`, unless a name genuinely needs two words.
- Images referenced from the root (`giphy.gif`, `enac-mark.png`) sit at the project root, not in a subfolder — this project has no `assets/`/`img/` directory; don't introduce one for a single new image, follow the flat-root precedent.
- `css/style.css` and `js/main.js` are the only code assets, each singular — never split into `style2.css` or `main2.js`; add to the existing files.

### 10.4 Placeholder/unconfirmed-content convention

Any content the site owner hasn't supplied yet (a real link, a real number, a real file) ships as a working but inert placeholder, flagged with an HTML comment immediately above it, in this exact style: `<!-- TODO(charles): replace ... -->`. Never fabricate a plausible-looking fake value (a fake rank, a fake URL, a fake metric) and present it as real — the placeholder must be visibly a placeholder (`href="#"`, or a literal `###`, or "Coming soon" copy) so it can't be mistaken for confirmed fact if the comment is stripped.

---

## 11. Forbidden patterns — explicit, zero-tolerance list for any future generation pass

- Any `border-radius` other than `0`.
- Any `box-shadow`.
- A third accent color, or a gradient used as color-wash decoration (the two hairline-texture gradients in §1/§6.9 are the only sanctioned exceptions — do not extend that precedent).
- `--accent`/`--accent-deep` as a resting (non-hover, non-decorative-mark) text color on body copy.
- A pixel/bitmap "retro" font, or any third font family beyond Bricolage Grotesque + JetBrains Mono.
- An icon font, emoji-as-icon, or an SVG icon library import.
- A `::before`/`::after` text-content prefix glued onto an element whose parent has `text-align: center` (see §3.4 rule 3).
- `setPointerCapture` called unconditionally inside a `pointerdown` handler (see §7.3).
- Pre-decoding the email (or any future obfuscated contact method) into a real `href`/attribute before a genuine click event (see §6.10).
- New content appended below the fold on `index.html` (see §1.10) — a new topic is a new page.
- A left-aligned text block inside `.card` without an explicit, deliberate reason overriding the inherited `text-align: center` (and if overridden, it must be scoped tightly, not applied to `.card` globally).
- A fabricated-looking placeholder value presented without the TODO-comment flag (see §10.4).
- Any animation/transition added without a matching entry in the `prefers-reduced-motion: reduce` block (§8.3).

---

## 12. Worked recipe — adding a brand-new component, end to end

1. Decide which existing *role* the new element fills (headline / page-title / primary label / mini-heading / secondary label / fine print — §2.2) and reuse that token. Do not pick a font-size by eye.
2. Decide its color from the fixed palette (§2.1) by *role*, not by what "looks good" — resting text is `--ink` or `--ink-soft`; `--accent`/`--accent-deep` only for interactive/decorative/hover use (§1.4).
3. If it needs a container shape: 1px `var(--border)` hairline, zero radius, zero shadow. If it needs to be "lifted," it isn't — this system has no elevation vocabulary to borrow from; reconsider the need instead.
4. If it's centered-context text with a leading glyph/marker, make the glyph a sibling flex item, never a `::before` (§3.4.3).
5. If it's interactive (a link/button-like element), give it exactly the three states `.link` has — resting, hover+focus-visible (identical treatment), nothing else — reusing `.link`/`.link-mark`/the underline `::after` pattern wholesale rather than inventing a new interactive visual language.
6. If it animates on entrance, stagger it into the existing `rise`/`extend` family with a `cubic-bezier(0.16,1,0.3,1)` curve and add its reduced-motion override (§8.3).
7. Write the markup, write the CSS in `css/style.css` (never a new stylesheet), and re-run the nav-row fit arithmetic (§6.4) if the change touches `index.html`'s link row.
8. Update `DESIGN.md` (narrative) and this file (literal spec) in the same change — a component that exists in code but not in either document is a debt, not a shortcut.
