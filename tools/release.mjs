// Cuts a release: build → tests → check CHANGELOG has this version's heading → npm pack → zip → git tag.
// Usage: first `npm version <patch|minor|major> --no-git-tag-version` and a CHANGELOG heading; then `npm run release`.
// No remote repo/registry (see plan P6); output goes to releases/.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const run = (cmd) => { console.log('›', cmd); execSync(cmd, { stdio: 'inherit' }); };
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')), v = pkg.version;

if (!fs.readFileSync('CHANGELOG.md', 'utf8').includes(`## [${v}]`)) throw new Error(`CHANGELOG.md içinde "## [${v}]" başlığı yok`);
const dirty = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
if (dirty) throw new Error('çalışma ağacı temiz değil; önce commit edin:\n' + dirty);
if (execSync('git tag --list v' + v, { encoding: 'utf8' }).trim()) throw new Error(`v${v} etiketi zaten var`);

run('npm run build');
run('npm run test:unit');
run('npx playwright test');

fs.mkdirSync('releases', { recursive: true });
run('npm pack --pack-destination releases');
// zip: distribution bundle (for non-npm users); the built-in tar on Windows can write zip
run(`tar -a -c -f releases/hendese-${v}.zip dist docs demos starter README.md STANDART.md CHANGELOG.md src/fonts/OFL-ibm-plex-sans.txt src/fonts/OFL-pixelify-sans.txt`);
run(`git tag -a v${v} -m "hendese ${v}"`);
console.log(`\nhazır: releases/hendese-${v}.tgz, releases/hendese-${v}.zip, etiket v${v}`);
