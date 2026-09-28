'use client';

import { useRef } from 'react';
import s from './plane.module.css';

/**
 * Pixel-dithered grayscale portrait. It scans in line by line when its frame appears
 * (CSS, tied to the frame's data-shown), and a lens follows the pointer to
 * reveal the grayscale photo underneath. Works at any camera zoom because the
 * lens position is measured against the element's on-screen box.
 */
export function Portrait({ pixel, photo, alt }: { pixel: string; photo: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--lx', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--ly', `${((e.clientY - r.top) / r.height) * 100}%`);
    el.dataset.lens = '';
  };
  const leave = () => {
    if (ref.current) delete ref.current.dataset.lens;
  };

  return (
    <div ref={ref} className={s.portrait} role="img" aria-label={alt} onPointerMove={move} onPointerDown={move} onPointerLeave={leave} onPointerCancel={leave}>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny pixel PNG; next/image would smooth the pixels */}
      <img className={s.portraitDither} src={pixel} alt="" width={280} height={280} decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element -- lens layer, same box as the dither */}
      <img className={s.portraitPhoto} src={photo} alt="" aria-hidden="true" width={480} height={480} loading="lazy" decoding="async" />
      <span className={s.portraitScan} aria-hidden="true" />
    </div>
  );
}
