const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const outDir = path.join(__dirname, 'frontend', 'icons');

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#d32f2f';
  ctx.fillRect(0, 0, size, size);

  const r = size * 0.35;
  ctx.beginPath();
  ctx.arc(size/2, size/2, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(size/2, size/2, r * 0.85, 0, Math.PI * 2);
  ctx.fillStyle = '#d32f2f';
  ctx.fill();

  const sliceR = r * 0.45;
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 90) * Math.PI / 180;
    const x = size/2 + Math.cos(angle) * sliceR;
    const y = size/2 + Math.sin(angle) * sliceR;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = '#ff9800';
    ctx.fill();
  }

  const fontSize = size * 0.18;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('QP', size/2, size/2);

  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), buf);
  console.log(`Created icon-${size}.png`);
});

console.log('Done!');
