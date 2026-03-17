import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStudySession } from '../../context/StudySessionContext';

// Smooth cubic ease-out — decelerates naturally, no snap
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
// Large enough to cover any screen diagonal
const MAX_SIZE = 9000;
// Centering shorthand for Framer Motion (% is relative to element's own size)
const CENTER = { x: '-50%', y: '-50%' } as const;

export default function StudyActivationEffect() {
  const { isActive } = useStudySession();
  const prefersReducedMotion = useReducedMotion();
  const prevActiveRef = useRef(false);
  const [expandKey, setExpandKey] = useState(0);
  const [showExpand, setShowExpand] = useState(false);
  // Pixel coords of button center, updated on each activation
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isActive && !prevActiveRef.current && !prefersReducedMotion) {
      // Locate the toggle button and derive pixel center
      const btn = document.querySelector('[data-study-toggle]');
      if (btn) {
        const r = btn.getBoundingClientRect();
        setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }
      setExpandKey(k => k + 1);
      setShowExpand(true);
      const t = setTimeout(() => setShowExpand(false), 2700);
      prevActiveRef.current = true;
      return () => clearTimeout(t);
    }
    if (!isActive) prevActiveRef.current = false;
  }, [isActive, prefersReducedMotion]);

  // Shared absolute positioning — each ring is centred on the button pixel coords
  const ringBase: React.CSSProperties = {
    position: 'absolute',
    left: origin.x,
    top: origin.y,
    borderRadius: '50%',
    pointerEvents: 'none',
  };

  return (
    <>
      {/* ── Burst animation on activation ─────────────────────────────── */}
      <AnimatePresence>
        {showExpand && (
          <motion.div
            key={expandKey}
            style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}
          >
            {/* Inner glow — solid radial fill, fades fast to give initial "flash" */}
            <motion.div
              initial={{ width: 0, height: 0, ...CENTER, opacity: 0.48 }}
              animate={{ width: MAX_SIZE * 0.32, height: MAX_SIZE * 0.32, ...CENTER, opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.33, 1, 0.68, 1] }}
              style={{
                ...ringBase,
                background:
                  'radial-gradient(circle, rgba(139,92,246,0.55) 0%, rgba(59,130,246,0.22) 50%, transparent 100%)',
              }}
            />

            {/* Primary ring — iridescent conic, each stop has different alpha */}
            <motion.div
              initial={{ width: 0, height: 0, ...CENTER, opacity: 1 }}
              animate={{ width: MAX_SIZE, height: MAX_SIZE, ...CENTER, opacity: 0 }}
              transition={{ duration: 1.9, ease: EASE }}
              style={{
                ...ringBase,
                background:
                  'conic-gradient(from 120deg,' +
                  ' rgba(139,92,246,0.95),' +
                  ' rgba(59,130,246,0.50),' +
                  ' rgba(6,182,212,0.90),' +
                  ' rgba(167,139,250,0.35),' +
                  ' rgba(236,72,153,0.82),' +
                  ' rgba(245,158,11,0.42),' +
                  ' rgba(139,92,246,0.95))',
                // Cut out everything except the outer 8 px band → hollow ring
                maskImage:
                  'radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))',
                WebkitMaskImage:
                  'radial-gradient(farthest-side, transparent calc(100% - 8px), black calc(100% - 8px))',
                filter: 'blur(1.5px)',
              }}
            />

            {/* Secondary ring — offset hue rotation, trails by 0.25 s */}
            <motion.div
              initial={{ width: 0, height: 0, ...CENTER, opacity: 0.62 }}
              animate={{ width: MAX_SIZE, height: MAX_SIZE, ...CENTER, opacity: 0 }}
              transition={{ duration: 2.2, ease: EASE, delay: 0.25 }}
              style={{
                ...ringBase,
                background:
                  'conic-gradient(from 285deg,' +
                  ' rgba(6,182,212,0.72),' +
                  ' rgba(167,139,250,0.45),' +
                  ' rgba(236,72,153,0.68),' +
                  ' rgba(59,130,246,0.40),' +
                  ' rgba(139,92,246,0.72),' +
                  ' rgba(6,182,212,0.45))',
                maskImage:
                  'radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))',
                WebkitMaskImage:
                  'radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))',
                filter: 'blur(2.5px)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Persistent 2 px "holy" border glow while Study Mode is active ── */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, delay: showExpand ? 1.15 : 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 9997,
              boxShadow: [
                // solid 2 px inner border
                'inset 0 0 0 2px rgba(139,92,246,0.70)',
                // tight inner glow band
                'inset 0 0 14px rgba(139,92,246,0.42)',
                // wider soft wash
                'inset 0 0 45px rgba(59,130,246,0.16)',
              ].join(', '),
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
