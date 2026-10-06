// Sürüm: build → testler → CHANGELOG'da bu sürümün başlığı var mı → npm pack → zip → git tag.
// Kullanım: önce `npm version <yama|minor|majör> --no-git-tag-version` ve CHANGELOG başlığı; sonra `npm run release`.
// Uzak repo/registry yok (bkz. plan P6); çıktı releases/ altında.
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
// zip: dağıtım klasörü (npm kullanmayanlar için) — Windows'ta yerleşik tar zip yazabilir
run(`tar -a -c -f releases/hendese-${v}.zip dist docs starter README.md CHANGELOG.md src/fonts/OFL-ibm-plex-sans.txt src/fonts/OFL-pixelify-sans.txt`);
run(`git tag -a v${v} -m "hendese ${v}"`);
console.log(`\nhazır: releases/hendese-${v}.tgz, releases/hendese-${v}.zip, etiket v${v}`);
