import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, IconButton, Tooltip, Typography, Slide } from '@mui/material';
import { CheckCircle, Cancel, BookmarkAdd, School } from '@mui/icons-material';

interface Props {
  subjectAbbr: string;
  semesterIndex: number; 
  onAddToCustom: (abbr: string) => void;
}

export default function SubjectSemesterPrompt({ subjectAbbr, semesterIndex, onAddToCustom }: Props) {
  const [step, setStep] = useState<'semester_check' | 'custom_add' | 'hidden'>('hidden');

  useEffect(() => {
    const currentSem = localStorage.getItem('semester');
    // Logic: If user is "New" (no semester set), ask them.
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

  return (
    <>
      {/* Step 1: Semester Check */}
      <Snackbar 
        open={step === 'semester_check'} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="info" 
          variant="filled"
          icon={<School fontSize="inherit" />}
          sx={{ 
            alignItems: 'center', 
            bgcolor: '#1e293b', 
            borderRadius: 5,
            py: 0, 
            px: 2
          }}
          action={
            <>
              <Tooltip title="Yes, I am in this semester">
                <IconButton color="inherit" size="small" onClick={handleYesSemester}>
                  <CheckCircle />
                </IconButton>
              </Tooltip>
              <Tooltip title="No, wrong semester">
                <IconButton color="inherit" size="small" onClick={handleNoSemester}>
                  <Cancel />
                </IconButton>
              </Tooltip>
            </>
          }
        >
          <Typography variant="body2" fontWeight={700} sx={{ mr: 1 }}>
            Semester {semesterIndex}?
          </Typography>
        </Alert>
      </Snackbar>

      {/* Step 2: Custom Add */}
      <Snackbar 
        open={step === 'custom_add'} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="success" 
          variant="filled"
          icon={<BookmarkAdd fontSize="inherit" />}
          sx={{ 
            alignItems: 'center', 
            bgcolor: '#059669', 
            borderRadius: 5,
            py: 0,
            px: 2
          }}
          action={
            <>
              <Tooltip title={`Add ${subjectAbbr} to Shortcuts`}>
                <IconButton color="inherit" size="small" onClick={handleAddToCustom}>
                  <CheckCircle />
                </IconButton>
              </Tooltip>
              <Tooltip title="Dismiss">
                <IconButton color="inherit" size="small" onClick={() => setStep('hidden')}>
                  <Cancel />
                </IconButton>
              </Tooltip>
            </>
          }
        >
          <Typography variant="body2" fontWeight={700} sx={{ mr: 1 }}>
            Add {subjectAbbr}?
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}