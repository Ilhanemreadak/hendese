# Hendese 0.3.0 — Pre-release Audit Report

| | |
|---|---|
| **Package** | `hendese` 0.3.0 |
| **Revision** | `f6b7cae` (tag `v0.3.0`) |
| **Date** | 2026-10-06 |
| **Scope** | Runtime JS (`src/js`), stylesheets (`src/css`), build and release tooling (`tools/`), test suite (`tests/`), package manifest, documentation, licensing |
| **Method** | Four independent advisor reviews (motion engine, components and accessibility, CSS architecture, release readiness), followed by editorial verification against source and targeted browser reproduction (Chromium, Playwright) |
| **Status** | Final · resolution status for 0.4.0 in §8 |

---

## 1. Executive summary

Hendese is functionally sound on its primary path. The current test suite passes (98 end-to-end, 6 unit), and four separate reviews did not find a data-loss or security defect. But it is **not ready for public release**. The audit identified **4 release blockers**, **7 high-severity defects** and a set of medium and low issues. They cluster in five areas:

1. **Legal and provenance.** The code has no licence, the package is marked private, and the mascot sprite has unresolved provenance.
2. **Distribution.** The `.zip` release artifacts are not zip files. The ESM entry point resolves to unbuilt source. Importing the module outside a browser throws.
3. **Runtime resilience.** A single exception in any scene, hook or widget permanently disables the engine or every widget initialised after it.
4. **Responsive and print rendering.** On narrow screens the top bar covers the navigation drawer and pin frames keep their desktop columns. Printed code is near-invisible.
5. **Accessibility.** One state is ambiguous to screen readers, several controls fall below non-text contrast minimums, and the finished-state contract is broken for one component.

All high-severity items are small, local fixes. Section 6 proposes a remediation sequence: one patch release, one minor release and a short pre-publication checklist.

### Release verdict

| Gate | Result |
|---|---|
| Functional correctness (primary path) | Pass |
| Automated test suite | Pass on Windows only (see REL-04) |
| Accessibility (WCAG 2.2 AA) | Conditional: 2 Medium contrast and semantics issues open |
| Distribution artifacts | **Fail** (REL-03, PKG-01, PKG-02) |
| Legal readiness for open source | **Fail** (REL-01, REL-02) |

---

## 2. Severity and verification scales

**Severity**

| Level | Definition |
|---|---|
| **Blocker** | Prevents lawful or technical publication. Must be resolved before any public release. |
| **High** | Breaks a documented feature for a realistic user or integrator, or disables unrelated functionality. |
| **Medium** | Incorrect behaviour in a plausible but non-default scenario, an accessibility shortfall against WCAG 2.2 AA, or a contract inconsistency. |
| **Low** | Cosmetic, edge-case, or developer-experience issue with a simple workaround. |

**Verification**

| Status | Meaning |
|---|---|
| **Reproduced** | Observed in a browser run against the built package. |
| **Confirmed** | Verified by the editor against the source at `f6b7cae`. |
| **Reported** | Identified by advisor code reading with quoted evidence; not independently re-run. |

---

## 3. Findings index

