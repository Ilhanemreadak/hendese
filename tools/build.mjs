// Builds src/ into dist/; the only dependency is esbuild.
//   dist/hendese.css         all layers; fonts and their OFL licences are copied to dist/fonts/
//   dist/hendese.inline.css  same, with fonts embedded as base64 (for single-file HTML pages)
//   dist/hendese.js          IIFE, global `Hendese`
//   dist/hendese.esm.js      ES module (for bundlers)
//   dist/head.js             flash-free theme snippet (inline it in <head>)
//   dist/icons.svg           icon sprite
import { build } from 'esbuild';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url)));
const root = fileURLToPath(new URL('..', import.meta.url));
const banner = `/* Hendese ${pkg.version} */`;
const out = p => `${root}dist/${p}`;
fs.rmSync(out(''), { recursive: true, force: true });

const css = (outfile, loader) => build({
  entryPoints: [`${root}src/css/index.css`], bundle: true, outfile, loader: { '.woff2': loader },
  assetNames: 'fonts/[name]', banner: { css: banner }, logLevel: 'warning', charset: 'utf8',
});
await css(out('hendese.css'), 'file');
await css(out('hendese.inline.css'), 'dataurl');

const js = (outfile, format) => build({
  entryPoints: [`${root}src/js/index.js`], bundle: true, outfile, format, globalName: format === 'iife' ? 'Hendese' : undefined,
  target: 'es2019', banner: { js: banner }, define: { __VERSION__: JSON.stringify(pkg.version) }, logLevel: 'warning', charset: 'utf8',
});
await js(out('hendese.js'), 'iife');
await js(out('hendese.esm.js'), 'esm');

fs.writeFileSync(out('head.js'), `${banner}\n(function(d){try{var t=localStorage.getItem(d.getAttribute('data-theme-key')||'hendese-theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-theme',t)}catch(e){}d.classList.add('js')})(document.documentElement);\n`);
fs.copyFileSync(`${root}src/icons.svg`, out('icons.svg'));
for (const f of fs.readdirSync(`${root}src/fonts`).filter(f => f.endsWith('.txt'))) fs.copyFileSync(`${root}src/fonts/${f}`, out(`fonts/${f}`));

for (const f of fs.readdirSync(out('')).filter(f => !fs.statSync(out(f)).isDirectory()))
  console.log(f.padEnd(22), (fs.statSync(out(f)).size / 1024).toFixed(1).padStart(7), 'KB');
