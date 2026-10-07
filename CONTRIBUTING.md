# Contributing to Hendese

Thanks for your interest. Hendese is a small project with one maintainer, so focused issues and small pull requests get reviewed fastest. Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## How changes get in

Only the maintainer can push to this repository. Every outside change arrives as a pull request from a fork:

1. **Open an issue first** for anything beyond a small fix. Use one of the forms (bug, accessibility, feature, documentation). New parts and contract changes are agreed in the issue before code is written. Classes, tokens, data attributes, ids, events, storage keys and exports are public contract, and changing them means a major release.
2. **Fork, branch, change.** Keep one topic per pull request.
3. **Open a pull request** against `main` and fill in the template.
4. **Checks must pass.** CI (build, unit, Playwright), the PR title check, dependency review and CodeQL run automatically. For first-time contributors, workflows start after the maintainer approves them.
5. **Review and merge.** The maintainer reviews every pull request ([CODEOWNERS](.github/CODEOWNERS)) and merges it with a squash. `main` accepts no force pushes, and its history stays linear.

Security problems are never reported in issues or pull requests; see [SECURITY.md](SECURITY.md).

## Setup

```sh
npm install
npx playwright install chromium
npm run build
npm test
```

Node 21 or newer is required.

## Rules for changes

- Follow [STANDARD.md](STANDARD.md). The test suite enforces most of it:
  - CSS uses tokens only;
  - every class appears on a docs or demo page;
  - part pages have the required sections.
- **Finished state:** with reduced motion, below 1100 px, in print and without JavaScript, the page must read completely.
- **Accessibility is part of done:** keyboard use works, focus stays visible, and axe reports no serious or critical issues in light and dark themes.
- **Comments and strings:** code comments are written in English. User-facing default strings live in `src/js/strings.js`.
- **Two languages:** every docs, demo and starter page exists in English and Turkish (`docs/<page>.tr.html`, `demos/_src/tr/<name>.html`, `starter/index.tr.html`). Change both; `tests/unit/i18n.test.mjs` fails when their markup differs. If you cannot write one of the languages, say so in the PR and a maintainer will translate it.
- **Build output:** `dist/` and `demos/*.html` are committed. Run `npm run build` and commit them with your change; CI fails if they are stale.
- **Changelog:** add an entry under `[Unreleased]` in [CHANGELOG.md](CHANGELOG.md) for user-visible changes.

## Commit messages and PR titles

[Conventional Commits](https://www.conventionalcommits.org): `type(scope): description`, in the imperative and without a trailing period.

| Type | Use for |
|---|---|
| `feat` | A new part, option or behaviour |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting with no behaviour change |
| `refactor` | Code change with no behaviour change |
| `perf` | Performance |
| `test` | Tests only |
| `build` | Build tooling or dependencies |
| `ci` | Workflows |
| `chore` | Maintenance |
| `revert` | Reverting a commit |

Pull requests are squash-merged, so the **PR title** becomes the commit message on `main`; CI checks its format. Add `!` after the type for a breaking change, for example `feat(tokens)!: rename --ink-3`.

## Visual baselines

Screenshots are compared per platform (`*-win32.png`, `*-linux.png`). CI uses the Linux images. If your change alters a page's look on purpose, refresh the Linux baselines in the same container that CI uses:

```sh
docker run --rm -v "$PWD:/work" -v /work/node_modules -w /work mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -c "npm ci && npx playwright test --update-snapshots=changed"
```

Review the new images before committing them.

## Labels

Issues start with `needs-triage`. The maintainer adds a type label (`bug`, `enhancement`, `documentation`, `accessibility`) and, where it fits, `good first issue` or `help wanted`.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
