import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormGroup, FormControlLabel, Checkbox, 
  useTheme, Grid, Alert
} from '@mui/material';
import { Edit, AutoAwesome } from '@mui/icons-material';
import SemesterCard from './SemesterCard';

interface Subject {
  name: string;
  abbreviation: string;
}

interface Props {
  allSemesters: { index: number; subjects: Subject[] }[];
  currentSemesterIndex: number;
  onUpdateFocus: (index: number, customSubjects?: string[]) => void;
}

export default function DashboardHeader({ allSemesters, currentSemesterIndex, onUpdateFocus }: Props) {
  const theme = useTheme();
  const [openCustomize, setOpenCustomize] = useState(false);
  
  // Customization State
  const [selectedAbbrs, setSelectedAbbrs] = useState<string[]>([]);
  
  // Initialize custom subjects from local storage or defaults
  useEffect(() => {
    const stored = localStorage.getItem('customSemesterSubjects');
    if (stored) {
      setSelectedAbbrs(JSON.parse(stored));
    }
  }, []);

  const handleSaveCustom = () => {
    localStorage.setItem('customSemesterSubjects', JSON.stringify(selectedAbbrs));
    localStorage.setItem('semester', '-2'); // -2 denotes custom mode
    onUpdateFocus(-2, selectedAbbrs);
    setOpenCustomize(false);
  };

  const handleToggleSubject = (abbr: string) => {
    if (selectedAbbrs.includes(abbr)) {
      setSelectedAbbrs(prev => prev.filter(s => s !== abbr));
    } else {
      setSelectedAbbrs(prev => [...prev, abbr]);
    }
  };

  // Determine what to display as "Current Focus"
  const activeData = (() => {
    if (currentSemesterIndex === -2) {
      // Custom mode: find subjects across all semesters
      const allSubjectsFlat = allSemesters.flatMap(s => s.subjects);
      const mySubjects = allSubjectsFlat.filter(s => selectedAbbrs.includes(s.abbreviation));
      return { index: -2, subjects: mySubjects };
    }
    
    // Normal Semester mode
    const found = allSemesters.find(s => s.index === currentSemesterIndex);
    return found || null;
  })();

  return (
    <Box mb={6}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={900} gutterBottom>
            Welcome Back! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here is your main focus for today.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<Edit />} 
          onClick={() => setOpenCustomize(true)}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Customize View
        </Button>
      </Box>

      {activeData ? (
        <SemesterCard 
          semesterIndex={activeData.index} 
          subjects={activeData.subjects} 
          isCurrent={true} 
        />
      ) : (
        <Alert severity="info" action={
          <Button color="inherit" size="small" onClick={() => setOpenCustomize(true)}>
            Set Focus
          </Button>
        }>
          You haven&#39;t selected a primary semester yet.
        </Alert>
      )}

      {/* Customization Dialog */}
      <Dialog 
        open={openCustomize} 
        onClose={() => setOpenCustomize(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome color="primary" />
          Customize Your Dashboard
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Select the subjects you are currently taking from any semester. These will appear at the top of your dashboard.
          </Typography>
          
          <Grid container spacing={4}>
            {allSemesters.map((sem) => (
              <Grid item xs={12} sm={6} key={sem.index}>
                <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1}>
                  Semester {sem.index}
                </Typography>
                <FormGroup>
                  {sem.subjects.map(subj => (
                    <FormControlLabel
                      key={subj.abbreviation}
                      control={
                        <Checkbox 
                          checked={selectedAbbrs.includes(subj.abbreviation)}
                          onChange={() => handleToggleSubject(subj.abbreviation)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          <b>{subj.abbreviation}</b> - {subj.name}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenCustomize(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCustom}>Save Dashboard</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}