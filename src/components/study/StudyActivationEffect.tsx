import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStudySession } from '../../context/StudySessionContext';

export default function StudyActivationEffect() {
  const { isActive } = useStudySession();
  const prefersReducedMotion = useReducedMotion();
  const prevActiveRef = useRef(false);
  const [expandKey, setExpandKey] = useState(0);
  const [showExpand, setShowExpand] = useState(false);

  useEffect(() => {
    if (isActive && !prevActiveRef.current && !prefersReducedMotion) {
      setExpandKey(k => k + 1);
      setShowExpand(true);
      const t = setTimeout(() => setShowExpand(false), 1100);
      prevActiveRef.current = true;
      return () => clearTimeout(t);
    }
    if (!isActive) {
      prevActiveRef.current = false;
    }
  }, [isActive, prefersReducedMotion]);

  return (
    <>
      {/* Expanding circle burst on activation */}
      <AnimatePresence>
        {showExpand && (
          <motion.div
            key={expandKey}
            initial={{ clipPath: 'circle(0px at 22% 42%)', opacity: 0.75 }}
            animate={{ clipPath: 'circle(200vmax at 22% 42%)', opacity: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'conic-gradient(from 120deg at 30% 50%, #8b5cf6, #3b82f6, #06b6d4, #a78bfa, #ec4899, #8b5cf6)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        )}
      </AnimatePresence>

      {/* Ambient corner glow while study mode active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: showExpand ? 0.7 : 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 9997,
              background: [
                'radial-gradient(ellipse at 0% 0%, rgba(139,92,246,0.07) 0%, transparent 42%)',
                'radial-gradient(ellipse at 100% 0%, rgba(59,130,246,0.06) 0%, transparent 42%)',
                'radial-gradient(ellipse at 100% 100%, rgba(6,182,212,0.06) 0%, transparent 42%)',
                'radial-gradient(ellipse at 0% 100%, rgba(168,85,247,0.07) 0%, transparent 42%)',
              ].join(', '),
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
