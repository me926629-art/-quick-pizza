const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPizzaIcon(size) {
  const cx = size / 2;
  const cy = size / 2;

  function dist(x, y) {
    return Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  }

  function colorAt(x, y) {
    const d = dist(x, y);
    const outerR = size * 0.46;
    const crustR = size * 0.38;
    const cheeseR = size * 0.36;
    const sauceR = size * 0.32;

    // background transparent
    if (d > outerR) return [0, 0, 0, 0];

    // red background circle (beneath everything)
    const bgR = size * 0.48;

    // crust (golden brown ring)
    if (d > crustR && d <= outerR) {
      return [200, 140, 40, 255]; // golden crust
    }

    // cheese (yellow area)
    if (d > sauceR && d <= crustR) {
      return [255, 210, 80, 255]; // cheese yellow
    }

    // sauce (red center)
    if (d <= sauceR) {
      return [200, 50, 40, 255]; // tomato sauce
    }

    return [0, 0, 0, 0];
  }

  function isTopping(x, y, tx, ty, r) {
    const dx = x - tx;
    const dy = y - ty;
    return Math.sqrt(dx * dx + dy * dy) < r;
  }

  // Toppings positions (relative to center, in pixels)
  const toppings = [
    { x: cx - size * 0.12, y: cy - size * 0.15, r: size * 0.045, type: 'pepperoni' },
    { x: cx + size * 0.08,  y: cy - size * 0.08, r: size * 0.045, type: 'pepperoni' },
    { x: cx - size * 0.05, y: cy + size * 0.1,  r: size * 0.045, type: 'pepperoni' },
    { x: cx + size * 0.15, y: cy + size * 0.05, r: size * 0.045, type: 'pepperoni' },
    { x: cx - size * 0.18, y: cy + size * 0.02, r: size * 0.04,  type: 'pepperoni' },
    { x: cx + size * 0.02, y: cy + size * 0.18, r: size * 0.04,  type: 'pepperoni' },
    // olives (black dots)
    { x: cx + size * 0.05, y: cy - size * 0.18, r: size * 0.03,  type: 'olive' },
    { x: cx - size * 0.15, y: cy + size * 0.12, r: size * 0.03,  type: 'olive' },
    { x: cx + size * 0.12, y: cy + size * 0.12, r: size * 0.03,  type: 'olive' },
    // green peppers
    { x: cx - size * 0.08, y: cy - size * 0.02, r: size * 0.025, type: 'pepper' },
    { x: cx + size * 0.1,  y: cy + size * 0.16, r: size * 0.025, type: 'pepper' },
  ];

  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = [0]; // filter byte
    for (let x = 0; x < size; x++) {
      const d = dist(x, y);
      const bgR = size * 0.48;

      // outside the icon circle
      if (d > bgR) {
        row.push(0, 0, 0, 0);
        continue;
      }

      let color = colorAt(x, y);

      // sauce area - add texture
      const sauceR = size * 0.32;
      if (d <= sauceR) {
        // slight texture variation
        const noise = Math.sin(x * 0.5) * Math.cos(y * 0.3) * 8;
        color = [color[0] + noise, color[1], color[2], 255];
      }

      // cheese area - add texture
      const crustR = size * 0.38;
      if (d > sauceR && d <= crustR) {
        const noise = Math.sin(x * 0.3 + y * 0.2) * 10;
        color = [color[0], color[1] + noise, color[2] - 5, 255];
      }

      // crust texture
      if (d > crustR && d <= bgR) {
        const noise = Math.sin(x * 0.4) * 5;
        color = [color[0] + noise, color[1] + noise, color[2], 255];
      }

      // toppings
      for (const t of toppings) {
        if (isTopping(x, y, t.x, t.y, t.r)) {
          if (t.type === 'pepperoni') {
            color = [160, 30, 20, 255]; // dark red
          } else if (t.type === 'olive') {
            color = [30, 30, 30, 255]; // black
          } else if (t.type === 'pepper') {
            color = [40, 140, 50, 255]; // green
          }
        }
      }

      // soft edge anti-aliasing
      if (d > bgR - 1) {
        const alpha = Math.max(0, 255 * (bgR - d));
        color = [color[0], color[1], color[2], Math.min(color[3], alpha)];
      }

      row.push(
        Math.max(0, Math.min(255, Math.round(color[0]))),
        Math.max(0, Math.min(255, Math.round(color[1]))),
        Math.max(0, Math.min(255, Math.round(color[2]))),
        Math.max(0, Math.min(255, Math.round(color[3])))
      );
    }
    rows.push(Buffer.from(row));
  }

  const raw = Buffer.concat(rows);

  function crc32(buf) {
    let c = 0xffffffff;
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let cc = n;
      for (let k = 0; k < 8; k++) cc = (cc & 1) ? (0xedb88320 ^ (cc >>> 1)) : (cc >>> 1);
      table[n] = cc;
    }
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const t = Buffer.from(type);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const combined = Buffer.concat([t, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(combined));
    return Buffer.concat([len, combined, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const outDir = path.join(__dirname, 'frontend', 'icons');
fs.mkdirSync(outDir, { recursive: true });

[192, 512].forEach(size => {
  const png = createPizzaIcon(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`icon-${size}.png created (${(png.length / 1024).toFixed(1)} KB)`);
});

console.log('Done!');
