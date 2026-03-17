import React from 'react';
import { Box, Switch, Typography, useTheme } from '@mui/material';
import { useStudySession } from '../../context/StudySessionContext';

export default function StudyModeToggle() {
  const { isActive, toggleMode } = useStudySession();
  const theme = useTheme();

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{
          color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
          transition: 'color 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        Study
      </Typography>
      <Switch
        checked={isActive}
        onChange={toggleMode}
        size="small"
        color="primary"
        inputProps={{ 'aria-label': 'Toggle Study Mode' }}
      />
    </Box>
  );
}
