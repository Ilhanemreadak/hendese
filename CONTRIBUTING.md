# Contributing to Hendese

Thanks for your interest. Hendese is a small project with one maintainer, so focused issues and small pull requests get reviewed fastest.

## Before you start

- **Bugs:** open an issue with the page, the browser and version, the steps to reproduce, and what you expected to happen.
- **New parts or contract changes:** open an issue first. Classes, tokens, data attributes, ids, events, storage keys and exports are public contract, and changing them means a major release.

## Setup

```sh
npm install
npm run build
npm test
```

Node 21 or newer is required. The end-to-end tests use Playwright; run `npx playwright install chromium` once.

## Rules for changes

- Follow [STANDART.md](STANDART.md). The test suite enforces most of it:
  - CSS uses tokens only;
  - every class appears on a docs or demo page;
  - part pages have the required sections.
- Keep the finished state correct. With reduced motion, below 1100 px, in print and without JavaScript, the page must read completely.
- Accessibility is part of done. Keyboard use must work, focus must stay visible, and axe must report no serious or critical issues in light and dark themes.
- Write code comments in English. User-facing default strings live in `src/js/strings.js`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org), e.g. `fix(nav): keep the hash while a deep link settles`.
- `dist/` and `demos/*.html` are committed build output. Run `npm run build` and commit them with your change; CI fails if they are stale.

## Visual baselines

Screenshots are compared per platform (`*-win32.png`, `*-linux.png`). CI uses the Linux images. If your change alters a page's look on purpose, refresh the Linux baselines in the same container that CI uses:

```sh
docker run --rm -v "$PWD:/work" -v /work/node_modules -w /work mcr.microsoft.com/playwright:v1.63.0-noble \
  bash -c "npm ci && npx playwright test --update-snapshots=changed"
```

Review the new images before committing them.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
