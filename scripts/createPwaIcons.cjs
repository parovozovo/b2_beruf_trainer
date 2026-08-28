const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation for pure Node PNG generation
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, renderPixel) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y, width, height);
      const offset = 1 + x * 4;
      row[offset] = r;
      row[offset + 1] = g;
      row[offset + 2] = b;
      row[offset + 3] = a;
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Icon Pixel Shader: Draws a modern squircle with German flag micro-ribbon, dark gradient, golden B2 & indigo plus
function renderIconPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;

  // Squircle distance formula: (|x|^4 + |y|^4)^(1/4)
  const nx = (x - cx) / (w * 0.44);
  const ny = (y - cy) / (h * 0.44);
  const dist = Math.pow(Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4), 0.25);

  if (!isMaskable && dist > 1.05) {
    return [0, 0, 0, 0]; // transparent outside squircle
  }

  // Border glow
  if (!isMaskable && dist > 0.96) {
    return [99, 102, 241, 255]; // Indigo border
  }

  // German Flag Micro Ribbon at the top (top 6% of icon)
  if (y < h * 0.08 && x > w * 0.25 && x < w * 0.75) {
    const flagRel = (x - w * 0.25) / (w * 0.5);
    if (flagRel < 0.33) return [30, 41, 59, 255]; // Black/Dark slate
    if (flagRel < 0.66) return [220, 38, 38, 255]; // Red
    return [245, 158, 11, 255]; // Gold
  }

  // Background radial gradient: Indigo center glow fading to dark obsidian slate
  const relY = y / h;
  const radDist = Math.hypot(x - cx, y - cy * 0.85) / (w * 0.5);
  const glow = Math.max(0, 1 - radDist);

  let bgR = Math.floor(15 + glow * 40 + relY * 5);
  let bgG = Math.floor(23 + glow * 30 + relY * 5);
  let bgB = Math.floor(42 + glow * 85 + relY * 15);

  // Approximate letters B 2 +
  // Letter B: bounding box [0.22*w to 0.45*w], [0.35*h to 0.75*h]
  const inB =
    (x >= w * 0.22 && x <= w * 0.28 && y >= h * 0.35 && y <= h * 0.75) || // spine
    (y >= h * 0.35 && y <= h * 0.41 && x >= w * 0.22 && x <= w * 0.42) || // top bar
    (y >= h * 0.52 && y <= h * 0.58 && x >= w * 0.22 && x <= w * 0.44) || // middle bar
    (y >= h * 0.69 && y <= h * 0.75 && x >= w * 0.22 && x <= w * 0.42) || // bottom bar
    (x >= w * 0.39 && x <= w * 0.45 && ((y >= h * 0.38 && y <= h * 0.55) || (y >= h * 0.55 && y <= h * 0.72))); // right curves

  // Letter 2: bounding box [0.48*w to 0.68*w], [0.35*h to 0.75*h]
  const in2 =
    (y >= h * 0.35 && y <= h * 0.41 && x >= w * 0.48 && x <= w * 0.68) || // top bar
    (x >= w * 0.62 && x <= w * 0.68 && y >= h * 0.38 && y <= h * 0.52) || // right drop
    (x >= w * 0.48 && x <= w * 0.68 && y >= h * 0.69 && y <= h * 0.75) || // bottom base
    (Math.abs((h * 0.7 - y) - (x - w * 0.48) * 1.0) < h * 0.045 && y >= h * 0.5 && y <= h * 0.7); // diagonal

  // Plus sign: [0.72*w to 0.84*w], [0.28*h to 0.44*h]
  const px = cx + w * 0.26;
  const py = cy - h * 0.2;
  const inPlus =
    (Math.abs(x - px) <= w * 0.02 && Math.abs(y - py) <= h * 0.06) ||
    (Math.abs(y - py) <= h * 0.02 && Math.abs(x - px) <= w * 0.06);

  if (inB || in2) {
    // Golden gradient text
    const textGrad = (y - h * 0.35) / (h * 0.4);
    const r = Math.floor(255 - textGrad * 10);
    const g = Math.floor(224 - textGrad * 70);
    const b = Math.floor(71 - textGrad * 60);
    return [r, g, b, 255];
  }

  if (inPlus) {
    return [56, 189, 248, 255]; // Electric cyan-blue
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
const p192 = createPng(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), p192);
console.log('✅ Generated public/pwa-192x192.png');

// Generate 512x512
const p512 = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), p512);
console.log('✅ Generated public/pwa-512x512.png');

// Generate apple-touch-icon 180x180
const p180 = createPng(180, 180, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p180);
console.log('✅ Generated public/apple-touch-icon.png');

// Generate maskable-icon 512x512
const pMask = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), pMask);
console.log('✅ Generated public/maskable-icon-512x512.png');
