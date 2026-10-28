import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';

console.log('[Build] Starting DeutschWelt Vercel production build...');

// 1. Build shared package
console.log('[Build] 1/4 Building @deutschwelt/shared...');
execSync('npm --prefix packages/shared run build', { stdio: 'inherit' });

// 2. Build API package & Prisma client
console.log('[Build] 2/4 Building @deutschwelt/api...');
try {
  execSync('npx prisma generate --schema apps/api/prisma/schema.prisma', { stdio: 'inherit' });
} catch (e) {
  console.warn('[Build Warning] Prisma generate skipped or warning:', e?.message);
}
execSync('npm --prefix apps/api run build', { stdio: 'inherit' });

// 3. Build Web frontend
console.log('[Build] 3/4 Building @deutschwelt/web (Vite)...');
execSync('npm --prefix apps/web run build', { stdio: 'inherit' });

// 4. Bundle standalone serverless API handler with esbuild JS API
console.log('[Build] 4/4 Bundling standalone Serverless API handlers with esbuild...');

fs.mkdirSync('api', { recursive: true });

// Ensure api/package.json exists with type: module
const apiPkg = {
  name: 'deutschwelt-api-handler',
  private: true,
  type: 'module'
};
fs.writeFileSync('api/package.json', JSON.stringify(apiPkg, null, 2));

await esbuild.build({
  entryPoints: ['apps/api/src/serverless.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'api/index.js',
  banner: {
    js: "import * as _nodeModule from 'node:module';\nconst require = _nodeModule.createRequire(import.meta.url);"
  },
  external: ['@prisma/client', 'prisma']
});

// Copy to catch-all and web subdirectories
fs.copyFileSync('api/index.js', 'api/[...path].js');

fs.mkdirSync('apps/web/api', { recursive: true });
fs.copyFileSync('api/index.js', 'apps/web/api/index.js');
fs.copyFileSync('api/index.js', 'apps/web/api/[...path].js');
fs.copyFileSync('api/package.json', 'apps/web/api/package.json');

fs.mkdirSync('apps/web/dist/api', { recursive: true });
fs.copyFileSync('api/index.js', 'apps/web/dist/api/index.js');
fs.copyFileSync('api/index.js', 'apps/web/dist/api/[...path].js');
fs.copyFileSync('api/package.json', 'apps/web/dist/api/package.json');

if (fs.existsSync('api/health.js')) {
  fs.copyFileSync('api/health.js', 'apps/web/api/health.js');
  fs.copyFileSync('api/health.js', 'apps/web/dist/api/health.js');
}

console.log('[Build] ✓ DeutschWelt build completed successfully!');
