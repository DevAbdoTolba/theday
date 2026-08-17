import React from 'react';
import { useStudySession } from '../../context/StudySessionContext';

export default function StudyActivationEffect() {
  const { isActive } = useStudySession();

  return (
    <div
      aria-hidden="true"
      className={`study-aura${isActive ? ' study-aura--active' : ''}`}
    >
      <span className="study-aura__arrival" />
      <span className="study-aura__frame" />
    </div>
  );
}
