import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceLogoPath = 'C:\\Users\\SURBJEET\\.gemini\\antigravity-ide\\brain\\c16cccfc-271d-4b46-b619-b4d1602dd5dd\\frametrail_cinematic_lens_1788842666892.jpg';
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(sourceLogoPath)) {
  console.error('Source logo file not found:', sourceLogoPath);
  process.exit(1);
}

const targets = [
  'img5.png',
  'IMG_20240423_000718.png',
  'favicon.png',
  'logo.jpg',
  'logo.png'
];

targets.forEach((fileName) => {
  const dest = path.join(publicDir, fileName);
  fs.copyFileSync(sourceLogoPath, dest);
  console.log(`Updated: ${dest}`);
});

console.log('SUCCESS: All public logo assets updated to Cinematic Hex-Iris Vortex logo!');