| ID | Severity | Area | Title | Verification |
|---|---|---|---|---|
| REL-01 | Blocker | Licensing | No code licence; package marked private | Confirmed |
| REL-02 | Blocker | Provenance | Mascot sprite provenance and trademark unresolved | Confirmed |
| REL-03 | Blocker | Release | `.zip` artifacts are uncompressed tar archives | Confirmed |
| REL-04 | Blocker | Testing | Visual baselines exist for Windows only | Confirmed |
| ENG-01 | High | Engine | One exception permanently halts the animation loop | Confirmed |
| WID-01 | High | Widgets | One malformed widget aborts all later widget initialisation | Confirmed |
| CSS-01 | High | Layout | Top bar covers the open navigation drawer on narrow screens | Reproduced |
| CSS-02 | High | Layout | Pin frames never collapse to a single column | Reproduced |
| CSS-03 | High | Print | Code blocks and dark theme print light-on-white | Confirmed |
| PKG-01 | High | Packaging | ESM entry resolves to unbuilt source (`version === 'dev'`) | Confirmed |
| PKG-02 | High | Packaging | `main` / `default` resolve to an IIFE in an ESM package | Confirmed |
| PKG-03 | Medium | Packaging | Importing the module throws outside a browser | Confirmed |
| REL-05 | Medium | Release | Release script does not re-verify the tree after building | Reported |
| REL-06 | Medium | Licensing | IBM Plex Mono licence missing; font licences not shipped in `dist/` | Confirmed |
| REL-07 | Medium | Readiness | Corporate identity in git history; internal references in tracked files | Confirmed |
| REL-08 | Medium | Readiness | Documentation, standard and UI defaults are Turkish-only | Confirmed |
| ENG-02 | Medium | Engine | Unknown Hoca pose throws inside the frame | Confirmed |
| ENG-03 | Medium | Navigation | Hash targets that are not sections corrupt the rail counter | Confirmed |
| ENG-04 | Medium | Navigation | Percent-encoded hashes never match; `replaceState` runs every frame | Reported |
| ENG-05 | Medium | Navigation | Deep link to a short section is rewritten to the next section | Reported |
| ENG-06 | Medium | Theme | `themeKey` option is ignored when `head.js` is inlined | Confirmed |
| ENG-07 | Medium | Lifecycle | Scenes registered after `start()` never go live | Reported |
| ENG-08 | Medium | Lifecycle | Missing scene children throw or query the whole document | Reported |
| WID-02 | Medium | Widgets | Runbook state is stored by position and drifts between versions | Confirmed |
| WID-03 | Medium | A11y | Explorer hover/focus preview drives a live region | Reported |
| WID-04 | Medium | A11y | Card-table labels ignore `colspan`, row headers and header controls | Confirmed |
| WID-05 | Medium | A11y | Focusable control inside the clipped table header | Confirmed |
| WID-06 | Medium | Contract | Explorer details are hidden without JavaScript and in print | Confirmed |
| WID-07 | Medium | A11y | Unchecked runbook box border is about 1.5:1 | Confirmed |
| CSS-04 | Medium | Print | Wide tables and long code lines are clipped on paper | Confirmed |
| CSS-05 | Medium | A11y | Forced-colours gaps (HUD bar overridden, several states lost) | Reported |
| TOOL-01 | Medium | Build | Build fails on paths containing spaces or non-ASCII characters | Confirmed |
| TOOL-02 | Medium | Standard | Standard test can be bypassed and disagrees with `STANDART.md` | Reported |
| ENG-09 | Low | HUD | HUD fields go stale when the owning scene changes | Confirmed |
| ENG-10 | Low | Navigation | Drawer focus trap survives a resize to desktop width | Reported |
| ENG-11 | Low | Breakpoints | Fractional viewport widths between 1099 and 1100 px match neither mode | Reported |
| ENG-12 | Low | Hoca | `dismiss()` does not update reduced-motion still copies | Reported |
| ENG-13 | Low | Hoca | Without `#hoca-home`, the idle position is viewport (0, 0) | Reported |
| ENG-14 | Low | Contract | Hero intro classes are styled but never applied by the library | Confirmed |
| ENG-15 | Low | Theme | OS colour-scheme changes are ignored until reload | Reported |
| WID-08 | Low | A11y | Hovering an invalid field hides its error border | Confirmed |
| WID-09 | Low | A11y | Hovering the skip link drops contrast below 3:1 | Confirmed |
| WID-10 | Low | A11y | Copy-button feedback re-announces the reset; timers overlap | Reported |
| WID-11 | Low | Widgets | An empty runbook reports "complete" and a `NaN%` bar | Reported |
| WID-12 | Low | A11y | Explorer uses toggle semantics for single selection; badge enters accessible name | Reported |
| WID-13 | Low | A11y | `aria-describedby` sync uses a stale snapshot and an unescaped selector | Reported |
| WID-14 | Low | i18n | Right-to-left layouts are not supported | Reported |
| CSS-06 | Low | CSS | `.field-unit` input keeps its joining corner radius | Reported |
| CSS-07 | Low | CSS | Dead and misleading selectors | Reported |
| TOOL-03 | Low | Tooling | `icons-inline.mjs` is non-functional; template ships without icons | Confirmed |
| TOOL-04 | Low | Tooling | Demo generator: stale output, unescaped metadata, partial duplicate check | Reported |
| TOOL-05 | Low | Release | Weak CHANGELOG check; no checksums; README order mismatch | Reported |
| REL-09 | Low | Repository | Stray directory `-/` with screenshots is committed | Confirmed |
| PKG-04 | Low | Packaging | `engines` field missing; unit glob requires Node ≥ 21 | Reported |

**Totals:** 4 Blocker · 7 High · 22 Medium · 21 Low (54 findings).

---

## 4. Detailed findings

### 4.1 Release, licensing and readiness

#### REL-01 · Blocker · No code licence; package marked private
- **Location:** `package.json:5` (`"private": true`); no `license`, `repository`, `bugs`, `homepage` or `keywords` fields; no `LICENSE` file; `README.md:86` states that no licence has been chosen.
- **Impact:** Without a licence the code is all rights reserved, so third parties cannot legally use it. `npm publish` refuses the package.
- **Fix:** Choose a licence (MIT recommended), add `LICENSE`, set `"license"` and remove `"private"` in the same commit, and add the repository metadata fields.

#### REL-02 · Blocker · Mascot sprite provenance and trademark unresolved
- **Location:** `src/js/hoca.js:5–8` (sprite description and palette, primary colour `#d97757`).
- **Issue:** The sprite and its primary colour closely resemble the pixel mascot of a third-party commercial AI product. Its origin is not documented.
- **Impact:** Trademark and copyright exposure for a public design system.
- **Fix:** Redesign the sprite (silhouette and palette) or obtain written clearance. Record the origin in a `NOTICE` file.

