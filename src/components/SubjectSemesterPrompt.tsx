import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Slide, useTheme, alpha, IconButton } from '@mui/material';
import { Close, Add, School } from '@mui/icons-material';

interface Props {
  subjectAbbr: string;
  semesterIndex: number; 
  onAddToCustom: (abbr: string) => void;
}

export default function SubjectSemesterPrompt({ subjectAbbr, semesterIndex, onAddToCustom }: Props) {
  const [step, setStep] = useState<'semester_check' | 'custom_add' | 'hidden'>('hidden');
  const theme = useTheme();

  useEffect(() => {
    const currentSem = localStorage.getItem('semester');
    // If user is "New" (no semester set) or special semester is active
    if (!currentSem || currentSem === '-1') {
      const timer = setTimeout(() => setStep('semester_check'), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleYesSemester = () => {
    localStorage.setItem('semester', semesterIndex.toString());
    setStep('hidden');
  };

  const handleNoSemester = () => setStep('custom_add');

  const handleAddToCustom = () => {
    onAddToCustom(subjectAbbr);
    setStep('hidden');
  };

  // Ultra-slim pill design using THEME colors
  const SlimToast = ({ children }: { children: React.ReactNode }) => (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
      <Paper
        elevation={4}
        sx={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)', // Perfectly centered
          zIndex: 2000,
          borderRadius: 50, // Pill shape
          px: 2.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          // Adaptive Background (Glassmorphism)
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          color: theme.palette.text.primary,
          whiteSpace: 'nowrap',
          maxWidth: '90vw',
          // Adaptive Border
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[6]
        }}
      >
        {children}
      </Paper>
    </Slide>
  );

  const ActionBtn = ({ label, onClick, variant = 'text' }: any) => (
    <Button
      size="small"
      onClick={onClick}
      variant={variant === 'filled' ? 'contained' : 'text'}
      sx={{
        minWidth: 0,
        px: 1.5,
        py: 0.5,
        borderRadius: 4,
        fontSize: '0.85rem',
        fontWeight: 700,
        textTransform: 'none',
        // Text Button Styles
        ...(variant === 'text' && {
          color: theme.palette.text.secondary,
          '&:hover': {
             color: theme.palette.text.primary,
             bgcolor: alpha(theme.palette.text.primary, 0.05)
          }
        }),
        // Filled Button Styles
        ...(variant === 'filled' && {
          boxShadow: 'none',
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
             bgcolor: theme.palette.primary.dark,
             boxShadow: 'none'
          }
        })
      }}
    >
      {label}
    </Button>
  );

  if (step === 'semester_check') {
    return (
      <SlimToast>
        <Box display="flex" alignItems="center" gap={1.5}>
          <School fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={600}>
            In <b>Semester {semesterIndex}</b>?
          </Typography>
        </Box>
        <Box display="flex" gap={0.5}>
          <ActionBtn label="No" onClick={handleNoSemester} />
          <ActionBtn label="Yes" onClick={handleYesSemester} variant="filled" />
        </Box>
      </SlimToast>
    );
  }

  if (step === 'custom_add') {
    return (
      <SlimToast>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Add fontSize="small" color="primary" />
          <Typography variant="body2" fontWeight={600}>
            Add <b>{subjectAbbr}</b> to shortcuts?
          </Typography>
        </Box>
        <Box display="flex" gap={0.5}>
          <IconButton 
            size="small" 
            onClick={() => setStep('hidden')}
            sx={{ color: theme.palette.text.secondary, p: 0.5 }}
          >
            <Close fontSize="small" />
          </IconButton>
          <ActionBtn label="Add" onClick={handleAddToCustom} variant="filled" />
        </Box>
      </SlimToast>
    );
  }

  return null;
}