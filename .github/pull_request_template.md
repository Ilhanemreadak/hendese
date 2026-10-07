## What and why

<!-- What does this change, and which issue does it address? Use "Fixes #123" to close an issue on merge. -->

## Type

- [ ] Bug fix (no contract change)
- [ ] New part or feature (discussed in an issue first)
- [ ] Contract change (class, token, data attribute, id, event, storage key or export): needs a major release
- [ ] Documentation, tests or tooling only

## Checklist

- [ ] The PR title follows [Conventional Commits](https://www.conventionalcommits.org), e.g. `fix(nav): …`
- [ ] `npm test` passes locally (build, unit and Playwright)
- [ ] `dist/` and `demos/*.html` are rebuilt and committed (`npm run build`)
- [ ] The finished state is correct with reduced motion, below 1100 px, in print and without JavaScript
- [ ] Keyboard use and visible focus work; light and dark themes checked
- [ ] CHANGELOG entry added under `[Unreleased]` for user-visible changes
- [ ] Visual baselines updated on purpose (if any changed), and the new images reviewed

## Screenshots

<!-- Before / after, light and dark, if the change is visible. -->
