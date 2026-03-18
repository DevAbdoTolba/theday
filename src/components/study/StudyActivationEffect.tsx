import React, { useEffect, useRef, useState } from 'react';
import { useStudySession } from '../../context/StudySessionContext';

/** Generate slightly randomized asymmetric border-radius for organic feel */
function organicRadius(base: number, variance: number): string {
  const v = () => Math.round(base + (Math.random() - 0.5) * variance);
  return `${v()}% ${v()}% ${v()}% ${v()}% / ${v()}% ${v()}% ${v()}% ${v()}%`;
}

export default function StudyActivationEffect() {
  const { isActive } = useStudySession();
  const [phase, setPhase] = useState<'idle' | 'expanding' | 'active' | 'collapsing'>('idle');
  const [vars, setVars] = useState<React.CSSProperties>({});
  const mountRef = useRef(true);

  /* Respond to study mode toggle */
  useEffect(() => {
    if (isActive) {
      /* On first mount (page load with study mode already on), skip to active */
      if (mountRef.current) {
        mountRef.current = false;
        setPhase('active');
        return;
      }

      /* Locate the Study toggle button to use as animation origin */
      const btn = document.querySelector('[data-study-toggle="true"]');
      const R = 22;
      let top = 0;
      let right = Math.round(window.innerWidth / 2 - R);
      let bottom = Math.round(window.innerHeight - R);
      let left = Math.round(window.innerWidth / 2 - R);

      if (btn) {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        top = Math.round(cy - R);
        right = Math.round(window.innerWidth - cx - R);
        bottom = Math.round(window.innerHeight - cy - R);
        left = Math.round(cx - R);
      }

      setVars({
        '--sae-top': `${top}px`,
        '--sae-right': `${right}px`,
        '--sae-bottom': `${bottom}px`,
        '--sae-left': `${left}px`,
        '--sae-br1': organicRadius(47, 10),
        '--sae-br2': organicRadius(26, 14),
        '--sae-br3': organicRadius(11, 10),
      } as React.CSSProperties);

      setPhase('expanding');
      const timer = setTimeout(() => setPhase('active'), 650);
      return () => clearTimeout(timer);
    }

    mountRef.current = false;
    setPhase((p) => (p === 'idle' ? 'idle' : 'collapsing'));
  }, [isActive]);

  /* Auto-clear after collapse animation finishes */
  useEffect(() => {
    if (phase !== 'collapsing') return;
    const t = setTimeout(() => setPhase('idle'), 450);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'idle') return null;

  const phaseClass = `study-activation-${phase}`;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9997 }}>
      {/* Soft glow layer (blurred duplicate) */}
      <div className={`study-ai-border study-ai-glow ${phaseClass}`} style={vars} />
      {/* Crisp gradient border */}
      <div className={`study-ai-border ${phaseClass}`} style={vars} />
    </div>
  );
}
