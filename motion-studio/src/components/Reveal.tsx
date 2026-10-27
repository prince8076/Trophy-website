import { useEffect, useRef, type ReactNode } from 'react';

/** IntersectionObserver reveal: adds .is-visible once, never replays
 *  on tiny scroll movements. Works without any animation library,
 *  so the page stays usable if GSAP fails to load. */
export function Reveal({ children, className = '', clip = false }: { children: ReactNode; className?: string; clip?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('is-visible'); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('is-visible'); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`${clip ? 'clip-reveal' : 'reveal'} ${className}`}>{children}</div>;
}
