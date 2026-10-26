# Design system

**Creative platform:** Measured Momentum  
**Working descriptor:** Acrobatic Rock ’n’ Roll + Boogie Woogie in India  
**Mandatory status:** Proposed organisation · In development

The experience combines visible rhythm with visible accountability. Energy may
appear in composition and abstract motion; interactions, claims and next steps
remain calm and exact.

## Content rules

- Lead with what the page is, its current status and what is not decided.
- Use “this proposal” or “the proposed initiative”; do not invent an
  institutional acronym.
- Do not use “official”, “federation”, “national body”, “recognised”,
  “affiliated”, “sanctioned”, “member”, “partner”, “sponsor”, “team” or a
  similar status term without exact, dated evidence and approval.
- Do not publish people, biographies, roles, qualifications, results, events,
  supporters or contact details from placeholders or inference.
- Use truthful empty states instead of sample scale, countdowns or skeleton
  records.
- Calls to action describe the immediate result. Disabled or unavailable
  capabilities explain why; they never simulate success.
- Use Indian English and write dates as `25 October 2026`.

## Colour

Core tokens:

- Night Ink `#12161F` — primary text and dark fields
- Warm Paper `#FFF8ED` — page background
- Clear White `#FFFFFF` — raised surfaces
- Beat Red `#8E2945` — primary action and editorial emphasis
- Balance Teal `#006A67` — secondary action and diagrams
- Count Lime `#D9F257` — sparse markers with Night Ink text
- Step Blue `#243C7A` — links and focus
- Quiet Sand `#F0E9DE` — low-emphasis surfaces
- Muted Ink `#535B66` — secondary text
- Measure Line `#727983` — essential boundaries, not body copy

Functional tokens are Success `#17653A`, Warning `#704C00` on `#FFF3C2`,
Error `#A1252F` and Information Surface `#DCE6FF`.

Colour never carries status, validation, discipline or selection meaning by
itself. Re-test every component state rather than relying only on token-pair
ratios.

## Typography

The site uses local system fallbacks to avoid build-time network
downloads:

- Display: Segoe UI Variable Display, Arial Narrow, Segoe UI, Arial, sans-serif
- Body: Segoe UI Variable Text, Segoe UI, Roboto, Helvetica, Arial, sans-serif

Archivo and Noto Sans may replace these only as reviewed, repository-hosted
WOFF2 assets with licences and script coverage. Do not use `next/font` remote
downloads.

Headings use sentence case, compact line height and weights around 700. Body
copy starts at 18px on editorial pages, uses a generous line height and stays
near 68 characters per line. Meaningful text never drops below 16px; metadata
may use 14px.

## Rhythm and layout

Spacing follows an eight-based rhythm with quarter-rem subdivisions. Content
uses a maximum width of 76rem and gutters that scale from 1rem to 2rem.

- Small layouts use one reading column.
- Paired content collapses in semantic order: status and copy before decorative
  media.
- Registers become labelled cards rather than essential horizontal scroll.
- Touch targets are at least 44×44 CSS pixels where practical.
- Sticky elements must not obscure headings, errors or focused controls.

## Component contracts

### StatusRail

Appears before the header and always includes the exact mandatory status plus a
link to its explanation. It must wrap at narrow widths and never truncate.

### SiteHeader and SiteFooter

Use semantic landmarks and plain links. The text lock-up includes the working
descriptor and status; there is no stand-alone seal or unverified logo.
Navigation includes only implemented destinations.

### MobileNavigation

Radix Dialog provides focus management, Escape close, background isolation and
focus restoration. The panel has a visible title, close control, current-page
cue and status statement. It must remain usable at 320 CSS pixels and 400%
zoom.

### Button, ButtonLink and TextLink

Use a real `button` for actions and a real link for navigation. Labels describe
the result. Primary, secondary and quiet styles preserve visible focus and do
not communicate availability by colour alone.

### PageHeader

Renders one route H1, an optional status/section eyebrow and a concise
description. Pages must not add another H1.

### EmptyState

States what is absent, why the absence matters and at most one safe next step.
It must not imply a hidden roster, planned date or unavailable service.

## Motion

Use 120ms for direct feedback, 240ms for small reveals, 480ms for panels and
960ms as the maximum expressive sequence. Animate opacity and transforms, not
layout dimensions. Avoid scroll hijacking, autoplay audio, flashing, constant
bouncing and motion-dependent information.

`prefers-reduced-motion: reduce` produces immediate state changes. Saath Rekha
continuous motion has a visible pause control with session memory and stops
when its viewport or page is not visible.

## Saath Rekha

Saath Rekha is an internal 3D direction, not a public organisation name. Its
implemented contract is:

- `KineticDuetProps` and failure/discipline types;
- an immediate static paired-ribbon SVG and decorative, non-instructional
  description;
- Three/R3F in a separate lazy client chunk loaded near the viewport;
- no scene load under reduced motion, Save-Data, unsupported WebGL2 or a major
  performance caveat;
- demand rendering that stops offscreen, page-hidden or session-paused;
- lower quality for mobile/coarse-pointer contexts;
- context-loss/load-error fallback with the static poster retained;
- HTML retains all meaning and controls;
- neither ribbon encodes gender, nationality or permanent leadership;
- no people, tricks, medals, venues, flags or federation marks are simulated.

## Accessibility baseline

Target WCAG 2.2 AA from the first component.

- Use landmarks, one H1, logical headings, labelled navigation and a first-focus
  skip link.
- Preserve logical DOM/focus order across breakpoints.
- Keep focus visible in normal and forced-colours modes.
- Support keyboard-only operation, 200% text scaling, 400% zoom and 320px
  reflow.
- Associate visible labels, instructions, summaries and errors with the
  implemented enquiry controls.
- Announce loading, error and confirmed states without unexpected focus moves.
- Give informative media accurate alternatives; hide purely decorative art.
- Keep critical content independent of JavaScript, WebGL, third-party widgets
  and colour.

Automated axe checks are required on each meaningful state. Manual keyboard,
screen-reader, zoom, text-spacing, forced-colours and reduced-motion evidence
remains a release gate.
