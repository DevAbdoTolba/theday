import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudySession } from '../../context/StudySessionContext';

export default function StudyActivationEffect() {
  const { isActive } = useStudySession();

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          key="apple-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997 }}
        >
          {/* Single element — hue-rotate is a GPU color filter, zero CPU cost */}
          <div
            className="apple-glow-border"
            style={{
              position: 'absolute',
              inset: 0,
              // Starting hue: Apple Intelligence purple — cycles through full rainbow
              boxShadow: [
                'inset 0 0 0 2px rgba(188,130,243,0.85)',
                'inset 0 0 18px rgba(188,130,243,0.15)',
              ].join(', '),
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
