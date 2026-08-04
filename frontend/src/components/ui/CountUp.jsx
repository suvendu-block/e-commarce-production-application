import { useEffect, useRef } from 'react';
import useReveal from '../../hooks/useReveal';

/**
 * Count-up number for stat blocks. Writes to the DOM via rAF —
 * no React state on the animation path. Ends at `end` exactly.
 * Honors prefers-reduced-motion (jumps straight to the value).
 */
const CountUp = ({ end, duration = 1400, className = '' }) => {
  const spanRef = useRef(null);
  const wrapRef = useReveal();

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      node.textContent = String(end);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic — decelerates into the final value
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = String(Math.round(end * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);

  return (
    <div ref={wrapRef} className={`reveal ${className}`}>
      <span ref={spanRef} aria-label={String(end)}>
        0
      </span>
    </div>
  );
};

export default CountUp;
