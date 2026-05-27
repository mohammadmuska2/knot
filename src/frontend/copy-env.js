import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.join(__dirname, 'env.json');
const dest = path.join(__dirname, 'dist', 'env.json');

try {
  // Ensure dist directory exists
  const distDir = path.dirname(dest);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log('env.json copied successfully to dist/');
} catch (e) {
  console.error('Failed to copy env.json:', e.message);
  process.exit(1);
}
