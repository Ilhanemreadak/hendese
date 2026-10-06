// Replaces the <!-- @@ICONS --> marker in docs/starter pages with the contents of dist/icons.svg (one-shot; not idempotent, the marker is consumed).
import fs from 'node:fs';
const ic = fs.readFileSync(new URL('../src/icons.svg', import.meta.url), 'utf8').split('\n').slice(1).join('\n').trim();
for (const f of process.argv.slice(2)) {
  const s = fs.readFileSync(f, 'utf8');
  if (!s.includes('<!-- @@ICONS -->')) { console.log('skip', f); continue; }
  fs.writeFileSync(f, s.replace('<!-- @@ICONS -->', () => ic)); console.log('icons ->', f);
}
