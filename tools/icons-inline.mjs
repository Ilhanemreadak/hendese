// Docs/starter sayfalarındaki <!-- @@ICONS --> işaretini dist/icons.svg içeriğiyle değiştirir (bir kez; idempotent değil, işaret kalmaz).
import fs from 'node:fs';
const ic = fs.readFileSync(new URL('../src/icons.svg', import.meta.url), 'utf8').split('\n').slice(1).join('\n').trim();
for (const f of process.argv.slice(2)) {
  const s = fs.readFileSync(f, 'utf8');
  if (!s.includes('<!-- @@ICONS -->')) { console.log('skip', f); continue; }
  fs.writeFileSync(f, s.replace('<!-- @@ICONS -->', () => ic)); console.log('icons ->', f);
}