#### REL-03 · Blocker · `.zip` artifacts are uncompressed tar archives
- **Location:** `tools/release.mjs:22`: `tar -a -c -f releases/hendese-${v}.zip …`
- **Issue:** `tar -a` chooses the format from the file suffix only in bsdtar. GNU tar, which is the default on Linux and is placed first on `PATH` by Git for Windows, writes a plain tar archive. Every published `.zip` (0.1.0–0.3.0) starts with a tar header, not `PK`.
- **Impact:** Users who do not use npm receive an archive that zip tools cannot open.
- **Fix:** Build the zip in Node, or invoke `bsdtar --format zip` explicitly. Before tagging, assert that the first two bytes are `PK`. Re-issue the affected artifacts.

#### REL-04 · Blocker · Visual baselines exist for Windows only
- **Location:** `tests/e2e/pages.spec.mjs-snapshots/*-win32.png`; `playwright.config.mjs:7`.
- **Impact:** `npm test` and the release script fail on Linux, macOS and any CI runner, so contributors cannot get a green build.
- **Fix:** Generate Linux baselines in the official Playwright container and treat them as the source of truth. Until then, restrict screenshot assertions to `win32`.

#### REL-05 · Medium · Release script does not re-verify the tree after building
- **Location:** `tools/release.mjs:8–9` (clean-tree check) runs before the build at `:14`. Nothing is checked between the build and `git tag`.
- **Impact:** A tag can reference committed `dist/` and `demos/` content that differs from what was packed. The current tags are consistent.
- **Fix:** Re-run `git status --porcelain` after the build and abort if anything changed.

#### REL-06 · Medium · IBM Plex Mono licence missing; font licences not shipped in `dist/`
- **Location:** `src/fonts/` contains only `OFL-ibm-plex-sans.txt` and `OFL-pixelify-sans.txt`. Six `ibm-plex-mono-*.woff2` files ship without a notice. `dist/fonts/` and `dist/hendese.inline.css` carry no licence.
- **Impact:** Non-compliance with SIL OFL 1.1 §2.
- **Fix:** Add `OFL-ibm-plex-mono.txt`, copy all `OFL-*.txt` files into `dist/fonts/` during the build, and confirm the Reserved Font Name status.

#### REL-07 · Medium · Corporate identity in git history; internal references in tracked files
- **Location:**
  - all commits and annotated tags use a corporate e-mail domain;
  - `tools/release.mjs:3` contains `(bkz. plan P6)`;
  - `CHANGELOG.md:7` refers to an internal advisor review.
- **Impact:** Contradicts the package's own hygiene rule (`tests/unit/hygiene.test.mjs:1`), which says no organisation names may ship.
- **Fix:** Decide whether to publish with history. If not, rewrite authorship with `git filter-repo --mailmap` or squash it. Remove the internal references.

#### REL-08 · Medium · Documentation, standard and UI defaults are Turkish-only
- **Scope:** `README.md`, `STANDART.md`, `CHANGELOG.md`, `docs/`, `demos/`, code comments, the `package.json` description, and the default `strings`.
- **Impact:** International contributors and integrators cannot use the package without translation.
- **Fix:** Publish English as the primary documentation language (README, contribution standard, API reference, changelog). Keep Turkish as a maintained localisation. Ship an English `strings` preset alongside the Turkish default.

#### REL-09 · Low · Stray directory `-/` with screenshots is committed
- **Location:** `-/dv-1180.png`, `-/dv-1280.png`, `-/dv-1366.png`, `-/dv-1440.png` (added in `896ca09`).
- **Fix:** `git rm -r -- ./-`.

### 4.2 Packaging

#### PKG-01 · High · ESM entry resolves to unbuilt source
- **Location:** `package.json:9` and `:13` point to `./src/js/index.js`. `src/js/index.js:15` falls back to `'dev'` when `__VERSION__` is undefined.
- **Impact:** Every bundler consumer receives untranspiled source and `version === 'dev'`. The built `dist/hendese.esm.js` is referenced by no entry point and by no test.
- **Fix:** Point `module` and `exports["."].import` to `./dist/hendese.esm.js`.

#### PKG-02 · High · `main` / `default` resolve to an IIFE in an ESM package
- **Location:** `package.json:8` and `:14` point to `dist/hendese.js`, which begins `var Hendese = (() => {`.
- **Impact:** `require('hendese')` and any resolver that falls through to `default` receive a module with no exports.
- **Fix:** Map `default` to the ESM build. Expose the IIFE through `unpkg` / `jsdelivr` fields. Add a `"./package.json"` export.

#### PKG-03 · Medium · Importing the module throws outside a browser
- **Location:** `src/js/core.js:9` and `:11` call `matchMedia`, `window.scrollY` and `innerHeight` at module evaluation.
- **Impact:** `import 'hendese'` throws `ReferenceError` during server rendering and in Node-based test runners.
- **Fix:** Create the media queries and read viewport values lazily inside `start()`.

#### PKG-04 · Low · `engines` field missing
- **Location:** `package.json:36` relies on Node ≥ 21 expanding `tests/unit/*.test.mjs` itself.
- **Fix:** Add `"engines": { "node": ">=21" }`. Document `npx playwright install chromium` in the contributor setup.

### 4.3 Motion engine and runtime

