# Pre-release review · Hendese 0.3.0 → 0.4.0

| | |
|---|---|
| **Type** | Self-conducted code, accessibility and release-readiness review |
| **Reviewed version** | 0.3.0 (`b9dcc87`, tag `v0.3.0`) |
| **Retest** | 0.4.0 (`f8df50f`, tag `v0.4.0`) and the unreleased publication changes that follow it |
| **Date** | 2026-10-06 (review) · 2026-10-07 (retest) |
| **Reviewer** | Project maintainer |
| **Status** | Complete. Open items are tracked in [§6](#6-open-items). |

## 1. Summary

The review covered the run-time JavaScript, the stylesheets, the build and release tooling, the test suite and the package manifest. It found no data-loss or security defects.

It recorded 54 findings: 4 release blockers, 7 high, 22 medium and 21 low. They clustered in five areas:
- engine and widget resilience: one exception could stop the animation loop or later widgets;
- narrow-screen and print rendering;
- accessibility details;
- packaging;
- licensing and repository readiness.

Release 0.4.0 resolved every finding that did not depend on a publication decision. The publication work that followed resolved most of the rest. **7 items remain open or partly open**. None of them is High; the one Blocker, the mascot's provenance, is accepted for 0.x. See [§6](#6-open-items).

| Severity | Found | Resolved | Partly resolved | Open / accepted |
|---|---|---|---|---|
| Blocker | 4 | 3 | 0 | 1 |
| High | 7 | 7 | 0 | 0 |
| Medium | 22 | 22 | 0 | 0 |
| Low | 21 | 18 | 2 | 1 |

## 2. Scope

**In scope:**
- run-time JavaScript (`src/js`)
- stylesheets (`src/css`)
- build, demo and release tooling (`tools/`)
- the test suite (`tests/`)
- the package manifest
- licensing of bundled assets
- repository readiness for public release

**Out of scope:** hosting and deployment, third-party browser bugs, and the content of the documentation pages beyond its markup.

## 3. Method

1. Manual code review in four independent passes:
   - motion engine and mascot runtime;
   - interactive components and accessibility;
   - CSS architecture and tokens;
   - packaging and release.
2. Every finding was checked against the source at the reviewed commit. High-severity layout findings were reproduced in Chromium through Playwright, at 375 px and 1440 px, in light and dark themes and with reduced motion.
3. Accessibility was assessed against WCAG 2.2 AA and the WAI-ARIA Authoring Practices, using:
   - axe;
   - keyboard walkthroughs;
   - contrast calculations;
   - forced-colors and print emulation.
4. Each fix shipped with the smallest regression test that fails without it. The fix set was reviewed again before release, and that second review caught and corrected two regressions introduced by the first fix pass:
   - a lost frame timestamp;
   - silent explorer selections.

### Severity

| Level | Definition |
|---|---|
| Blocker | Prevents lawful or technical publication. |
| High | Breaks a documented feature for a realistic user or integrator, or disables unrelated functionality. |
| Medium | Incorrect behaviour in a plausible scenario, a WCAG 2.2 AA shortfall, or a contract inconsistency. |
| Low | Cosmetic, edge-case or developer-experience issue with a simple workaround. |

### Status

| Status | Meaning |
|---|---|
| Resolved | Fixed and covered by a test or a verified check. The version is noted. |
| Partly resolved | The defect is fixed for the common case; a documented remainder is open. |
| Open | Not yet addressed; planned. |
| Accepted | Deliberately kept for now, with a reason. |

## 4. Findings

### 4.1 Release and repository

| ID | Severity | Finding | Status |
|---|---|---|---|
| REL-01 | Blocker | No code licence; the package was marked private. | Resolved: MIT `LICENSE` and package metadata. `private` stays on until npm publication. |
| REL-02 | Blocker | Mascot artwork provenance is undocumented. | Partly addressed in 0.5.0: the palette changed (orange → turquoise); the silhouette is unchanged. Accepted for 0.x; a provenance note and an originality review are due before 1.0. |
| REL-03 | Blocker | Release `.zip` files were uncompressed tar archives (GNU `tar -a` ignores `.zip`). | Resolved in 0.4.0: zip written in Node, checked for the `PK` signature. |
| REL-04 | Blocker | Visual baselines existed for Windows only, so CI could not pass. | Resolved: Linux baselines produced in the official Playwright image; CI runs in the same image. |
| REL-05 | Medium | The release script did not re-check the tree after building, so a tag could differ from the packed files. | Resolved in 0.4.0. |
| REL-06 | Medium | IBM Plex Mono licence missing; font licences were not shipped next to the fonts. | Resolved in 0.4.0. |
| REL-07 | Medium | Repository metadata carried author details and internal references unsuitable for a public project. | Resolved: author metadata normalised, commit messages rewritten in English, references removed. |
| REL-08 | Medium | Documentation, the standard and the default UI strings were Turkish only. | Resolved: docs pages, part pages, `STANDARD.md`, the changelog and code comments are in English; UI strings default to English, with a Turkish set for `lang="tr"` pages. |
| REL-09 | Low | Stray screenshots committed in a directory named `-`. | Resolved in 0.4.0. |

### 4.2 Packaging

| ID | Severity | Finding | Status |
|---|---|---|---|
| PKG-01 | High | The ESM entry resolved to unbuilt source, so `version` reported `'dev'`. | Resolved in 0.4.0: entry is `dist/hendese.esm.js`. |
| PKG-02 | High | `main` and `default` resolved to an IIFE inside an ESM package. | Resolved in 0.4.0. |
| PKG-03 | Medium | Importing the module threw outside a browser (server rendering, Node test runners). | Resolved in 0.4.0. |
| PKG-04 | Low | No `engines` field; the unit-test glob needs Node 21 or newer. | Resolved in 0.4.0. |

### 4.3 Motion engine and navigation

| ID | Severity | Finding | Status |
|---|---|---|---|
| ENG-01 | High | One exception in a scene or hook permanently stopped the animation loop. | Resolved in 0.4.0: each callback runs in isolation; each distinct error is reported once. |
| ENG-02 | Medium | An unknown mascot pose threw inside the frame. | Resolved in 0.4.0: falls back to `idle`. |
| ENG-03 | Medium | Links to elements inside a section showed `0-1` in the section counter. | Resolved in 0.4.0: the enclosing section is locked. |
| ENG-04 | Medium | Percent-encoded (non-ASCII) hashes never matched; `replaceState` ran every frame. | Resolved in 0.4.0. |
| ENG-05 | Medium | A deep link to a short section was rewritten to the next section. | Resolved in 0.4.0. A rare remainder is listed in [§6](#6-open-items). |
| ENG-06 | Medium | The `themeKey` option was ignored before first paint. | Resolved in 0.4.0: `<html data-theme-key>`. |
| ENG-07 | Medium | Scenes registered after `start()` never went live. | Resolved in 0.4.0. |
| ENG-08 | Medium | Missing scene children threw, or matched elements elsewhere in the document. | Resolved in 0.4.0: the scene is skipped with a warning. |
| ENG-09 | Low | HUD fields kept the previous scene's values. | Resolved in 0.4.0. |
| ENG-10 | Low | The drawer focus trap survived a resize to desktop width. | Resolved in 0.4.0. |
| ENG-11 | Low | Fractional widths between 1099 and 1100 px matched neither mode. | Resolved in 0.4.0: range media queries. |
| ENG-12 | Low | `hoca.dismiss()` did not update reduced-motion still copies. | Resolved in 0.4.0. |
| ENG-13 | Low | Without a home position, the mascot idled at the viewport origin. | Resolved in 0.4.0: hidden instead. |
| ENG-14 | Low | Hero intro classes were styled but never applied. | Resolved in 0.4.0: documented as an integrator hook, screen-only. |
| ENG-15 | Low | Operating-system theme changes are ignored until reload. | Accepted: following them conflicts with the documented rule that an authored `data-theme` wins. Needs a contract decision. |

### 4.4 Components and accessibility

| ID | Severity | Finding | Status |
|---|---|---|---|
| WID-01 | High | One malformed widget aborted the initialisation of every widget after it. | Resolved in 0.4.0. |
| WID-02 | Medium | Runbook progress was stored by position, so an inserted step appeared done. | Resolved in 0.4.0: stored by item identity, with a one-time migration. |
| WID-03 | Medium | The explorer's hover and focus preview drove a live region (WCAG 4.1.3). | Resolved in 0.4.0: a status node announces selections only. |
| WID-04 | Medium | Card-table labels ignored `colspan` and picked up header controls. | Resolved in 0.4.0. Multi-row headers and `rowspan` remain open ([§6](#6-open-items)). |
| WID-05 | Medium | A focusable control sat inside the visually clipped header of card tables (WCAG 2.4.7). | Resolved in 0.4.0. |
| WID-06 | Medium | Explorer details were hidden without JavaScript and in print. | Resolved in 0.4.0. |
| WID-07 | Medium | The unchecked runbook box border was about 1.5:1 (WCAG 1.4.11). | Resolved in 0.4.0. |
| WID-08 | Low | Hovering an invalid field hid its error border. | Resolved in 0.4.0. |
| WID-09 | Low | Hovering the skip link dropped its contrast below 3:1. | Resolved in 0.4.0. |
| WID-10 | Low | The copy button re-announced its reset; repeated clicks overlapped. | Resolved in 0.4.0. |
| WID-11 | Low | An empty runbook reported "complete". | Resolved in 0.4.0. |
| WID-12 | Low | The explorer's "selected" badge entered the accessible name. | Resolved in 0.4.0. |
| WID-13 | Low | Field `aria-describedby` sync dropped ids added later. | Resolved in 0.4.0. |
| WID-14 | Low | Right-to-left layouts are not supported. | Partly resolved: logical radii on `.field-unit`; arrow-key mirroring and other physical properties are open. |

### 4.5 Stylesheets

| ID | Severity | Finding | Status |
|---|---|---|---|
| CSS-01 | High | On narrow screens the top bar covered the open drawer and its close button. | Resolved in 0.4.0 (reproduced and retested at 375 px). |
| CSS-02 | High | Pin frames never collapsed to one column (a later layer won over the container query). | Resolved in 0.4.0 (reproduced and retested at 375 px). |
| CSS-03 | High | Code blocks and the dark theme printed as pale ink on white paper. | Resolved in 0.4.0. |
| CSS-04 | Medium | Wide tables and long code lines were clipped on paper. | Resolved in 0.4.0. |
| CSS-05 | Medium | Forced-colors gaps: HUD bar, progress bar, active navigation link, current rows, `aria-disabled`. | Resolved in 0.4.0. |
| CSS-06 | Low | The joined corner of `.field-unit` inputs stayed rounded. | Resolved in 0.4.0. |
| CSS-07 | Low | Dead and misleading selectors and comments. | Resolved in 0.4.0. |

### 4.6 Tooling and the standard

| ID | Severity | Finding | Status |
|---|---|---|---|
| TOOL-01 | Medium | The build failed on paths containing spaces or non-ASCII characters. | Resolved in 0.4.0. |
| TOOL-02 | Medium | The standard test could be bypassed: negative values, modern color functions, multi-line values, unused exceptions. | Resolved in 0.4.0. |
| TOOL-03 | Low | The icon-inlining tool never matched its marker. | Resolved in 0.4.0: tool removed, sprite inlined. |
| TOOL-04 | Low | The demo generator kept stale pages and reported only the first duplicate. | Resolved in 0.4.0. |
| TOOL-05 | Low | Weak changelog check; no checksums for release artifacts. | Partly resolved: changelog check is strict; checksums are open. |

## 5. Hardening backlog

These items were not defects at review time. They become part of the public contract and should be settled before 1.0.

| # | Topic | Status |
|---|---|---|
| H-1 | `Hendese.destroy()` for single-page apps and hot reload | Open |
| H-2 | `Hendese.upgrade(root)` for content added after start | Open |
| H-3 | Add the `js` class from `init()` so a failed bundle cannot leave a half-initialised page | Open |
| H-4 | Browser support statement | Resolved (README) |
| H-5 | Document that layered `!important` rules cannot be overridden by consumers | Open |
| H-6 | Document that derived color tokens resolve at `:root` | Open |
| H-7 | NaN-safe math helpers and zero-height drawings | Resolved in 0.4.0 |
| H-8 | Preserve `history.state` and authored inline styles | Resolved in 0.4.0 |
| H-9 | Stateful `englishStems` regex; modifier keys in tabs | Resolved in 0.4.0 |
| H-10 | Runbook live regions: no announcement on load, labelled lists, completion status | Partly resolved |
| H-11 | Distinct dialog focus style | Resolved in 0.4.0 |
| H-12 | Explicit anchor for the dimension-note popover | Open |
| H-13 | Smaller inline stylesheet and package payload | Open |
| H-14 | Narrower `exports` surface | Open |
| H-15 | Regression tests for the fixed behaviour | Resolved in 0.4.0 |
| H-16 | Contribution and security guidelines, continuous integration | Resolved |

## 6. Open items

| Item | Severity | Plan |
|---|---|---|
| REL-02 · mascot provenance | Blocker (accepted for 0.x; palette changed in 0.5.0) | Provenance note and originality review before 1.0. |
| ENG-05 remainder | Low | A deep link stays locked for up to 4 s if the user scrolls only by dragging the scrollbar in browsers that fire no pointer event for it. |
| ENG-15 · follow OS theme changes | Low | Decide the contract first. |
| WID-04 remainder | Low | Card labels read only the first header row and ignore `rowspan`. |
| WID-14 · right-to-left | Low | Declare LTR-only for 1.0 or migrate to logical properties. |
| TOOL-05 · checksums | Low | Publish `SHA256SUMS` with each release. |
| Hardening H-1–3, H-5, H-6, H-10, H-12–14 | Low / design | See [§5](#5-hardening-backlog). |

## 7. Verified as sound

These areas were checked specifically and found correct:
- **Global namespace:** one global (`Hendese`).
- **Double initialisation:** guarded.
- **Native dialog:** restores focus on close, both natively and on the fallback path.
- **Tabs:** follow the APG pattern.
- **Contrast:** every text-color token meets WCAG AA in both themes.
- **Fonts:** subsets cover the Turkish alphabet and use `font-display: swap`.
- **Repository and build output:** no secrets, credentials or absolute local paths in the repository or in `dist/`.
- **Build output:** byte-identical on Windows and Linux.
