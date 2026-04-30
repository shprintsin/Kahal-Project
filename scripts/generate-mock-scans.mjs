import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'public', 'mock-scans');

const SETS = [
  { dir: '1765-krakow', count: 4, label: 'AGAD · Castr. Crac. 467', tint: '#f5efe0' },
  { dir: 'pinkas-tiktin', count: 3, label: 'JTS · MS 4109', tint: '#efece2' },
];

function svg({ label, page, tint }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900">
  <rect width="600" height="900" fill="${tint}"/>
  <rect x="40" y="40" width="520" height="820" fill="#fff" stroke="#c9bfa3" stroke-width="2"/>
  <text x="300" y="120" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#3a2f1a">${label}</text>
  <text x="300" y="470" text-anchor="middle" font-family="Georgia, serif" font-size="120" fill="#8a7a4a" opacity="0.4">${page}</text>
  <g stroke="#c9bfa3" stroke-width="1">
    ${Array.from({ length: 22 }, (_, i) => `<line x1="80" y1="${200 + i * 22}" x2="520" y2="${200 + i * 22}"/>`).join('')}
  </g>
  <text x="300" y="840" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#7a6a44">page_000${page}</text>
</svg>`;
}

for (const set of SETS) {
  const dirPath = path.join(ROOT, set.dir);
  fs.mkdirSync(dirPath, { recursive: true });
  for (let i = 1; i <= set.count; i += 1) {
    const filename = `page_000${i}.svg`;
    fs.writeFileSync(path.join(dirPath, filename), svg({ label: set.label, page: i, tint: set.tint }));
  }
}

console.log('mock scans generated');
