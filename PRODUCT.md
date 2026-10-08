# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/vanilla JS, deployed via GitHub Pages. No build tooling, no backend — confirmed by the explicit request (plain HTML, GitHub Pages target, client-side base64 email decode in place of a server/Cloudflare worker).

## Users

Recruiters, school admissions reviewers, and engineering contacts evaluating Charles (ENAC, prépa MPI/MPI* at Thiers, specializing MCTA — air traffic control). Secondary: peers/collaborators looking him up via a shared link.

## Product Purpose

A personal landing/contact micro-site: states who Charles is, grounds him in his engineering track, and gives a reliable way to reach him (GitHub, email) without exposing the email to scrapers.

## Positioning

A single, confident identity card rather than a generic "awesome dev portfolio" template — credibility through precision of craft (typography, spacing, motion), now read through a restrained game-UI register (bordered box, corner marks, monospace menu rows, one neon accent) rather than a literal costume or decoration.

## Operating Context

ENAC engineering student; three years MPI/MPI* prépa at Thiers; current specialization MCTA (air traffic control); member of Toulibre, a Toulouse-based free/open-source-software advocacy association (confirmed by user). No CV/project list has been supplied yet.

## Capabilities and Constraints

- Scope: landing page (name, short line of context, GitHub/About/Arts/Sciences/MCTA/Email/Matrix links) plus four minimal sub-pages: `about.html` (reached via "About"), `arts.html` (reached via "Arts"), `sciences.html` (reached via "Sciences"), and `projects.html` (reached via "MCTA").
- Email must be published without a plaintext `mailto:` in the markup; decoded client-side (base64/`atob`), and only inside the click handler — the real address is never written into the DOM's `href` until a genuine click fires, so it isn't exposed by inspecting the element either.
- Must run as static files with no server component (GitHub Pages).

## Brand Commitments

- Display name: **CharlesVCS** (confirmed by user).
- GitHub handle: **charlesvcs** (`github.com/charlesvcs`).
- Contact email: charlesvercruysse83500@gmail.com (confirmed by user for this purpose).
- Matrix: `@charlesvcs:matrix.org` (confirmed by user).
- Links shown: GitHub, About (→ `about.html`), Arts (→ `arts.html`), Sciences (→ `sciences.html`), MCTA (→ `projects.html`), Email, Matrix.
- `enac-mark.png`: the real ENAC logo (eagle + wordmark), cropped from the official SVG on Wikimedia Commons and recolored from ENAC blue to match the card's black background (source: enac.fr, uploaded via the French government's Licence Ouverte 1.0/Etalab, which permits reuse with attribution — https://commons.wikimedia.org/wiki/File:Logo_ENAC.svg). Shown on the identity card's back face inside a Hunter-License-style layout (chip glyph, diamond accents, id line, magstripe-style strip), factual (he's an ENAC student), not implying endorsement by the school.

## Evidence on Hand

No real project content, testimonials, or CV copy supplied yet.

`projects.html` no longer carries invented project descriptions — on Charles's own request it now offers two real options, **E-Portfolio (English)** and **MCTA25C**, both still placeholder links (`href="#"`, flagged inline) pending the actual URLs.

`about.html` carries a CTF Leaderboard entry (confirmed by user): the French government's **Orion / Bellatrix** CTF, honestly framed — he spent most of the event debugging the CTF's own challenges rather than solving them as intended. The final rank is a flagged placeholder (`###`) pending the real number.

`sciences.html` (renamed from `maths.html` by user request, same content) is a page for his own revision sheets and exercise sheets, aimed at curious visitors — currently "coming soon" placeholders, since the actual files haven't been supplied yet.

`arts.html` is a new page (confirmed by user, no content specified yet) — currently a single honest "coming soon" placeholder. Charles still needs to say what it should actually list (sketches, photography, music, etc.).

## Product Principles

- Credibility through restraint: a sober, quiet palette and precise type carry the identity — no literal metaphor skin.
- Say little, say it exactly: one clear line of context, not a biography.
- Privacy-respecting contact: never ship a crawlable `mailto:` in markup; decode client-side on real interaction.
- Built to extend: today's single viewport should not fight a future projects section.

## Accessibility & Inclusion

Standard baseline: ≥4.5:1 text contrast, visible keyboard focus, `prefers-reduced-motion` honored, link decoded-on-click still reachable via keyboard (Enter) not only pointer hover. The grabbable/draggable card (pointer-drag + spring-back) is pointer-only and entirely skipped under `prefers-reduced-motion: reduce`; it adds no keyboard interaction and none of the site's links depend on it.
