import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, 'env.json');
const dest = path.join(__dirname, 'dist', 'env.json');

const DEFAULT_ENV = JSON.stringify({
  "backend_host": "undefined",
  "backend_canister_id": "undefined",
  "project_id": "undefined",
  "ii_derivation_origin": "undefined"
}, null, 2);

try {
  // Ensure dist directory exists
  const distDir = path.dirname(dest);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('env.json copied successfully to dist/');
  } else {
    // Self-healing: if env.json is missing on remote servers (e.g. ignored by git), write a default mockup env.json
    fs.writeFileSync(dest, DEFAULT_ENV);
    console.log('env.json was missing; successfully generated a default mockup env.json in dist/');
  }
} catch (e) {
  console.error('Failed to copy/generate env.json:', e.message);
  process.exit(1);
}
