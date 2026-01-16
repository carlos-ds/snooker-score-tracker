/**
 * Post-build script to generate service worker with precache manifest
 *
 * This script:
 * 1. Reads Vite's manifest.json to get all hashed asset URLs
 * 2. Adds static files (index.html, manifest.json, icons)
 * 3. Injects the URL list into sw-template.js
 * 4. Writes the final sw.js to dist/
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DIST_DIR = join(ROOT_DIR, 'dist');
const PUBLIC_DIR = join(ROOT_DIR, 'public');

function generateServiceWorker() {
  console.log('[generate-sw-manifest] Starting...');

  // 1. Read Vite's manifest.json
  const viteManifestPath = join(DIST_DIR, '.vite', 'manifest.json');

  if (!existsSync(viteManifestPath)) {
    console.error('[generate-sw-manifest] Error: Vite manifest not found at', viteManifestPath);
    console.error('[generate-sw-manifest] Make sure to run "vite build" first and enable manifest in vite.config.ts');
    process.exit(1);
  }

  const viteManifest = JSON.parse(readFileSync(viteManifestPath, 'utf-8'));

  // 2. Extract all asset URLs from manifest
  const assetUrls = new Set();

  // Add the root index.html
  assetUrls.add('/index.html');
  assetUrls.add('/');

  // Add manifest.json and icons from public folder
  assetUrls.add('/manifest.json');
  assetUrls.add('/icon-192x192.png');
  assetUrls.add('/icon-512x512.png');

  // Process Vite manifest entries
  for (const [, entry] of Object.entries(viteManifest)) {
    // Add the main file
    if (entry.file) {
      assetUrls.add(`/${entry.file}`);
    }

    // Add CSS files
    if (entry.css) {
      for (const cssFile of entry.css) {
        assetUrls.add(`/${cssFile}`);
      }
    }

    // Add asset imports (fonts, images, etc.)
    if (entry.assets) {
      for (const assetFile of entry.assets) {
        assetUrls.add(`/${assetFile}`);
      }
    }
  }

  // Also scan the assets directory for any files that might not be in manifest
  const assetsDir = join(DIST_DIR, 'assets');
  if (existsSync(assetsDir)) {
    const assetFiles = readdirSync(assetsDir);
    for (const file of assetFiles) {
      assetUrls.add(`/assets/${file}`);
    }
  }

  const precacheUrls = Array.from(assetUrls).sort();
  console.log('[generate-sw-manifest] Found', precacheUrls.length, 'URLs to precache:');
  precacheUrls.forEach((url) => console.log('  ', url));

  // 3. Read sw-template.js
  const templatePath = join(PUBLIC_DIR, 'sw-template.js');

  if (!existsSync(templatePath)) {
    console.error('[generate-sw-manifest] Error: sw-template.js not found at', templatePath);
    process.exit(1);
  }

  const template = readFileSync(templatePath, 'utf-8');

  // 4. Replace placeholder with actual URLs
  const manifest = JSON.stringify(precacheUrls, null, 2);
  const serviceWorker = template.replace('__PRECACHE_MANIFEST__', manifest);

  // 5. Write final sw.js to dist/
  const outputPath = join(DIST_DIR, 'sw.js');
  writeFileSync(outputPath, serviceWorker);

  console.log('[generate-sw-manifest] Service worker written to', outputPath);
  console.log('[generate-sw-manifest] Done!');
}

generateServiceWorker();