#### ENG-01 · High · One exception permanently halts the animation loop
- **Location:** `src/js/core.js:21–31`. `wake()` sets `S.sleeping = false`; only the last line of `frame()` reschedules the loop or sets it back to sleep.
- **Failure scenario:** A scene's `render` throws once. The loop never sleeps or reschedules, so every later `wake()` is a no-op. Section tracking, progress bar, HUD, Hoca and all scenes freeze for the lifetime of the page.
- **Fix:** Wrap the body of `frame()` in `try … finally`, and isolate each scene `tick` and each hook so one failure is reported without stopping the others.

#### ENG-02 · Medium · Unknown Hoca pose throws inside the frame
- **Location:** `src/js/hoca.js:139` (`anchors[s.pose]` with no fallback) and `:107` (`img.src = srcs[p]`).
- **Failure scenario:** A scene returns `{ hoca: { pose: 'pointup' } }`. This throws a `TypeError`, which triggers ENG-01, and also requests `/undefined`.
- **Fix:** Fall back to `idle` when the pose is unknown, as `place()` already does. Warn once in development.

#### ENG-03 · Medium · Hash targets that are not sections corrupt the rail counter
- **Location:** `src/js/nav.js:14` (`lockTo` accepts any id) and `:24` (`sections.indexOf` returns `-1`).
- **Failure scenario:** A link to `#fig-2` or a footnote shows `0-1 / 7` in the rail and the top bar, and clears `aria-current` from every navigation link for up to 1.6 s.
- **Fix:** Resolve the id to its enclosing `[data-section]` inside `lockTo`.

#### ENG-04 · Medium · Percent-encoded hashes never match
- **Location:** `src/js/nav.js:29`, `:43`, `:78` compare `location.hash` (percent-encoded) with raw ids.
- **Impact:** For non-ASCII ids, which are likely in a Turkish-first package:
  - `replaceState` is called on every dirty frame and hits browser throttling;
  - deep links are never re-anchored.
- **Fix:** Decode once with a `hashId()` helper (`decodeURIComponent` inside `try`) and compare ids, not strings.

#### ENG-05 · Medium · Deep link to a short section is rewritten to the next section
- **Location:** `src/js/nav.js:82–88` (landing sets no lock) together with `:34–43`.
- **Failure scenario:**
  1. Open `page.html#b3`, where `#b3` is shorter than about 34% of the viewport.
  2. The first update rewrites the hash to `#b4`.
  3. The later `reanchor()` call, run after fonts load, scrolls to `#b4`.
- **Fix:** Lock to the landing target, suppress `syncHash` while `S.anchorUntil` is active, and keep the landing id in memory instead of re-reading `location.hash`.

#### ENG-06 · Medium · `themeKey` option is ignored when `head.js` is inlined
- **Location:** `tools/build.mjs:31` hard-codes `'hendese-theme'`. `src/js/theme.js:8` reads storage only when `data-theme` is absent, and `head.js` always sets it.
- **Failure scenario:** With `Hendese.init({ themeKey: 'site-theme' })`, the user's choice is saved but never restored after a reload.
- **Fix:** Have `head.js` read the key from `<html data-theme-key>`, or have `theme.init` always prefer the stored value under `key`.

#### ENG-07 · Medium · Scenes registered after `start()` never go live
- **Location:** `src/js/scenes.js:37`, `:62`, `:90`, `:114` push to `SCENES` only. `evalMotion()` runs only from `start()` and on media-query changes. `hoca-controller.js:48` decides at start whether to create Hoca.
- **Impact:** Lazily loaded content stays static. With no home element present at start, no Hoca is ever created.
- **Fix:** Track a `started` flag. On late registration, call `setLive(S.motion)` and `measure()`, and lazily initialise the Hoca controller.

#### ENG-08 · Medium · Missing scene children throw or query the whole document
- **Location:**
  - `src/js/core.js:3`: `$(s, null)` falls back to `document`.
  - `src/js/scenes.js:27`, `:50`, `:70`, `:77`.
  - `src/js/index.js:29`: `started` is set before the work that can throw.
- **Failure scenario:**
  1. A sticky block is missing its `.sticky-fig` wrapper.
  2. The scene binds to another scene's drawing.
  3. `start()` throws midway, which skips anchoring and font handling.
  4. `start()` cannot be retried.
- **Fix:** Return `null` from `$` when the root is explicitly `null`. Have the scene factories return `null` with a warning when a required child is missing.

#### ENG-09 · Low · HUD fields go stale when the owning scene changes
- **Location:** `src/js/hud.js:7` writes only the keys present in the winning scene's `hud` object.
- **Fix:** Iterate over all known fields and clear the ones that are absent.

#### ENG-10 · Low · Drawer focus trap survives a resize to desktop width
- **Location:** `src/js/nav.js:62–67`.
- **Fix:** Close the drawer when `MQ_WIDE` starts matching.

#### ENG-11 · Low · Fractional viewport widths match neither mode
- **Location:** `src/css/hoca.css:41` and `src/css/layout.css:72` use `(max-width:1099px)`; `src/js/core.js:9` uses `(min-width:1100px)`.
- **Fix:** Use the range form `(width < 1100px)` so the CSS query is the exact complement of the JavaScript query.

