import React from 'react';
import dynamic from 'next/dynamic';
import { Box, ButtonBase, alpha, useTheme } from '@mui/material';
import { useStudySession } from '../../context/StudySessionContext';
import { trackStudyToggle } from '../../utils/clarity';

const AutoAwesome = dynamic(() => import('@mui/icons-material/AutoAwesome'), { ssr: false });

export default function StudyModeToggle() {
  const { isActive, itemCount, toggleMode } = useStudySession();
  const theme = useTheme();
  const accent = theme.palette.primary.main;

  const handleToggle = () => {
    trackStudyToggle(!isActive);
    toggleMode();
  };

  return (
    <ButtonBase
      onClick={handleToggle}
      aria-pressed={isActive}
      aria-label={`AI Study Mode ${isActive ? 'on' : 'off'}. ${itemCount} selected.`}
      data-study-toggle="true"
      sx={{
        position: 'relative',
        width: 40,
        height: 40,
        flexShrink: 0,
        border: `1px solid ${isActive ? alpha(accent, 0.46) : theme.palette.divider}`,
        borderRadius: 2,
        bgcolor: isActive ? alpha(accent, theme.palette.mode === 'dark' ? 0.15 : 0.08) : 'transparent',
        boxShadow: isActive ? `inset 0 0 0 1px ${alpha(accent, 0.07)}` : 'none',
        transition: 'background-color 160ms ease-out, border-color 160ms ease-out, transform 100ms ease-out',
        '&:hover': {
          bgcolor: isActive
            ? alpha(accent, theme.palette.mode === 'dark' ? 0.2 : 0.12)
            : alpha(theme.palette.text.primary, 0.045),
          borderColor: isActive ? alpha(accent, 0.56) : alpha(theme.palette.text.primary, 0.2),
        },
        '&:active': { transform: 'scale(0.94)' },
        '&.Mui-focusVisible': {
          outline: `2px solid ${alpha(accent, 0.72)}`,
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:active': { transform: 'none' },
        },
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          borderRadius: 1.6,
          background: 'linear-gradient(145deg, #a855f7 0%, #6366f1 52%, #0ea5e9 100%)',
          boxShadow: isActive
            ? `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${alpha(accent, 0.26)}`
            : 'inset 0 1px 0 rgba(255,255,255,0.28)',
          transition: 'box-shadow 160ms ease-out, transform 160ms ease-out',
        }}
      >
        <AutoAwesome sx={{ fontSize: 17 }} />
      </Box>

      {itemCount > 0 && (
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: -5,
            right: -5,
            minWidth: 19,
            height: 19,
            px: 0.45,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            bgcolor: theme.palette.primary.main,
            border: `2px solid ${theme.palette.background.paper}`,
            borderRadius: '999px',
            fontSize: '0.62rem',
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {itemCount}
        </Box>
      )}

      <Box
        component="span"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        AI Study
      </Box>
    </ButtonBase>
  );
}
