# The Hendese standard

Every part added to the package follows these rules. Most of them are enforced by tests:

- **`tests/unit/standard.test.mjs`:** token usage, and every class is shown on some page.
- **`tools/demos.mjs`:** the structure of part pages.
- **`tests/e2e/`:** no console errors, no external requests, no horizontal overflow, and axe checks in light and dark themes.

A rule that no test can check is marked *(manual)*.

## 1. Tokens

Component CSS (`base`, `layout`, `components`, `blueprint`, `motion`) contains no raw values.

| What | Tokens | Allowed outside the scale |
|---|---|---|
| Font size | `--fs-xs` 11 · `--fs-sm` 12.5 · `--fs-md` 14 · `--fs-base` 16 · `--fs-lg` 17.5 · `--fs-xl` 22 · `--fs-2xl` 30 · `--fs-h2` · `--fs-display` | Sizes inside drawings: `max(Npx, calc(M * var(--u)))` |
| Spacing (padding, margin, gap, inset; `components` and `blueprint` only, negative values included) | `--sp-1` 4 · `--sp-2` 6 · `--sp-3` 8 · `--sp-4` 10 · `--sp-5` 12 · `--sp-6` 14 · `--sp-7` 16 · `--sp-8` 20 · `--sp-9` 28 · `--sp-10` 32 · `--sp-11` 48 | 0–3px optical corrections; drawing units `calc(N * var(--u))` |
| Radius | `--r-xs` 4 · `--r-sm` 6 · `--r-md` 10 · `--r-lg` 14 · `--r-pill` | `0` (drawn objects have square corners) |
| Duration and easing | `--dur-1` 120ms · `--dur-2` 250ms · `--dur-3` 320ms · `--dur-4` 650ms · `--dur-5` 2s; `--ease-out`, `--ease-in-out`, `--ease-snap` | — |
| Layer | `--z-topbar` · `--z-scrim` · `--z-rail` · `--z-hud` · `--z-hoca` · `--z-progress` · `--z-skip` | 0–2 for local stacking |
| Color | The names in `tokens.css` | None. Hex values, color functions (`rgb()`, `hsl()`, `oklch()`, `color()`…) and named colors appear only in `tokens.css`. System colors (`Highlight`, `GrayText`) are allowed. |

**Rules**
- **Removed names (0.3):** `--ease`, `--t-fast` and `--t-med`. Use `--ease-out`, `--dur-1` and `--dur-3` instead.
- **Structural exceptions:** end the line with `/* std:ok <reason> */`, for example for the 54px that offsets the code column.
  - A marker covers only the violations on its own line, and a marker on a line without a violation fails the test.
  - At most 15 exceptions are allowed in total.
- **Customisation:** the theme lives in `@layer`. A project overrides tokens in its own unlayered CSS; no extra specificity is needed.

## 2. Status

Every component that carries a status reads its color from two variables: `--c` (line and text) and `--c-soft` (fill). Each component **sets its own defaults** for both, so a status never leaks into nested components. Status colors come from the `.s-*` classes:

| Class | Meaning |
|---|---|
| `.s-ok` · `.s-warn` · `.s-bad` · `.s-sec` | success · warning · error · security |
| `.s-neutral` · `.s-accent` | neutral · accent |
| `.s-gitlab` · `.s-aws` · `.s-k8s` · `.s-argo` | service color; the fill is 10% automatically |

**Components that accept `.s-*`:** `.pill`, `.state`, `.readout`, `.check`, `.co`, `.steps>li`, `.survey-log>li`, `.cells>i` and `.lamp`.

A form field shows status only through §3 "Invalid". There is no green "valid" field, because color alone would carry the meaning.

**Deprecated aliases, removed in 1.0:** `.pill-ok`, `.pill-neutral`, `.state.ok/.warn/.bad`, `.readout.ok/.bad`, `.p-auto/.p-manual/.p-inline`. The `.co-*` classes are role names (tip, problem…), not colors, and they stay.

**Color never carries meaning alone** *(manual)*. A status is always also stated in text or in the line pattern, for example the word "failed" or a dashed line.

## 3. Interaction states

Use the ARIA attribute that expresses the meaning; use `data-state` only when there is none.

