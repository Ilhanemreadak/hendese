// Cuts a release: check CHANGELOG → build → verify the tree is unchanged → tests → npm pack → zip → git tag.
// Usage: `npm version <patch|minor|major> --no-git-tag-version`, a dated CHANGELOG heading, `npm run build`, commit everything
// (the version is baked into dist/), then `npm run release`.
// No remote repository or registry yet; output goes to releases/.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const run = (cmd) => { console.log('›', cmd); execSync(cmd, { stdio: 'inherit' }); };
const status = () => execSync('git status --porcelain', { encoding: 'utf8' }).trim();
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')), v = pkg.version;

// the newest entry must be this version, dated: "## [x.y.z] - YYYY-MM-DD"
const top = (fs.readFileSync('CHANGELOG.md', 'utf8').match(/^## \[[^\r\n]*/m) || [''])[0];
if (!top.startsWith(`## [${v}] - `) || !/ - \d{4}-\d{2}-\d{2}$/.test(top)) throw new Error(`CHANGELOG.md: ilk sürüm başlığı "## [${v}] - YYYY-MM-DD" olmalı, bulunan: "${top}"`);
if (status()) throw new Error('çalışma ağacı temiz değil; önce commit edin:\n' + status());
if (execSync('git tag --list v' + v, { encoding: 'utf8' }).trim()) throw new Error(`v${v} etiketi zaten var`);

run('npm run build');
// dist/ and demos/ are tracked: the tag must point at exactly what gets packed
if (status()) throw new Error('build izlenen dosyaları değiştirdi; dist/ ve demos/ çıktısını commit edip yeniden deneyin:\n' + status());
run('npm run test:unit');
run('npx playwright test');

fs.mkdirSync('releases', { recursive: true });
run('npm pack --pack-destination releases');
const files = ['dist', 'docs', 'demos', 'starter', 'README.md', 'STANDART.md', 'CHANGELOG.md'].flatMap(function walk(p) {
  return fs.statSync(p).isDirectory() ? fs.readdirSync(p).sort().flatMap(f => walk(path.join(p, f))) : [p];
});
zip(`releases/hendese-${v}.zip`, files);
run(`git tag -a v${v} -m "hendese ${v}"`);
console.log(`\nhazır: releases/hendese-${v}.tgz, releases/hendese-${v}.zip, etiket v${v}`);

// Minimal ZIP writer (DEFLATE, UTF-8 names, fixed 1980-01-01 timestamps for reproducible archives).
// Written in Node because `tar -a` only produces a zip with bsdtar; GNU tar silently writes a tar file instead.
function zip(outFile, names) {
  const table = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xEDB88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
  const crc32 = buf => { let c = ~0; for (const b of buf) c = table[(c ^ b) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const DATE = (0 << 9) | (1 << 5) | 1, parts = [], central = [];
  let offset = 0;
  for (const name of names) {
    const data = fs.readFileSync(name), body = zlib.deflateRawSync(data), crc = crc32(data);
    const n = Buffer.from(name.split(path.sep).join('/'), 'utf8');
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6); local.writeUInt16LE(8, 8);
    local.writeUInt16LE(0, 10); local.writeUInt16LE(DATE, 12); local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(n.length, 26);
    const entry = Buffer.alloc(46);
    entry.writeUInt32LE(0x02014b50, 0); entry.writeUInt16LE(20, 4); entry.writeUInt16LE(20, 6); entry.writeUInt16LE(0x0800, 8); entry.writeUInt16LE(8, 10);
    entry.writeUInt16LE(0, 12); entry.writeUInt16LE(DATE, 14); entry.writeUInt32LE(crc, 16);
    entry.writeUInt32LE(body.length, 20); entry.writeUInt32LE(data.length, 24); entry.writeUInt16LE(n.length, 28); entry.writeUInt32LE(offset, 42);
    parts.push(local, n, body); central.push(entry, n);
    offset += local.length + n.length + body.length;
  }
  const dir = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(names.length, 8); end.writeUInt16LE(names.length, 10);
  end.writeUInt32LE(dir.length, 12); end.writeUInt32LE(offset, 16);
  fs.writeFileSync(outFile, Buffer.concat([...parts, dir, end]));
}
