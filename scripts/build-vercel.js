import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

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

// 4. Bundle standalone serverless API handler with esbuild (keeping packages external for native Node ESM loading)
console.log('[Build] 4/4 Bundling standalone Serverless API handlers with esbuild...');

execSync(
  `npx esbuild apps/api/src/app.ts --bundle --platform=node --target=node20 --format=esm --outfile=api/index.js --packages=external`,
  { stdio: 'inherit' }
);

// Copy to catch-all and web subdirectories
fs.mkdirSync('api', { recursive: true });
fs.copyFileSync('api/index.js', 'api/[...path].js');

fs.mkdirSync('apps/web/api', { recursive: true });
fs.copyFileSync('api/index.js', 'apps/web/api/index.js');
fs.copyFileSync('api/index.js', 'apps/web/api/[...path].js');

if (fs.existsSync('api/health.js')) {
  fs.copyFileSync('api/health.js', 'apps/web/api/health.js');
}

console.log('[Build] ✓ DeutschWelt build completed successfully!');