#### ENG-12 · Low · `dismiss()` does not update reduced-motion still copies
- **Location:** `src/js/hoca-controller.js:54`.
- **Fix:** Call `refresh()` from `dismiss()` and from the `dismissed` setter.

#### ENG-13 · Low · Without `#hoca-home`, the idle position is viewport (0, 0)
- **Location:** `src/js/hoca-controller.js:11`, `:19`, `:50`.
- **Fix:** When there is no home element and no scene claims the Hoca, render it hidden.

#### ENG-14 · Low · Hero intro classes are styled but never applied
- **Location:** `src/css/motion.css:84–89` documents `intro-pending` / `intro-go` as library-applied. No package code adds them.
- **Fix:** Either implement the intro in `start()` (live mode only) or document it as an integrator-applied hook. Move the rule under `@media screen` to honour STANDART §5.

#### ENG-15 · Low · OS colour-scheme changes are ignored until reload
- **Location:** `tools/build.mjs:31` and `src/js/theme.js:8–9` always write `data-theme`, which overrides `color-scheme: light dark`.
- **Fix:** Write `data-theme` only when a choice is stored, or listen for `prefers-color-scheme` changes while nothing is stored.

### 4.4 Interactive components and accessibility

#### WID-01 · High · One malformed widget aborts all later widget initialisation
- **Location:**
  - `src/js/widgets.js:14`: `$('span', btn)` can be `null`, and the next call is `label.setAttribute(…)`.
  - `src/js/widgets.js:98` runs every initialiser in sequence without isolation.
- **Failure scenario:**
  1. Add an icon-only copy button.
  2. Runbooks, explorers, tabs, the dialog fallback and form wiring never initialise.
  3. In browsers without Invoker Commands, dialogs become unreachable.
- **Fix:** Fall back to the button itself when there is no `<span>`. Run each initialiser inside its own `try … catch` that reports the error.

#### WID-02 · Medium · Runbook state is stored by position
- **Location:** `src/js/widgets.js:28`, `:32`.
- **Failure scenario:** A new step is inserted at position 2 in a later docs version. Returning users see the new, never-performed step as done. For an operations checklist this is a safety issue.
- **Fix:** Key the stored state by a stable identifier (`value`, `name` or `id`, falling back to the item text), and discard unknown keys. Migrate the existing array format once.

#### WID-03 · Medium · Explorer hover/focus preview drives a live region
- **Location:** `src/js/widgets.js:50–53`; the panels use `aria-live="polite"`.
- **Impact:** Every hover and focus change is announced, and leaving a station re-announces the selection (WCAG 4.1.3).
- **Fix:** Update the live region only from `select()`, and make preview visual only.

#### WID-04 · Medium · Card-table labels ignore `colspan`, row headers and header controls
- **Location:** `src/js/widgets.js:8–9`.
- **Failure scenario:**
  - In `demos/_src/renkler.html:91–93` and `docs/tokens.html`, cells following a `colspan="2"` cell are labelled with the wrong header.
  - In `demos/_src/olcu-notu.html:40`, the label includes the popover text.
- **Fix:** Track a running column index that accounts for `colSpan`, and take the label from the header text, excluding interactive and popover descendants. Allow a `data-th` override on `<th>`.

#### WID-05 · Medium · Focusable control inside the clipped table header
- **Location:** `src/css/components.css:179` clips `thead` to 1 px in card mode while its buttons stay in the tab order.
- **Impact:** Focus lands on an invisible control (WCAG 2.4.7, 2.4.11).
- **Fix:** Document "no interactive content in `<th>`", or remove such controls from the tab order in card mode.

#### WID-06 · Medium · Explorer details are hidden without JavaScript and in print
- **Location:** `src/css/blueprint.css:89–90`; the contract comment at `:66` names `data-explorer-panel`, but the script resolves the panel by id.
- **Impact:**
  - Violates STANDART §5 ("CSS never hides what only JavaScript can reveal").
  - The demo works around it by hand-writing `.show`, which violates STANDART §3.
  - Without JavaScript or on paper, only one station description is visible.
- **Fix:** Scope the rule to `.js .st-detail [data-for]:not(.show)`, show all panels in print, and correct the contract comment.

#### WID-07 · Medium · Unchecked runbook box border is about 1.5:1
- **Location:** `src/css/components.css:86` uses `--line-2` (20 % alpha). The native checkbox is visually hidden, so this border is the only indicator.
- **Impact:** Fails WCAG 1.4.11 (non-text contrast, 3:1) in both themes.
- **Fix:** Use `--ink-3`, consistent with `.field` controls.

#### WID-08 · Low · Hovering an invalid field hides its error border
- **Location:** `src/css/components.css:224` (specificity 0,3,1) overrides `:227` (0,2,1).
- **Fix:** Exclude invalid fields from the hover rule.

#### WID-09 · Low · Hovering the skip link drops contrast below 3:1
- **Location:** `src/css/base.css:7` (`a:hover`, 0,1,1) overrides `.skip` (0,1,0) at `:18`.
- **Fix:** `.skip, .skip:hover { color: var(--accent-ink) }`.