| State | How it is set | Appearance |
|---|---|---|
| Disabled | `:disabled`, `[aria-disabled="true"]` | Dashed border, faded ink, `cursor:not-allowed` |
| Pressed / selected | `aria-pressed`, `:checked`, `aria-selected` | Border in the drawing color |
| Current | `aria-current="step\|page\|true"` | 2px drawing-color border |
| Done / blocked | `data-state="done\|blocked"`, plus visible or `.visually-hidden` text | `--c` success or error; blocked is dashed |
| Busy | `aria-busy="true"` on the region | — |
| Invalid | `aria-invalid="true"` or `:user-invalid` | `--c:var(--bad)` |

The rule of the language: **a solid line is real; a dashed line is an example or not yet real.** That is why disabled, blocked and missing states are drawn dashed.

Classes written by JavaScript (`.on`, `.past`, `.now`, `.show`, `.complete`, `.is-live`) are never hand-written in pages.

## 4. Layout

- **Container queries:** components adapt to the column they sit in, not to the viewport.
  - **`col` container** (`main` and `.sticky-text`). Breakpoints:
    - `@container col (max-width:719px)`: table cards, survey log, steps and the runbook header;
    - `640px`: definition list;
    - `760px`: single-column frame.
  - **`fig` container** (`.f-map`, `.fig-sheet` and `.sticky-fig`): the narrow variant starts below `575px`.
- **Exceptions that read the viewport width:**
  - the shell (rail, top bar), the hero and Hoca;
  - the live motion threshold (1100px; JS);
  - the `.sheet` mobile fallback;
  - print and reduced motion.

## 5. Finished state

- **The CSS default is the finished state.** With reduced motion, below 1100px, without JavaScript and in print, the page reads completely.
- **JavaScript may only hide.** CSS never hides something that only JavaScript can reveal.
- **Motion rules** are written only under `@media screen` with `.is-live` or `html.motion`. Variables are read as `var(--k,1)`.

## 6. Accessibility

- **Native elements first:** `button`, `input`, `fieldset`, `dialog`, `details`, `popover`. ARIA is used only where a native element is not enough.
- **Focus** is always visible. The general rule is `:focus-visible`; controls built on a hidden input use `input:focus-visible+span`.
- **Automated checks:** axe reports no serious or critical issues in light and dark themes. A scrolling region that overflows must be focusable (`tabindex="0"`).
- **Forced colors** *(manual)*: selection and progress are drawn in system colors (`Highlight`). Meaning never depends on a background color alone.
- **Icons:** an icon-only button needs an `aria-label`. Decorative icons are `aria-hidden` or sit inside a container that has text.

## 7. Language

- **User-facing text is English by default.** A page with `<html lang="tr">` gets Turkish UI strings automatically (`Hendese.locales`, `:root:lang(tr)`). Override them with `Hendese.init({ strings })` and the `--str-*` tokens.
- **Turkish pages and uppercase labels:** under `lang="tr"`, CSS uppercases "i" to "İ". English words in uppercase labels go inside `lang="en"`, otherwise "web-api" prints as "WEB-APİ". `Hendese.init({ englishStems })` does this automatically.
- **Text printed by CSS** (`--str-*`) is a token and is overridden per language.
- **Banned names:** `tests/unit/hygiene.test.mjs` keeps a list of names that must never ship in the package.

## 8. Part pages (`demos/_src/<name>.html`)

**Meta fields** (all required): `title`, `group`, `order`, `tagline`, `intro`, `summary`. Optional: `facts`. No two pages in a group share an `order`.

**Required chapters.** The chapter title must start with:

| Group | Required chapters |
|---|---|
| Components | "States…" and "Do / don't" |
| Blueprint | "Do / don't" |
| Motion, Hoca | "With motion off…" and "API" |
| Basics | free |

**Content**
- **Variety:** examples are varied, not copies of the docs examples. Sample data uses generic names (web-api, eu-west-1…).
- **Inline styles:** an inline `style` is for layout only (width, grid) and uses tokens. If the package does not cover something, do not imitate it with inline styles; report it as missing.

## 9. Adding a new part

1. The native element and the HTML contract come first. Add the smallest JavaScript needed (`widgets.js`, data API).
2. CSS goes into the right layer, `components` or `blueprint`. It uses tokens only, sets `--c/--c-soft` defaults and accepts `.s-*`.
3. Cover the states (§3), focus, the light and dark themes, `.scene-dark` and `.scene-light`.
4. Cover container queries (§4), the finished state (§5) and print.
5. Write a part page (§8). Add a short section to a docs page if needed.
6. Add a CHANGELOG entry. A breaking change goes under "Changed (breaking)".
7. Run `npm test` before submitting: build, unit tests (standard and banned names) and e2e.
