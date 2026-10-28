import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const here = (relative) => fileURLToPath(new URL(relative, import.meta.url));

const clientDist = here('../client/dist');
const outDir = here('./dist');

if (!existsSync(here('../client/dist/index.html'))) {
  console.error('[desktop] client/dist is missing. Run `npm run build` first.');
  process.exit(1);
}

await fs.rm(outDir, { recursive: true, force: true });

await esbuild.build({
  entryPoints: [here('./src/main.js')],
  outfile: here('./dist/main.mjs'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  external: ['electron', 'embedded-postgres', 'pg-native'],
  banner: {
    // Bundled CommonJS dependencies (express, pg) require() Node built-ins, and ESM output has no require.
    js: "import { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);",
  },
  logLevel: 'info',
});

await fs.copyFile(here('../server/src/schema.sql'), here('./dist/schema.sql'));
await fs.cp(clientDist, here('./dist/client'), { recursive: true });

console.log('[desktop] copied schema.sql and client/ into dist/');
