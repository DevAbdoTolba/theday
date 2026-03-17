import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useStudySession } from '../../context/StudySessionContext';

// Apple Intelligence color palette (iOS 18 Siri activation)
const GRAD =
  'conic-gradient(from 0deg at 50% 50%,' +
  ' #C686FF, #8D9FFF, #BC82F3, #FF6778, #FFBA71, #F5B9EA, #AA6EEE, #C686FF)';

interface LayerProps {
  /** Gaussian blur radius in px — 0 = sharp outer ring */
  blur: number;
  /** Full-rotation duration in seconds — layers desync over time → organic flow */
  speed: number;
  /** Layer opacity */
  opacity: number;
  /** Visible border band width in px (padding area that the mask keeps) */
  border: number;
}

// Four progressively softer halos, identical to Apple's 4-layer approach
const LAYERS: LayerProps[] = [
  { blur: 0,  speed: 6,  opacity: 0.90, border: 3  },
  { blur: 5,  speed: 7,  opacity: 0.65, border: 7  },
  { blur: 14, speed: 8,  opacity: 0.40, border: 14 },
  { blur: 26, speed: 9,  opacity: 0.22, border: 22 },
];

/**
 * A single rotating-gradient band confined to the viewport border.
 *
 * Technique:
 *   - The wrapper div has `padding: border` and a mask that subtracts
 *     content-box from border-box, leaving only the padding band visible.
 *   - Inside sits an oversized (200 % × 200 %) rotating conic-gradient div.
 *     Rotating it makes the colors appear to flow around the screen edge.
 */
function GlowBand({ blur, speed, opacity, border }: LayerProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        pointerEvents: 'none',
        overflow: 'hidden',
        padding: border,
        // Mask composite: show ONLY the padding ring, hide the content area
        maskImage: 'linear-gradient(#fff,#fff), linear-gradient(#fff,#fff)',
        maskClip: 'content-box, border-box',
        maskComposite: 'exclude' as React.CSSProperties['maskComposite'],
        WebkitMaskImage: 'linear-gradient(#fff,#fff), linear-gradient(#fff,#fff)',
        WebkitMaskClip: 'content-box, border-box',
        WebkitMaskComposite: 'destination-out',
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
        style={{
          position: 'absolute',
          // 200 % × 200 % ensures full coverage while rotating (avoids corner gaps)
          width: '200%',
          height: '200%',
          top: '-50%',
          left: '-50%',
          background: GRAD,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      />
    </div>
  );
}

export default function StudyActivationEffect() {
  const { isActive } = useStudySession();
  const prefersReducedMotion = useReducedMotion();

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
          {prefersReducedMotion ? (
            // Static fallback — no motion, just a hint of border
            <div
              style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 0 2px rgba(188,130,243,0.45)',
              }}
            />
          ) : (
            LAYERS.map((layer, i) => <GlowBand key={i} {...layer} />)
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
