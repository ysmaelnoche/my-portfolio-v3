// Regenerate the portrait assets: node scripts/dither-portrait.mjs <photo.png> public/portrait 200 1.0 1.25
// Needs Playwright's Chromium (it does the image work in a canvas); not part of the build.
// One-off: crop the portrait, make a grayscale JPEG (for the lens) and a 1-bit Atkinson PNG (light dots on transparent).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [src, outDir, cols, gammaArg, contrastArg] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage();
const dataUrl = 'data:image/png;base64,' + readFileSync(src).toString('base64');
const res = await p.evaluate(async ({ dataUrl, cols, gamma, contrast }) => {
  const img = new Image(); img.src = dataUrl; await img.decode();
  // crop: head and shoulders, 4:3 landscape-ish → use 4:5 portrait for a tighter bust
  const cw = img.width, ch = Math.round(cw * 1.0), cy = 40;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  // grayscale lens image, 800px wide
  const gw = 800, gh = Math.round(gw * ch / cw); const g = mk(gw, gh); const gx = g.getContext('2d');
  gx.filter = 'grayscale(1) contrast(1.08)'; gx.drawImage(img, 0, cy, cw, ch, 0, 0, gw, gh);
  const gray = g.toDataURL('image/jpeg', 0.82);
  // dither source
  const w = cols, h = Math.round(w * ch / cw); const d = mk(w, h); const dx = d.getContext('2d');
  dx.imageSmoothingQuality = 'high'; dx.drawImage(img, 0, cy, cw, ch, 0, 0, w, h);
  const px = dx.getImageData(0, 0, w, h); const a = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) { let v = (px.data[i*4]*.299 + px.data[i*4+1]*.587 + px.data[i*4+2]*.114) / 255;
    v = Math.pow(v, gamma); v = (v - .5) * contrast + .5;
    // fade the background: keep the head and shoulders, darken toward the edges and top corners
    const x = i % w, y = Math.floor(i / w), fx = (x / w - 0.5) / 0.46, fy = (y / h - 0.52) / 0.62;
    const m = Math.max(0, Math.min(1, 1.35 - Math.hypot(fx, fy)));
    a[i] = Math.max(0, Math.min(1, v * (0.5 + 0.5 * m))) * 255; }
  // unsharp mask: bring out eyes, brows and mouth before dithering
  { const r = 2, bl = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, n = 0;
      for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) { const X = x + k, Y = y + j; if (X >= 0 && X < w && Y >= 0 && Y < h) { s += a[Y*w+X]; n++; } }
      bl[y*w+x] = s / n; }
    for (let i = 0; i < w*h; i++) a[i] = Math.max(0, Math.min(255, a[i] + 1.1 * (a[i] - bl[i]))); }
  const K = [[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y*w+x, o = a[i], n = o < 128 ? 0 : 255, e = (o - n) / 8; a[i] = n;
    for (const [kx, ky] of K) { const X = x+kx, Y = y+ky; if (X >= 0 && X < w && Y < h) a[Y*w+X] += e; } }
  const out = dx.createImageData(w, h);
  for (let i = 0; i < w*h; i++) out.data.set(a[i] > 127 ? [237,237,237,255] : [0,0,0,0], i*4);
  dx.putImageData(out, 0, 0);
  const dither = d.toDataURL('image/png');
  // light theme: the same dither as dark ink where the image is dark (not an inverted negative)
  const ink = dx.createImageData(w, h);
  for (let i = 0; i < w*h; i++) ink.data.set(a[i] > 127 ? [0,0,0,0] : [18,18,18,255], i*4);
  dx.putImageData(ink, 0, 0);
  return { gray, dither, ink: d.toDataURL('image/png'), w, h, gw, gh };
}, { dataUrl, cols: +cols, gamma: +gammaArg, contrast: +contrastArg });
writeFileSync(outDir + '/gray.jpg', Buffer.from(res.gray.split(',')[1], 'base64'));
writeFileSync(outDir + '/dither.png', Buffer.from(res.dither.split(',')[1], 'base64'));
writeFileSync(outDir + '/dither-ink.png', Buffer.from(res.ink.split(',')[1], 'base64'));
console.log(JSON.stringify({ dither: [res.w, res.h], gray: [res.gw, res.gh] }));
await b.close();
