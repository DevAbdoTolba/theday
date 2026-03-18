import React, { useSyncExternalStore } from 'react';
import { useTheme } from '@mui/material';
import { selectionStore } from '../../utils/selectionStore';

interface Props {
  isSelectable: boolean;
  fileId: string;
}

export default function SelectionOverlay({ isSelectable, fileId }: Props) {
  const theme = useTheme();
  const isSelected = useSyncExternalStore(
    selectionStore.subscribe,
    () => selectionStore.isSelected(fileId),
    () => false,
  );

  if (!isSelectable || !isSelected) return null;

  const primary = theme.palette.primary.main;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        pointerEvents: 'none',
        zIndex: 10,
        border: `2px solid ${primary}`,
      }}
    >
      {/* Tinted background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          backgroundColor: `${primary}20`,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.12s ease',
        }}
      />

      {/* Check badge */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 11,
          backgroundColor: primary,
          borderRadius: '50%',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          transform: isSelected ? 'scale(1)' : 'scale(0)',
          opacity: isSelected ? 1 : 0,
          transition: 'transform 0.12s ease, opacity 0.12s ease',
          willChange: 'transform, opacity',
        }}
      >
        {/* Inline check-circle SVG — zero import cost */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
        </svg>
      </div>
    </div>
  );
}