#### WID-10 · Low · Copy-button feedback re-announces the reset
- **Location:** `src/js/widgets.js:14`, `:17`.
- **Fix:** Keep one timer and clear it on repeated clicks. Announce through a separate visually hidden status node and clear it, instead of writing "Copy" back into a live region.

#### WID-11 · Low · An empty runbook reports "complete"
- **Location:** `src/js/widgets.js:30`.
- **Fix:** Treat `total === 0` as incomplete and set the bar width to 0.

#### WID-12 · Low · Explorer selection semantics
- **Location:**
  - `src/js/widgets.js:47`: `aria-pressed` is used for single selection.
  - `src/css/blueprint.css:80`: the "selected" badge is added to the accessible name.
- **Fix:** Use `content: var(--str-selected) / ""`. Either document the radio-like behaviour or move to `aria-current`.

#### WID-13 · Low · `aria-describedby` sync uses a stale snapshot
- **Location:** `src/js/widgets.js:88–91`.
- **Fix:** Recompute the base list inside `sync()` from the current attribute, and build the selector with `CSS.escape()`.

#### WID-14 · Low · Right-to-left layouts are not supported
- **Location:**
  - physical properties in `components.css`, for example `:247` and `.tbl th { text-align: left }`;
  - tab arrow keys are not mirrored (`widgets.js:71`).
- **Fix:** Declare the package LTR-only for 1.0, or migrate to logical properties and mirror the arrow keys under `dir="rtl"`.

### 4.5 Stylesheets and layout

#### CSS-01 · High · Top bar covers the open navigation drawer on narrow screens
- **Location:** `src/css/layout.css:8`: `.shell { position: relative; z-index: 1 }` creates a stacking context that contains the drawer and the scrim, while `.topbar` (`--z-topbar: 40`) sits outside it.
- **Reproduction:** At 375 px, open the drawer. The close button's centre hit-tests to `.topbar`.
- **Fix:** Remove `z-index: 1` from `.shell`. Document order alone already paints it above the rulers.

#### CSS-02 · High · Pin frames never collapse to a single column
- **Location:** `src/css/motion.css:15` (`.pin .frame { grid-template-columns: minmax(0,1fr) 232px }`) is in a later layer than the container query at `src/css/blueprint.css:108–110`.
- **Reproduction:** At 375 px the computed columns are `61px 232px`.
- **Fix:** Scope the two-column rule to live mode (`@media screen` and `.pin.is-live`), or repeat the container query in `motion.css`.

#### CSS-03 · High · Code blocks and dark theme print light-on-white
- **Location:** `src/css/tokens.css:90` (`--code-ink: #dfe6f1`). `src/css/print.css` sets neither `color-scheme` nor code colours.
- **Impact:** Browsers drop backgrounds when printing by default. Printed code, `.scene-dark` content and every page in dark theme come out almost invisible.
- **Fix:** In the print layer, force `color-scheme: light` on `:root`, `html[data-theme]` and `.scene-dark`, and remap the code tokens to ink tokens.

#### CSS-04 · Medium · Wide tables and long code lines are clipped on paper
- **Location:** `src/css/components.css:28`, `:53–54`, `:61`. The print stylesheet resets neither `overflow` nor `min-width`.
- **Fix:** In print, set `overflow: visible` on `.tbl` and `.code pre`, set `min-width: 0` on `.tbl table`, and use `white-space: pre-wrap` on `pre`. Consider printing `.dim-tip` content inline.

#### CSS-05 · Medium · Forced-colours gaps
- **Locations:**
  - `src/css/motion.css:82` overrides the `.hud-bar i` forced-colours rule in `components.css:210`, because the motion layer comes later.
  - `.nav-link.is-active` (`layout.css:27–29`), `.register dl>div.now` (`components.css:135`), `.code .ln.cur` (`:170`) and `.progress i` (`layout.css:5`) rely on backgrounds or shadows only.
  - `[aria-disabled="true"]` is not mapped to `GrayText`.
- **Fix:** Add a forced-colours block in `motion.css`, and extend the existing `Highlight` / `GrayText` selector lists.

#### CSS-06 · Low · `.field-unit` input keeps its joining corner radius
- **Location:** `src/css/components.css:221` (0,2,1) overrides `:246` (0,1,1). Line `:247` also uses physical radii.
- **Fix:** Raise the selector to `.field .field-unit > input`, and use logical radii on the unit span.

#### CSS-07 · Low · Dead and misleading selectors
- **Unused rules:**
  - `.nav-link::after` (`layout.css:30–32`) has no `content`;
  - `.cue` (`motion.css:9`) is unused;
  - `.co, .tbl, .code { box-shadow: none }` (`print.css:8`) does nothing;
  - `.nav-page` is used in nine pages but never styled.
- **Wrong comment:** `blueprint.css:183` calls the `.s-*` block "the last rules in the last layer", which is false.
- **Fix:** Delete or correct each.

### 4.6 Tooling and the standard

