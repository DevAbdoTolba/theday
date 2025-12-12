import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Button, Slide } from '@mui/material';
import { Check, Close, Add } from '@mui/icons-material';

interface Props {
  subjectAbbr: string;
  semesterIndex: number; // The semester this subject belongs to
  onAddToCustom: (abbr: string) => void; // Logic to add to custom list
}

export default function SubjectSemesterPrompt({ subjectAbbr, semesterIndex, onAddToCustom }: Props) {
  const [step, setStep] = useState<'semester_check' | 'custom_add' | 'hidden'>('hidden');

  useEffect(() => {
    // 1. Check if user already has a semester set
    const currentSem = localStorage.getItem('semester');
    const customSubjects = JSON.parse(localStorage.getItem('customSemesterSubjects') || '[]');

    // If no semester is set, start the flow
    if (!currentSem || currentSem === '-1') {
      const timer = setTimeout(() => setStep('semester_check'), 2000); // Wait 2s before asking
      return () => clearTimeout(timer);
    } 
    
    // If they have a semester set, but viewing a subject NOT in their semester/custom list
    // You could optionally ask to add to custom here, but let's keep it simple for now.
  }, []);

  const handleYesSemester = () => {
    localStorage.setItem('semester', semesterIndex.toString());
    setStep('hidden');
    // Optional: Trigger a global refresh or toast
  };

  const handleNoSemester = () => {
    // They aren't in this semester, ask if they want to add just this subject
    setStep('custom_add');
  };

  const handleAddToCustom = () => {
    onAddToCustom(subjectAbbr);
    setStep('hidden');
  };

  return (
    <>
      {/* Step 1: Are you in Semester X? */}
      <Snackbar 
        open={step === 'semester_check'} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="info" 
          variant="filled"
          icon={false}
          sx={{ width: '100%', alignItems: 'center', bgcolor: '#1e293b' }}
          action={
            <>
              <Button color="inherit" size="small" onClick={handleYesSemester} startIcon={<Check />}>
                Yes
              </Button>
              <Button color="inherit" size="small" onClick={handleNoSemester} startIcon={<Close />}>
                No
              </Button>
            </>
          }
        >
          Are you currently in <strong>Semester {semesterIndex}</strong>?
        </Alert>
      </Snackbar>

      {/* Step 2: Add to Custom? */}
      <Snackbar 
        open={step === 'custom_add'} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ width: '100%', alignItems: 'center', bgcolor: '#059669' }} // Green for add
          action={
            <>
              <Button color="inherit" size="small" onClick={handleAddToCustom} startIcon={<Add />}>
                Add to Shortcuts
              </Button>
              <Button color="inherit" size="small" onClick={() => setStep('hidden')}>
                Dismiss
              </Button>
            </>
          }
        >
          Do you want to add <strong>{subjectAbbr}</strong> to your dashboard shortcuts?
        </Alert>
      </Snackbar>
    </>
  );
}