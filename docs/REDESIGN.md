# north star — audit, diagnosis and redesign plan

Audited by running the live app in a headless browser at 1440, 820 and 390 px wide with seeded data, clicking every Plan tab, and reading all 20 source files.

## Root causes (why things "cancel each other out")

1. **Stacked page wrappers.** `pPlan` was defined in `pages.js`, wrapped in `v2.js`, wrapped again in `syllabus.js` (an HTML regex patch). `pToday` was wrapped twice; `pWeek`/`pMonth` three times, each re-parsing the previous layer's HTML. Result: the Roadmap tab vanished the moment you tapped another tab (the bar switched to a *different* five-tab set with renamed labels), and a fresh load of `#plan` painted the **old** page because `v2.js`/`syllabus.js` loaded after the first render.
2. **JS masonry (`layout.js`) with dense auto-placement.** It scrambled card order (on phones Muse / Close-the-day / Pin appeared above "Next up"), and left dead zones beside short cards.
3. **Global `.q` rule in `layout.css`** boxed every Week/Month question heading like a button.
4. **Archive unreachable on mobile** (no tab, no link).
5. **Journal at the very bottom of Today**, two-thirds width, with empty space beside it.

## Per-page diagnosis

| Page | Problems found |
| --- | --- |
| Today | Journal last; 3 uneven columns with big gaps; 2583 px tall; mobile order scrambled; no way to hide/reorder cards |
| Week | 3987 px tall; single-column look-back/plan stacks; chart card very tall for little data; boxed headings |
| Month | Reflection/events pushed far down; calendar cells too tall; empty right column; boxed headings |
| Vision | Only a Pinterest embed (often blocked), nothing local |
| Archive | One long list; tables overflow on phones (420 > 390 px); no overview |
| Plan | Tab bar inconsistent; stale first paint; Tracks and Atelier left half the screen empty |
| Settings | Fine, but no layout controls |

## What changed

* **One definition per page**, no wrappers. 20 files → 9 (`index.html, style.css, data.js, content.js, syllabus.js (data only), core.js, food.js, imgstore.js, pages.js, main.js`). Removed `today.js, weekmonth.js, v2.js, vision.js, polish.js, layout.js, layout.css`.
* **12-column board grid** (`s3…s12` card widths). DOM order is the mobile reading order; no JS layout. Simple card stacks use CSS multi-column flow.
* **Today:** journal is the focal card, directly under "Next up", beside Check-in / Water / Move; on phones it is the third card. New glance chips, **Customize** panel (show/hide any card), per-card collapse arrows, Cozy/Compact density — all saved per device.
* **Plan:** a single router and one tab bar (Roadmap, Why & identity, Tracks, Toolkit, Atelier, Syllabus) on every tab.
* **Week / Month:** two-column look-back / plan and reflection, compact stat tiles, calendar cells shortened, rows balanced.
* **Vision:** real board — add/drag-drop images, captions, lightbox, saved and synced; Pinterest embed is now optional.
* **Archive:** past-year heatmap, streak tiles, two-column day list, tables scroll instead of overflowing; Archive icon added to the mobile top bar.
* **Service worker** cache bumped (v9) with the new file list.

## Measured (same seeded data)

Today 2583→2245 px, Week 3987→2032, Month 3252→~2460, Plan/Why 2954→1941, Mobile Today journal position: bottom → 674 px. Zero console errors, zero horizontal overflow at 390/820/1440.

## Ideas not done yet

Drag-to-reorder cards, per-page widget pickers beyond Today, a "focus mode" (Next up + Journal only), weekly heatmap on Week, and a printable monthly review.