#### TOOL-01 · Medium · Build fails on paths containing spaces or non-ASCII characters
- **Location:** `tools/build.mjs:12` and `tools/demos.mjs:10` use `URL.pathname`, which is percent-encoded.
- **Impact:** The build breaks under user folders such as `C:\Users\Çağrı\…` or `~/My Projects/`.
- **Fix:** `fileURLToPath(new URL('..', import.meta.url))`.

#### TOOL-02 · Medium · Standard test can be bypassed and disagrees with `STANDART.md`
- **Location:** `tests/unit/standard.test.mjs:14–27`.
- **Gaps:**
  - negative pixel values (`components.css:132`, `:193`) are not flagged;
  - modern colour functions (`oklch`, `lab`, `color()`) and named colours pass;
  - `rem`, `em` and `pt` font sizes pass;
  - multi-line values are not scanned;
  - a `std:ok` marker exempts the whole line;
  - spacing is enforced only in `components.css` and `blueprint.css`, while STANDART §1 claims five files.
- **Fix:**
  - strip comments first, then match declarations across the whole file;
  - extend the colour and unit patterns;
  - make `std:ok` exempt only the last declaration on its line;
  - align `SPACING_FILES` with §1, or correct §1.

#### TOOL-03 · Low · `icons-inline.mjs` is non-functional
- **Location:** `tools/icons-inline.mjs:6` matches `<!-- @@ICONS -->`, but `docs/_sablon.html:12` contains a longer marker. No script invokes the tool.
- **Impact:** The shipped template has no icon sprite.
- **Fix:** Inline the sprite once and delete the tool, or fix the marker and run the tool from `build`.

#### TOOL-04 · Low · Demo generator robustness
- **Location:** `tools/demos.mjs`.
- **Gaps:**
  - outputs whose source was deleted are never pruned;
  - metadata values are interpolated into HTML unescaped (`:53`, `:132`);
  - only the first duplicate `order` is reported (`:45`);
  - JSON parse errors do not name the file (`:37`).
- **Fix:** Address each in place. All four are one-line changes.

#### TOOL-05 · Low · Weak CHANGELOG check; no checksums
- **Location:** `tools/release.mjs:7` (substring match); `README.md:75` describes a different step order.
- **Fix:** Require `## [x.y.z] - YYYY-MM-DD` as the first release heading, write `SHA256SUMS`, and align the README.

---

## 5. Hardening recommendations

These are not defects today, but they should be settled before 1.0 because they become part of the public contract.

