import { useEffect, useRef, useState } from 'react';

/** Custom cursor, desktop fine-pointers only.
 *  A dot follows the pointer instantly; a ring lerps behind it.
 *  Hovering buttons/links/cards expands the ring and shows a label
 *  from data-cursor-label. Never blocks clicks or text selection. */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const onMove = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      const dot = dotRef.current;
      if (dot) dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      const t = (e.target as HTMLElement).closest?.('[data-cursor-label], a, button, .horiz-card');
      const ring = ringRef.current;
      if (ring) {
        ring.classList.toggle('is-hover', !!t);
        const lbl = (e.target as HTMLElement).closest?.('[data-cursor-label]')?.getAttribute('data-cursor-label') || '';
        setLabel(lbl);
      }
    };
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16;
      const ring = ringRef.current;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">{label}</div>
    </>
  );
}
