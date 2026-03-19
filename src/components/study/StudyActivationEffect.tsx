import React, { useEffect, useRef, useState } from 'react';
import { useStudySession } from '../../context/StudySessionContext';

type Phase = 'idle' | 'in' | 'active' | 'out';

export default function StudyActivationEffect() {
  const { isActive } = useStudySession();
  const [phase, setPhase] = useState<Phase>('idle');
  const mountRef = useRef(true);

  useEffect(() => {
    if (isActive) {
      if (mountRef.current) {
        mountRef.current = false;
        setPhase('active');
        return;
      }
      setPhase('in');
      const t = setTimeout(() => setPhase('active'), 800);
      return () => clearTimeout(t);
    }
    mountRef.current = false;
    setPhase((p) => (p === 'idle' ? 'idle' : 'out'));
  }, [isActive]);

  useEffect(() => {
    if (phase !== 'out') return;
    const t = setTimeout(() => setPhase('idle'), 650);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'idle') return null;

  const cls = `vp-border vp-${phase}`;

  return (
    <div className="vp-container">
      <div className={`${cls} vp-ambient`} />
      <div className={`${cls} vp-core`} />
    </div>
  );
}