| # | Topic | Recommendation |
|---|---|---|
| H-1 | Lifecycle | Provide `Hendese.destroy()` that removes listeners, observers and the Hoca layer, for SPA and hot-reload use. |
| H-2 | Dynamic content | Provide `Hendese.upgrade(root)` with per-element bound flags. Delegate the dialog-command fallback to a single document listener. |
| H-3 | Half-initialised pages | Add `html.js` from `Hendese.init()`, not from the inline head script, or gate JS-only rules on a `js-ready` class. A failed bundle currently leaves inert tab strips and blank card labels. |
| H-4 | Support matrix | State the browser floor in the README. `light-dark()`, `:has()`, container queries and `::backdrop` inheritance need 2024 engines; there are no fallbacks. |
| H-5 | Cascade contract | Document that layered `!important` declarations (`base.css:23`, `blueprint.css:139`, `hoca.css:41`, `print.css:4`) cannot be overridden by consumers. This qualifies the "unlayered CSS always wins" claim. |
| H-6 | Theming scope | Document that derived tokens (`--draw`, `--pencil`, `--accent-soft`, `--scene-shade`) resolve at `:root`. Overriding `--accent` on a subtree does not re-theme them. |
| H-7 | Numeric safety | Make `clamp01(NaN)` return 0, guard `seg(p, a, a)`, and guard zero-height drawings in `figScene` (`scenes.js:107`). Clamp `dt ≥ 0` (`core.js:25`). |
| H-8 | Host integration | Preserve `history.state` in `replaceState` (`nav.js:29`). Restore author inline styles on scene teardown instead of removing the `style` attribute (`scenes.js:20`). |
| H-9 | Input hygiene | Reset `lastIndex` (or strip `g`/`y`) on the `englishStems` regex (`lang.js`). Ignore arrow keys with modifier keys in tabs. |
| H-10 | Live regions | Do not announce runbook counts on page load. Label each list. Expose completion through a persistent `role="status"`. Listen for `storage` events. |
| H-11 | Dialog focus | Give `.dialog:focus-visible` a style distinct from its resting outline (`components.css:270–271`). |
| H-12 | Anchored popovers | Verify the implicit popover anchor in each target engine, or declare `anchor-name` / `position-anchor` explicitly for `.dim-tip`. |
| H-13 | Payload | Drop unused font faces (Plex Sans 700, Pixelify 500) from `hendese.inline.css` (440 KB). Ship `docs/` and `demos/` in the zip and on a site, not in the npm tarball. |
| H-14 | Public surface | Narrow `exports` to `.`, `./css`, `./css/inline`, `./head.js` and `./icons.svg`. Exporting `./src/*` freezes internals under SemVer. |
| H-15 | Test coverage | Add end-to-end cases for: runtime reduced-motion toggling, crossing the 1100 px breakpoint, hash landing and `hashchange`, late scene registration, exception isolation, the ESM entry, `exports` targets existing after build, narrow-viewport drawer interaction, and print rendering. |
| H-16 | Community files | Add `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, a `NOTICE` covering fonts, icons and the mascot, and a CI workflow. |

---

## 6. Remediation plan

### 0.3.1 — Patch (no contract changes)

| Area | Items |
|---|---|
| Engine and widget resilience | ENG-01, ENG-02, WID-01, WID-11 |
| Layout and print | CSS-01, CSS-02, CSS-03, CSS-04 |
| Accessibility | WID-06, WID-07, WID-08, WID-09, CSS-05, CSS-06 |
| Navigation | ENG-03, ENG-04, ENG-09, ENG-10, ENG-11 |
| Tooling and release | TOOL-01, REL-03 (re-issue artifacts), REL-05, REL-06, REL-09 |

Each fix ships with the smallest regression test that fails without it.

### 0.4.0 — Minor (contract-affecting)

| Area | Items |
|---|---|
| Packaging | PKG-01, PKG-02, PKG-03, PKG-04, H-14 |
| Lifecycle | ENG-07, ENG-08, H-1, H-2, H-3 |
| Theme | ENG-06, ENG-15 |
| Navigation | ENG-05 |
| Widgets | WID-02 (with one-time storage migration), WID-03, WID-04, WID-05, WID-12, WID-13 |
| Standard and tooling | TOOL-02, TOOL-03, TOOL-04, TOOL-05 |
| Hoca | ENG-12, ENG-13, ENG-14 |

### Before first public release

| Gate | Items |
|---|---|
| Legal | REL-01, REL-02, REL-06, H-16 |
| Repository | REL-07 (history decision) |
| Continuous integration | REL-04 |
| Documentation | REL-08, H-4, H-5, H-6, WID-14 (LTR-only statement or RTL support) |

---

## 7. Verified as sound

The following areas were checked specifically and found correct:

- **Global namespace.** The bundle defines a single global (`Hendese`).
- **Double initialisation.** `init()` returns early on a second call.
- **Dialog focus.** Native `<dialog>` restores focus on close, both with Invoker Commands and on the fallback path. A test covers this.
- **Tabs.** Roving tabindex, automatic activation, Home/End and null-guarded `aria-controls` follow the APG pattern.
- **Text contrast.** All text-colour tokens (`--ink-3`, `--ok`, `--warn`, `--bad`, `--paper` on `--draw`) meet WCAG AA in both themes.
- **Turkish glyphs.** Font subsets cover the Turkish alphabet (ç ğ ı İ ö ş ü), and every face uses `font-display: swap`.
- **Secrets and paths.** No secrets, credentials or absolute local paths were found in tracked files or in `dist/`.
- **Line endings.** `.gitattributes` normalises text to LF and marks binary assets correctly.
- **Code samples.** The demo generator escapes code samples before highlighting.

---

## 8. Resolution status (0.4.0)

Release 0.4.0 resolves every finding that does not depend on a publication decision. Each fix has a regression check in `tests/e2e/robust.spec.mjs`, `tests/unit/math.test.mjs` or `tests/unit/standard.test.mjs` where the behaviour is observable. Before the commit, an independent advisor reviewed the fix set. That review found two regressions introduced by the first fix pass, and both were corrected:

- `guard()` dropped the frame timestamp and `this`;
- explorer selections were no longer announced.

### Resolved

| Area | Findings |
|---|---|
| Release and repository | REL-03 (Node-based zip writer), REL-05, REL-06, REL-09 |
| Packaging | PKG-01, PKG-02, PKG-03, PKG-04 |
| Engine and navigation | ENG-01 to ENG-14 |
| Widgets and accessibility | WID-01 to WID-13 |
| Stylesheets | CSS-01 to CSS-07 (`.cue` is kept: integrators use it) |
| Tooling | TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05 (except checksums) |
| Hardening | H-7, H-8, H-9, H-11; H-10 and H-15 in part |

### Deferred

| Item | Reason |
|---|---|
| REL-01, REL-02, REL-07 | Publication decisions: licence, mascot provenance, public history. |
| REL-04 | Needs Linux baselines produced in CI (publication step). |
| REL-08 | Documentation language is part of the publication step. Code comments are already English. |
| ENG-15 | Following OS theme changes conflicts with the documented rule that an authored `data-theme` overrides the system preference. It needs a contract decision first. |
| WID-14 | RTL support. Logical radii were adopted for `.field-unit`; arrow-key mirroring and the remaining physical properties are open. |
| TOOL-05 (checksums) | Belongs to the publication pipeline. |
| H-1 to H-6, H-12 to H-14, H-16 | API additions (`destroy`, `upgrade`), support matrix, cascade and theming documentation, payload and export surface, community files: to be settled with the publication plan. |
| Review notes | A deep link stays locked for up to 4 s if the user scrolls only by dragging the scrollbar in browsers that fire none of `wheel`/`keydown`/`pointerdown`/`touchstart`. Card labels read only the first header row and ignore `rowspan`. |
