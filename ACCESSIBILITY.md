# Accessibility

Hendese targets **WCAG 2.2 level AA** for every component and docs page.

## How it is checked

- **Automated:** every docs and demo page is checked with axe in light and dark themes on each CI run. Serious or critical violations fail the build.
- **Behaviour tests:** keyboard use of the drawer, tabs, dialog, form fields and the station explorer, plus focus return and announcements.
- **Finished state:** pages are tested with reduced motion. Print and no-JavaScript modes always show the complete figure, never a half-drawn one.
- **Manual review:** contrast, forced colors (Windows high contrast), zoom and screen-reader spot checks.

## Known gaps

Open items and their status are listed in the [pre-release review](docs/audits/2026-10-pre-release-review.md#6-open-items). The main one: right-to-left layouts are not yet supported.

## Reporting a barrier

Open an [accessibility issue](https://github.com/Ilhanemreadak/hendese/issues/new?template=accessibility.yml). Include the page or component, what you tried to do, and your assistive technology, browser and OS. Accessibility bugs are treated like functional bugs.
