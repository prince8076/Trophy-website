import { useEffect, useState } from 'react';

/** Minimal loading sequence: 0–100% progress, title chars rise in,
 *  then the overlay fades out. Completes quickly if assets are fast:
 *  progress is time-based and capped at ~1.4s. */
export default function Intro({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(100, Math.floor(((t - start) / 1200) * 100));
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else {
        setLeaving(true);
        window.setTimeout(onDone, 450);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className="intro" style={{ opacity: leaving ? 0 : 1, transition: 'opacity 0.45s ease', pointerEvents: leaving ? 'none' : 'auto' }} aria-label="Loading">
      <div className="intro-title" aria-label="Shreeji Corporates">
        {'SHREEJI'.split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${0.08 + i * 0.07}s` }}>{c}</span>
        ))}
      </div>
      <div className="intro-bar"><i style={{ width: `${pct}%` }} /></div>
      <div className="intro-pct">{pct}% — SHREEJI CORPORATES</div>
    </div>
  );
}
