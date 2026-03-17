import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStudySession } from '../../context/StudySessionContext';

// Smooth ease-out cubic — slow luxurious deceleration
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
// Large enough to cover any screen diagonal
const MAX_SIZE = 9000;
// Framer Motion % centering (relative to element's own size)
const CENTER = { x: '-50%', y: '-50%' } as const;

// Burst duration in ms — ring animation is 3.2 s, border appears after it settles
const BURST_DURATION_MS = 3400;
// How long into the burst before border fades in
const BORDER_DELAY_S = 2.8;

export default function StudyActivationEffect() {
  const { isActive } = useStudySession();
  const prefersReducedMotion = useReducedMotion();
  const prevActiveRef = useRef(false);
  const [expandKey, setExpandKey] = useState(0);
  const [showExpand, setShowExpand] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isActive && !prevActiveRef.current && !prefersReducedMotion) {
      const btn = document.querySelector('[data-study-toggle]');
      if (btn) {
        const r = btn.getBoundingClientRect();
        setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
      setExpandKey(k => k + 1);
      setShowExpand(true);
      const t = setTimeout(() => setShowExpand(false), BURST_DURATION_MS);
      prevActiveRef.current = true;
      return () => clearTimeout(t);
    }
    if (!isActive) prevActiveRef.current = false;
  }, [isActive, prefersReducedMotion]);

  const ringBase: React.CSSProperties = {
    position: 'absolute',
    left: origin.x,
    top: origin.y,
    borderRadius: '50%',
    pointerEvents: 'none',
  };

  return (
    <>
      {/* ── Burst animation ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showExpand && (
          <motion.div
            key={expandKey}
            style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}
          >
            {/* Soft warm glow orb — fades out before the ring reaches the edges */}
            <motion.div
              initial={{ width: 0, height: 0, ...CENTER, opacity: 0.38 }}
              animate={{ width: MAX_SIZE * 0.28, height: MAX_SIZE * 0.28, ...CENTER, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
              style={{
                ...ringBase,
                background:
                  'radial-gradient(circle, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.25) 40%, transparent 100%)',
              }}
            />

            {/* Main ring — warm iridescent with varying per-stop alpha */}
            <motion.div
              initial={{ width: 0, height: 0, ...CENTER, opacity: 0.88 }}
              animate={{ width: MAX_SIZE, height: MAX_SIZE, ...CENTER, opacity: 0 }}
              transition={{ duration: 3.2, ease: EASE }}
              style={{
                ...ringBase,
                // Warm aurora: amber → rose → violet → sky → amber
                background:
                  'conic-gradient(from 90deg,' +
                  ' rgba(251,191,36,0.95),' +    // warm amber
                  ' rgba(251,113,133,0.55),' +   // soft rose
                  ' rgba(167,139,250,0.80),' +   // violet
                  ' rgba(34,211,238,0.42),' +    // hint of sky
                  ' rgba(245,158,11,0.88),' +    // deep amber
                  ' rgba(236,72,153,0.50),' +    // magenta
                  ' rgba(251,191,36,0.95))',
                // Hollow ring: keep only outer ~7 px band
                maskImage:
                  'radial-gradient(farthest-side, transparent calc(100% - 7px), black calc(100% - 7px))',
                WebkitMaskImage:
                  'radial-gradient(farthest-side, transparent calc(100% - 7px), black calc(100% - 7px))',
                filter: 'blur(1px)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Persistent border glow — only fades in AFTER burst settles ── */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.9,
              // Wait until the expanding ring is nearly invisible before showing
              delay: showExpand ? BORDER_DELAY_S : 0,
            }}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 9997,
              boxShadow: [
                'inset 0 0 0 2px rgba(251,191,36,0.32)',   // warm amber border
                'inset 0 0 20px rgba(251,191,36,0.10)',    // inner amber wash
                'inset 0 0 50px rgba(167,139,250,0.07)',   // distant violet hint
              ].join(', '),
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
