# Security policy

## Supported versions

Only the latest release receives fixes while Hendese is in 0.x.

## Reporting a vulnerability

Please do not open a public issue. Report it privately through GitHub's [private vulnerability reporting](https://github.com/Ilhanemreadak/hendese/security/advisories/new) instead.

Include the affected version, a description and, if possible, a minimal page that reproduces it. You can expect an acknowledgement within a week. A fix or mitigation is released as soon as it is ready, and you will be credited unless you prefer otherwise.

## Scope

Hendese runs entirely in the browser and makes no network requests at run time. Relevant reports include:
- script injection through documented APIs or data attributes;
- unsafe handling of `localStorage` data;
- issues in the build or release tooling that could compromise published artifacts.
