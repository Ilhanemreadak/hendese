# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org).

## [Unreleased]

English-first documentation and the open-source release setup.

### Changed (breaking)
- **UI strings default to English.** A page with `<html lang="tr">` gets the Turkish set automatically (`Hendese.locales.tr`; CSS `:root:lang(tr)`). The CSS string tokens default to `"SELECTED"`, `"Station"`, `"Error:"` and `" · required"`.
- **Part pages have English file names**, for example `demos/tabs.html` and `demos/runbook.html`. Groups are Basics, Components, Blueprint, Motion and Hoca.
- **The standard is now `STANDARD.md`.**

### Added
- `Hendese.locales` with `en` and `tr` string sets.
- The docs pages, part pages, `STANDARD.md` and this changelog are now in English. `README.tr.md` stays as the Turkish overview.
- MIT licence (`LICENSE`) and package metadata (`license`, `author`, `repository`, `homepage`, `bugs`, `keywords`).
- `README.md` (English), `README.tr.md` (Turkish), `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1) and `ACCESSIBILITY.md`.
- Issue forms (bug, accessibility, feature, documentation), a pull request template, `CODEOWNERS` and Dependabot.
- **GitHub Actions:**
  - CI in the official Playwright image: build, a check that `dist/` is up to date, unit and e2e tests;
  - PR title check (Conventional Commits);
  - dependency review;
  - CodeQL;
  - every action is pinned to a commit SHA.
- Linux visual baselines (`*-linux.png`).
- The pre-release review now lives in `docs/audits/`, with the status of every finding.
- The README hero image and its source (`.github/assets/hero.html`, `tools/readme-hero.mjs`).

### Fixed
- The choice-group example in `docs/components.html` writes its readout as text instead of HTML (CodeQL `js/xss-through-dom`).

## [0.4.0] - 2026-10-06

Resolves the findings of the [pre-release review](docs/audits/2026-10-pre-release-review.md) that do not depend on publication. All code comments are now in English.

### Changed (breaking)
- **Package entry:**
  - `module`, `main` and `exports["."]` now point to the built `dist/hendese.esm.js`. They used to resolve to the unbuilt `src/js/index.js`, where `version` returned `'dev'`.
  - The IIFE (`dist/hendese.js`) is available through the `unpkg`/`jsdelivr` fields and the `./dist/*` path.
  - `./package.json` is exported, and `engines.node` is `>= 21`.
- **Runbook storage:** progress is stored by item identity (`id`, a non-default `value`, otherwise the item text), not by position. Inserting a step no longer shows an undone step as done. The array format of earlier releases is migrated once on first load.
- **Station explorer:** in the finished state (without JavaScript and in print), every description is visible, and JavaScript hides the unselected ones. Do not hand-write `class="show"`.
- **Hero intro:** the `.intro-pending`/`.intro-go` rules moved under `@media screen` and are documented as an integrator hook; the library never adds these classes.
- **`[data-reveal="draw"]`:** the drawing animation applies only to shapes with `pathLength="1"`, so shapes without it no longer stay dotted.

### Added
- `<html data-theme-key="…">`: `head.js` and `Hendese.init()` read a custom theme key from it, so `init({themeKey})` also applies before first paint.
- Font licences: the IBM Plex Mono OFL text; every OFL file is copied into `dist/fonts/`.
- Regression tests: `tests/e2e/robust.spec.mjs` and edge cases for the `math` helpers.

### Fixed
- **Engine:**
  - An error in a scene, hook or widget no longer stops the loop for good. Each callback runs in isolation, and each distinct error is reported once.
  - An unknown Hoca pose is drawn as `idle`.
  - Scenes registered after `start()` join the current mode at once, and Hoca is created on first use.
  - A scene with a missing child is skipped with a warning, and an explicit null root (`$(s, null)`) no longer searches the whole document.
  - A drawing with no height no longer produces `NaN`; `clamp01(NaN)` returns 0.
  - When live mode turns off, the author's inline style and classes are restored.
- **Navigation:**
  - Following a link to a target inside a section (a figure, a footnote) marks the enclosing section; the counter no longer shows `0-1`.
  - Percent-encoded (non-ASCII) ids match. `replaceState` is no longer called every frame, and `history.state` is kept.
  - A deep link stays on its target section until the user scrolls.
  - The drawer releases its focus trap when the screen grows past 1100px.
  - The reading bar no longer goes negative during overscroll.
  - The CSS and JS thresholds now agree at fractional widths (1099–1100px): `(width < 1100px)`.
- **HUD and Hoca:**
  - The HUD clears fields that the new scene does not provide.
  - `hoca.dismiss()` also removes the reduced-motion still copies.
  - On a page without a home position, Hoca is hidden instead of walking to the top-left corner.
- **Widgets:**
  - An icon-only copy button works. The result is announced once through a separate status node, and repeated clicks no longer overlap timers.
  - Card-view table labels count `colspan`, skip header buttons and dimension-note text, and can be overridden with `<th data-th>`.
  - Controls in the hidden header of card-view tables no longer take focus.
  - The explorer preview no longer makes the live region speak; only selections are announced.
  - The "selected" badge stays out of the accessible name.
  - Tabs leave Alt/Ctrl/Meta combinations to the browser, and the event fires only when the selection changes.
  - A form field keeps `aria-describedby` ids that the page adds later.
  - An empty runbook no longer shows as complete.
- **Accessibility and appearance:**
  - The runbook box border reaches 3:1 contrast.
  - An invalid field keeps its red border on hover.
  - The skip link keeps its contrast on hover.
  - The joined corners of a field with a unit are square (logical radius properties).
  - The dialog focus ring differs from its resting frame.
  - In forced colors mode, the HUD bar, the reading bar, the active section link, the current register row, the code cursor and `aria-disabled` are drawn in system colors.
- **Layout and print:**
  - On narrow screens the top bar no longer covers the open drawer and its close button.
  - The pin frame collapses to one column in a narrow column.
  - Code blocks and the dark theme print in dark ink.
  - Wide tables and long code lines are no longer clipped on paper.
- **Tooling:**
  - The build and the demo generator work in paths with spaces or non-ASCII characters (`fileURLToPath`).
  - The release zip is written in Node. Earlier releases ran `tar -a`, which under GNU tar produced a tar file instead of a zip.
  - The release script checks that the build left the tree unchanged, and requires a dated heading at the top of the changelog.
  - The demo generator removes pages whose source was deleted, reports every duplicate `order`, and names the file when the meta JSON is broken.
  - The standard test:
    - strips comments across the whole file;
    - catches multi-line values, negative spacing, modern color functions, named colors, `rem`/`pt` font sizes and unused `std:ok` markers.
  - `tools/icons-inline.mjs` was removed; the sprite is embedded once in `docs/_sablon.html`.

## [0.3.0] - 2026-10-06

New parts, all written to the standard and reviewed.

### Added
- **Form field:**
  - container and fields: `.field` (label, input, textarea, select), `.field-help`, `.field-error`, `.field-row`, and `.field-unit` for a field with a unit;
  - states: invalid via `aria-invalid="true"` or `:user-invalid` (border and error text), a dashed border when disabled, and a `--str-required` marker for `:required` that stays out of the accessible name;
  - the error text is linked through `aria-describedby` only while the field is invalid (`widgets.js`).
- **Checkbox, radio and range:** `.field-check` (native element, `accent-color`), `fieldset.field`, `input[type=range]` with `output`.
- **Tabs:**
  - structure: `.tabs[data-tabs]` (ARIA tablist, roving tabindex, arrows/Home/End), the `.tab-h` panel heading and the `hendese:tab` event;
  - without JavaScript and in print, every panel shows with its heading.
- **Dialog:** a native `<dialog class="dialog">` opened with `command`/`commandfor`, with a small fallback for browsers without invoker commands.
- **Dimension note:** `popovertarget` with `.dim-tip[popover]`, a toggletip that opens on click and is anchored to its button where anchor positioning is supported.
- **Empty state:** `.empty`.
- **Part pages:** form fields; checkbox, radio and range; tabs; dialog; dimension note; empty state. A "Forms and containers" section in the components docs.
- **Text tokens:** `--str-error`, `--str-required`.

### Changed (breaking)
- `--ease`, `--t-fast` and `--t-med` were removed; use `--ease-out`, `--dur-1` and `--dur-3`.

### Fixed
- The part-page generator truncated a `<demo label="…">` whose value contained HTML; the buttons page showed the label as "true".
- The last-child rule of the docs demo box overrode the native dialog's `margin:auto`, so the dialog opened at the bottom of the screen.

### Deliberately not added
- **Switch:** `.toggle-btn` and the checkbox cover it.
- **Toast:** feedback is given inline (the copy label, `.readout`, `.rb-done`).
- **Loading skeleton:** static pages load no asynchronous content; waiting is expressed with `aria-busy` and text.
- **Timeline:** `.survey-log` and `.s-*` cover it.

## [0.2.0] - 2026-10-06

The system and standard release. Details: `STANDARD.md`.

### Added
- **The standard document:** rules for tokens, status, interaction states, layout, the finished state, accessibility, language and part pages, plus a checklist for new parts.
- **Standard checks:**
  - `tests/unit/standard.test.mjs` forbids raw font sizes, spacing, radii, durations, z-index values and colors in component CSS. Justified exceptions use `/* std:ok … */`, at most 15.
  - The same test requires every class in the component and blueprint CSS to appear on a page.
  - `tools/demos.mjs` checks the required meta fields and the required chapters of each group on every part page.
- **Token scales:**
  - type: `--fs-xs … --fs-2xl`, `--fs-h2`, `--fs-display`;
  - spacing: `--sp-1 … --sp-11`;
  - radius: `--r-xs`, `--r-pill`;
  - layers: `--z-*`;
  - other: code colors (`--code-ink-2`, `--code-fill`, `--code-fill-2`), `--shadow-drawer`, `--scene-shade`.
- **Single-color theming:** `--draw`, `--accent-soft`, `--pencil` and `--pencil-2` now derive from `--accent`. To re-theme, override only `--accent` and `--accent-2` on `:root`.
- **Status standard:**
  - `.s-ok`, `.s-warn`, `.s-bad`, `.s-sec`, `.s-neutral`, `.s-accent`; service classes get their fill automatically;
  - `.pill`, `.state`, `.readout`, `.check`, `.co`, `.steps>li`, `.survey-log>li`, `.cells>i` and `.lamp` read the same `--c`/`--c-soft` contract.
- **Interaction states:**
  - disabled (`:disabled`, `[aria-disabled]`): a dashed border;
  - `aria-current` and `data-state="done|blocked"` on steps;
  - the copy result as `data-state="done|fail"`, announced through `aria-live`.
- **Container queries:** `col` (`main`, `.sticky-text`) and `fig` (`.f-map`, `.fig-sheet`, `.sticky-fig`). The narrow variant is now a package pattern (`--naw`/`--nah`, `.is-wide`/`.is-nar`, `--nx`/`--ny`/`--nw`) and needs no page CSS.
- **Promoted from recipes into the package:**
  - tag and cells: `.tag`/`.tag.is-ghost`, `.cells` (`data-state="miss|ghost"`, `data-mark`);
  - needle: `.needle`/`.needle.is-actual`;
  - lamp: `.lamp` (`data-state="on|ghost"`, `.s-*`), `.lamps`;
  - other: `.stamp-k` scaled in drawings, `.fill-shade`, `.fill-soft`, `.ln-c`.
- **Utilities:** `.visually-hidden`, `.tnum`, `.ic`, and `.num` for numeric table columns. Icons take their size from the text (1em).
- **Scenes and adaptation:**
  - `.scene-light`;
  - a `.scene-dark`/`.scene-light` container without its own sheet background gets the scene background automatically;
  - `prefers-contrast: more` and `forced-colors` rules.
- **`<ol class="steps" start="4">`:** numbering uses the built-in `list-item` counter.
- **Docs and part pages:** "States" sections on the component pages; the blueprint recipes and the part pages moved to package classes.

### Changed (breaking)
- Font sizes and spacing were rounded to the nearest scale step:
  - type by at most ±0.5px (9 and 10px labels became 11px, the 20px number 22px, code 13px → 12.5px);
  - spacing by at most ±2px.
- **Radii:** `.btn`, `.icon-btn`, `.skip`, the step badge and the runbook row use 6px; `.station` has square corners.
- **Motion:** `--t-fast` went from 160ms to 120ms; the `.8s` hero intro uses `--dur-4` (650ms).
- `.pill` and the other status components set their own `--c` default and no longer inherit a status color from an ancestor.
- **Container-query breakpoints:**
  - the frame switches to one column below a 760px column instead of a 1099px window;
  - the definition list becomes one column in a 640px column;
  - table cards and the survey log follow the column, and tables inside a sticky text column become cards in static mode too.
- Table cards turn on only with JavaScript; without it, a table in a narrow container scrolls horizontally.
- **Dark theme:** `--paper` #1a2331, `--draw` #8aaeff (`--accent`).
- `lang.js`: `englishStems` scans every uppercase label, not only a selector list.

### Deprecated
- `--ease`, `--t-fast` and `--t-med` (removed in 0.3).
- `.pill-ok`, `.pill-neutral`, `.state.ok/.warn/.bad`, `.readout.ok/.bad` and `.p-auto/.p-manual/.p-inline` (removed in 1.0; use `.s-*`).

### Fixed
- A `.check` inside a step lost its color to the `.steps>li p` rule.
- A pressed, disabled toggle button was drawn with a red dashed border.
- The height of a collapsed pin beat was computed from the old 10.5px size.
- Under reduced motion, the still Hoca copy ignored the narrow variant's computed `--aw`/`--ah`.
- Service colors and the copy result inside a code block were unreadable in the light theme (`.code` now uses the dark scheme).
- The runbook tick had low contrast in the dark theme.

## [0.1.1] - 2026-10-06

### Added
- **Part pages (`demos/`):** each of 37 parts on its own page, with variants, states, examples in context, do/don't pairs and a gallery (`demos/index.html`). Sources live in `demos/_src/`; the generator `tools/demos.mjs` runs as part of `npm run build`.
- **e2e:** every part page is checked for console errors, external requests, overflow and axe in light and dark themes.

### Fixed
- **Motion engine:**
  - the `hidden` flag of a scene's Hoca claim never reached the controller (documented but without effect);
  - `Hendese.refresh()` reset the handoff state in live mode, which turned Hoca's walk/fade handoff into a jump;
  - `api.aw`/`api.ah` were frozen at registration, and pin and fig scenes ignored `--aw`/`--ah` changed by container queries; they now update on every `measure()`;
  - the `tb` value (HUD title-block state) returned from pin and sticky `render()` was ignored;
  - in a still Hoca copy, a speech bubble that did not fit on the left did not flip to the right.
- **Runbook:** authored `checked` states were cleared when nothing was stored.
- **Table:** an overflowing `.tbl` could not be scrolled with the keyboard (axe `scrollable-region-focusable`); the container is now focusable.
- **Contrast:** secondary text in a selected segment (`.choice small`) was below AA in the dark theme.
- **Fonts:** mono text at weight 600 used the browser's synthetic bold; IBM Plex Mono 600 was added. Every `@font-face` gained a `unicode-range`, so pages download only the subsets they need.
- **Layout details:**
  - `.pillrow` items are vertically centred (a button next to a status label);
  - the last child of `.co-body` leaves no bottom gap even when it is a list or code;
  - a duplicate `.s-k8s` rule was removed.
- **Docs demo box:** the code reset (`.demo .code`) also affected live code blocks inside an example; it now applies only to the box's own code area.

## [0.1.0] - 2026-10-06

### Added
- **Tokens:**
  - light and dark colors in one line with `light-dark()`;
  - motion tokens (`--dur-*`, `--ease-out`, `--ease-in-out`, `--ease-snap`);
  - text tokens.
- **Layered CSS with `@layer`:** tokens, base, layout, components, blueprint, motion, hoca, print.
- **Bundled fonts:** IBM Plex Sans/Mono and Pixelify Sans (latin + latin-ext, OFL). No external requests.
- **Components:**
  - code block, callout, table, steps and runbook (`data-store`, `hendese:runbook` event);
  - choice groups (`.choice`, `.choice.is-seg`), `.toggle-btn` and `.readout`;
  - variable register, stamp and survey log;
  - diff gutter and an in-code execution cursor.
- **Blueprint:** sheet, drawing units, labels, line families, title block, station explorer (`data-explorer`, `hendese:explore` event), `.fig-sheet` and `.scene-dark`.
- **Motion engine:**
  - a single rAF loop that sleeps when idle;
  - `pinScene`, `stickyScene`, `figScene` and the low-level `scene`;
  - the HUD;
  - section tracking, the reading bar, the hash lock and re-anchoring;
  - `.sticky--dense`, pencil sketching and the CSS-only `[data-reveal]`.
- **Hoca:**
  - a sprite with 21 poses;
  - a controller (home position, quiet sections, walk and fade handoffs);
  - still copies for reduced motion.
- **Project:** documentation (`docs/`, 6 pages), a starter page (`starter/`), an esbuild build, and unit and e2e tests.

### Fixed (compared with the original prototype)
- **WCAG AA contrast** (axe, light and dark):
  - light theme: `--ink-3` #60656e, `--ok` #127a4c, `--warn` #93610f, `--bad` #c23434, `--aws` #9c5600, `--gitlab` #b54418, `--argo` #ad4829;
  - dark theme: `--ink-3` #8a93a3.
- **Known contrast exceptions:**
  - `--ok` and `--warn` stay just below 4.5 on the darkest surface (`--surface-3`): 4.48 / 4.43;
  - inactive beats are dimmed on purpose in motion mode; axe runs in reduced-motion mode.
- `.state` outside a drawing had an invalid font declaration (`--u` was undefined); it is now mono 600 everywhere.
- The top edge of the next row showed through collapsed pin beats.
- Unclassed text inside `.scene-dark` kept the light theme's ink color.
- The missing `.s-k8s` badge color was added.
