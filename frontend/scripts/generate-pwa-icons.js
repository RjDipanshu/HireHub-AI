/**
 * PWA Icon Generator for HireHub AI
 * Generates PNG icons at all required sizes from an SVG template
 * Run: node scripts/generate-pwa-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template for HireHub AI icon (briefcase in brand blue circle)
const generateSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#0a66c2"/>
  <g transform="translate(${size / 2}, ${size / 2})">
    <rect x="${-size * 0.3}" y="${-size * 0.15}" width="${size * 0.6}" height="${size * 0.38}" rx="${size * 0.04}" fill="white"/>
    <rect x="${-size * 0.13}" y="${-size * 0.28}" width="${size * 0.26}" height="${size * 0.15}" rx="${size * 0.03}" fill="none" stroke="white" stroke-width="${size * 0.035}"/>
  </g>
</svg>`;

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach((size) => {
  const svg = generateSVG(size);
  const filepath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Generated: icon-${size}x${size}.svg`);
});

// Also generate a favicon.svg
const faviconSVG = generateSVG(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSVG);
console.log('✅ Generated: favicon.svg');

console.log('\n🎉 All PWA icons generated successfully!');
console.log('Note: For production, convert SVGs to PNGs using a tool like sharp or an online converter.');
console.log('Update manifest.json icon src paths from .svg to .png if using PNGs.');
