// Regenerate the portrait assets:
//   node scripts/dither-portrait.mjs <photo> public/portrait [cols=200]
// Makes pixel.png (grayscale ordered dither, background faded to transparent)
// and gray.webp (smooth grayscale for the hover lens). Needs Playwright's
// Chromium (the image work runs in a canvas); not part of the build.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const [src, outDir, colsArg = '200'] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage();
const dataUrl = `data:image/${src.endsWith('.png') ? 'png' : 'jpeg'};base64,` + readFileSync(src).toString('base64');
const res = await p.evaluate(
  async ({ dataUrl, cols }) => {
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const cw = img.width,
      ch = cw,
      cy = 40; // square crop: head and shoulders
    const mk = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });

    // mask: keep the head and torso, fade the background out
    // soft: 1 on the subject, falling to 0 over a wide band (dissolved through the dither below)
    const mask = (u, v) => {
      const head = 1 - Math.hypot((u - 0.5) / 0.3, (v - 0.33) / 0.37);
      const body = 1 - Math.hypot((u - 0.5) / 0.56, Math.max(0, 0.98 - v) / 0.46);
      const m = Math.max(head, body);
      return Math.max(0, Math.min(1, m / 0.22));
    };

    // smooth grayscale for the lens
    const gw = 480,
      g = mk(gw, gw),
      gx = g.getContext('2d');
    gx.filter = 'grayscale(1) contrast(1.05)';
    gx.drawImage(img, 0, cy, cw, ch, 0, 0, gw, gw);
    const gd = gx.getImageData(0, 0, gw, gw);
    for (let i = 0; i < gw * gw; i++) gd.data[i * 4 + 3] = 255 * mask((i % gw) / gw, Math.floor(i / gw) / gw);
    gx.putImageData(gd, 0, 0);
    const gray = g.toDataURL('image/webp', 0.8);

    // pixel version: 5 gray levels with a 4×4 Bayer ordered dither
    const w = cols,
      d = mk(w, w),
      dx = d.getContext('2d');
    dx.imageSmoothingQuality = 'high';
    dx.drawImage(img, 0, cy, cw, ch, 0, 0, w, w);
    const px = dx.getImageData(0, 0, w, w);
    const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const LV = 4; // steps between levels → 5 grays
    for (let i = 0; i < w * w; i++) {
      const x = i % w,
        y = Math.floor(i / w);
      let v = (px.data[i * 4] * 0.299 + px.data[i * 4 + 1] * 0.587 + px.data[i * 4 + 2] * 0.114) / 255;
      v = Math.max(0, Math.min(1, (v - 0.5) * 1.12 + 0.52));
      const t = (B[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
      const q = Math.min(LV, Math.floor(v * LV + t)) / LV;
      const c = Math.round(18 + q * (240 - 18));
      // the edge dissolves pixel by pixel through the same Bayer pattern (stays crisp, no halo)
      const a = mask(x / w, y / w) > 1 - (B[((y + 2) % 4) * 4 + ((x + 1) % 4)] + 0.5) / 16 ? 255 : 0;
      px.data.set([c, c, c, a], i * 4);
    }
    dx.putImageData(px, 0, 0);
    return { gray, pixel: d.toDataURL('image/png') };
  },
  { dataUrl, cols: +colsArg },
);
const save = (name, url) => writeFileSync(`${outDir}/${name}`, Buffer.from(url.split(',')[1], 'base64'));
save('pixel.png', res.pixel);
save('gray.webp', res.gray);
await b.close();
console.log('wrote pixel.png and gray.webp');
