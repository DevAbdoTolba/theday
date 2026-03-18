import React from 'react';
import { Box, useTheme } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';

interface Props {
  isSelectable: boolean;
  isSelected: boolean;
}

export default function SelectionOverlay({ isSelectable, isSelected }: Props) {
  const theme = useTheme();

  if (!isSelectable) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        pointerEvents: 'none',
        zIndex: 10,
        border: `2px solid ${theme.palette.primary.main}`,
      }}
      className={!isSelected ? 'study-selectable-border' : undefined}
    >
      {/* Tinted background — CSS opacity transition, no JS */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          bgcolor: `${theme.palette.primary.main}20`,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.12s ease',
        }}
      />

      {/* Check badge — CSS scale+opacity, cannot queue up like Framer Motion */}
      <Box
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 11,
          bgcolor: theme.palette.primary.main,
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
        <CheckCircle sx={{ fontSize: 20 }} />
      </Box>
    </Box>
  );
}
