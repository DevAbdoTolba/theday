import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Button, useTheme } from '@mui/material';
import { useStudySession } from '../../context/StudySessionContext';

const AutoAwesome = dynamic(() => import('@mui/icons-material/AutoAwesome'), { ssr: false });

export default function StudyModeToggle() {
  const { isActive, toggleMode } = useStudySession();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Button
      onClick={toggleMode}
      size="small"
      disableRipple={false}
      sx={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: isActive
          ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 60%, #06b6d4 100%)'
          : isDark
            ? 'rgba(139,92,246,0.13)'
            : 'rgba(139,92,246,0.07)',
        border: isActive
          ? '1px solid rgba(139,92,246,0.75)'
          : `1px solid rgba(139,92,246,${isDark ? '0.3' : '0.2'})`,
        borderRadius: '20px',
        px: 1.5,
        py: 0.6,
        minWidth: 0,
        color: isActive
          ? '#fff'
          : isDark ? 'rgba(167,139,250,1)' : 'rgba(109,40,217,1)',
        fontWeight: 700,
        fontSize: '0.72rem',
        letterSpacing: '0.3px',
        textTransform: 'none',
        lineHeight: 1,
        boxShadow: isActive
          ? '0 0 20px rgba(139,92,246,0.55), 0 0 40px rgba(59,130,246,0.25), 0 6px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.22)'
          : isDark
            ? '0 4px 12px rgba(139,92,246,0.18), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 4px 12px rgba(139,92,246,0.12), 0 2px 4px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateY(0px)',
        willChange: 'transform, box-shadow',
        '&:hover': {
          transform: 'translateY(-2px)',
          background: isActive
            ? 'linear-gradient(135deg, #7c3aed 0%, #2563eb 60%, #0891b2 100%)'
            : isDark
              ? 'rgba(139,92,246,0.22)'
              : 'rgba(139,92,246,0.13)',
          boxShadow: isActive
            ? '0 0 28px rgba(139,92,246,0.7), 0 0 56px rgba(59,130,246,0.35), 0 10px 22px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.25)'
            : isDark
              ? '0 6px 18px rgba(139,92,246,0.28), 0 4px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 6px 18px rgba(139,92,246,0.2), 0 4px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        },
        '&:active': {
          transform: 'translateY(0px)',
        },
        animation: isActive ? 'studyButtonPulse 2.5s ease-in-out infinite' : 'none',
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          transform: 'none',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <AutoAwesome sx={{ fontSize: 13, opacity: isActive ? 1 : 0.75 }} />
        <span>{isActive ? 'Studying' : 'Study'}</span>
      </Box>
    </Button>
  );
}
