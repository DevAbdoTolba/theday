import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import {
  Code as CodeIcon,
  Close as CloseIcon,
  BugReport as BugIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useDevOptions, DevOptions } from '../context/DevOptionsContext';

// Human-readable labels for dev options
const optionLabels: Record<keyof DevOptions, { label: string; description: string }> = {
  stickySearchBar: {
    label: 'Sticky Search Bar',
    description: 'Docks into navbar on scroll',
  },
  progressiveLoading: {
    label: 'Progressive Loading',
    description: 'Background folder & file loading',
  },
};

export default function DevDashboard() {
  const { options, toggleOption, isDev } = useDevOptions();
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  if (!isDev) return null;

  return (
    <>
      {/* Modern floating button */}
      <Box
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 10000,
          width: 44,
          height: 44,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
          boxShadow: `0 4px 14px ${alpha(theme.palette.warning.main, 0.4)}`,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'rotate(180deg) scale(0.9)' : 'rotate(0deg) scale(1)',
          '&:hover': {
            transform: isOpen ? 'rotate(180deg) scale(1)' : 'rotate(0deg) scale(1.1)',
            boxShadow: `0 6px 20px ${alpha(theme.palette.warning.main, 0.5)}`,
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {isOpen ? (
          <CloseIcon sx={{ color: 'white', fontSize: 20 }} />
        ) : (
          <SettingsIcon sx={{ color: 'white', fontSize: 20 }} />
        )}
      </Box>

      {/* Panel with CSS animations (faster than MUI Collapse) */}
      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 74,
          right: 20,
          zIndex: 9999,
          width: 260,
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.background.paper, 0.92),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.15)}`,
          // Fast CSS animation
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, transparent 100%)`,
          }}
        >
          <BugIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
            Dev Options
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: 0.5,
              color: theme.palette.error.main,
              bgcolor: alpha(theme.palette.error.main, 0.1),
            }}
          >
            DEV
          </Box>
        </Box>

        {/* Options */}
        <Box sx={{ p: 1.5 }}>
          {(Object.keys(options) as Array<keyof DevOptions>).map((key, index) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1,
                mb: index < Object.keys(options).length - 1 ? 0.5 : 0,
                borderRadius: 2,
                transition: 'background 0.15s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.5),
                },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body2" 
                  fontWeight={600}
                  sx={{ 
                    color: options[key] ? theme.palette.warning.main : 'inherit',
                    transition: 'color 0.15s',
                  }}
                >
                  {optionLabels[key]?.label}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block',
                    lineHeight: 1.3,
                    opacity: 0.8,
                  }}
                >
                  {optionLabels[key]?.description}
                </Typography>
              </Box>
              <Switch
                checked={options[key]}
                onChange={() => toggleOption(key)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.warning.main,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.warning.main,
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            textAlign: 'center',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.5,
              fontSize: '0.65rem',
            }}
          >
            Saved to localStorage
          </Typography>
        </Box>
      </Paper>
    </>
  );
}
