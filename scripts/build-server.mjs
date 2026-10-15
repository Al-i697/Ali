// بناء الخادم: حزمة واحدة بـ esbuild (الاعتماديات تبقى خارجية)، مع نسخ الهجرات والخطوط.
import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist/server');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await build({
  entryPoints: {
    index: path.join(root, 'src/server/index.ts'),
    cli: path.join(root, 'src/server/cli/index.ts'),
  },
  outdir: out,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  packages: 'external',
  sourcemap: true,
  tsconfig: path.join(root, 'tsconfig.server.json'),
  logLevel: 'info',
});

await cp(path.join(root, 'src/server/db/migrations'), path.join(out, 'migrations'), { recursive: true });
await cp(path.join(root, 'src/server/assets'), path.join(out, 'assets'), { recursive: true });
console.log('✔ server built →', path.relative(root, out));
