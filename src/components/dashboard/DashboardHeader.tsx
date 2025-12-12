import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormGroup, FormControlLabel, Checkbox, 
  useTheme, Grid, Alert, IconButton, TextField, alpha
} from '@mui/material';
import { Edit, AutoAwesome, Check, Close } from '@mui/icons-material';
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
  const [selectedAbbrs, setSelectedAbbrs] = useState<string[]>([]);
  
  // Custom Name Logic
  const [customName, setCustomName] = useState("My Shortcuts");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    const storedSubjs = localStorage.getItem('customSemesterSubjects');
    const storedName = localStorage.getItem('customSemesterName');
    
    if (storedSubjs) setSelectedAbbrs(JSON.parse(storedSubjs));
    if (storedName) setCustomName(storedName);
  }, []);

  const handleSaveCustomSelection = () => {
    localStorage.setItem('customSemesterSubjects', JSON.stringify(selectedAbbrs));
    localStorage.setItem('semester', '-2');
    onUpdateFocus(-2, selectedAbbrs);
    setOpenCustomize(false);
  };

  const saveName = () => {
    if(tempName.trim()) {
      setCustomName(tempName);
      localStorage.setItem('customSemesterName', tempName);
    }
    setIsEditingName(false);
  };

  const startEditing = () => {
    setTempName(customName);
    setIsEditingName(true);
  }

  // Calculate Active Data
  const activeData = (() => {
    if (currentSemesterIndex === -2) {
      const allSubjectsFlat = allSemesters.flatMap(s => s.subjects);
      const mySubjects = allSubjectsFlat.filter(s => selectedAbbrs.includes(s.abbreviation));
      return { 
        index: -2, 
        // Use the custom name here!
        displayName: customName, 
        subjects: mySubjects 
      };
    }
    const found = allSemesters.find(s => s.index === currentSemesterIndex);
    return found ? { ...found, displayName: `Semester ${found.index}` } : null;
  })();

  return (
    <Box mb={6}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-end" mb={2}>
        <Box sx={{ width: '100%' }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Current Focus
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1}>
            {isEditingName ? (
              <Box display="flex" alignItems="center" gap={1}>
                <TextField 
                  variant="standard"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  autoFocus
                  sx={{ 
                    input: { fontSize: '2.125rem', fontWeight: 900 }
                  }}
                />
                <IconButton color="success" onClick={saveName}><Check /></IconButton>
                <IconButton color="error" onClick={() => setIsEditingName(false)}><Close /></IconButton>
              </Box>
            ) : (
              <>
                <Typography variant="h4" fontWeight={900} color="text.primary">
                  {activeData ? activeData.displayName : "Welcome!"}
                </Typography>
                {/* Only show edit pencil if it is the custom semester (-2) */}
                {currentSemesterIndex === -2 && (
                  <IconButton size="small" onClick={startEditing}>
                    <Edit fontSize="small" />
                  </IconButton>
                )}
              </>
            )}
          </Box>
        </Box>

        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AutoAwesome />} 
          onClick={() => setOpenCustomize(true)}
          size="small"
          sx={{ borderRadius: 3, whiteSpace: 'nowrap', boxShadow: 'none' }}
        >
          Customize
        </Button>
      </Box>

      {activeData ? (
        <SemesterCard 
          semesterIndex={activeData.index} 
          subjects={activeData.subjects} 
          isCurrent={true} 
          // Pass display name to card to render correctly
          customTitle={activeData.displayName}
        />
      ) : (
        <Alert severity="info">
          Please select a semester or customize your view.
        </Alert>
      )}

      {/* Dialog code remains the same as previous response... */}
      <Dialog open={openCustomize} onClose={() => setOpenCustomize(false)} maxWidth="md" fullWidth>
         {/* ... (Keep the dialog content from previous response) ... */}
         {/* Just ensure onClick={handleSaveCustomSelection} is on the Save button */}
         <DialogTitle>Customize Dashboard</DialogTitle>
         <DialogContent dividers>
            <Grid container spacing={2}>
            {allSemesters.map((sem) => (
              <Grid item xs={12} sm={6} key={sem.index}>
                <Typography variant="subtitle2" color="primary">Semester {sem.index}</Typography>
                <FormGroup>
                  {sem.subjects.map(subj => (
                    <FormControlLabel
                      key={subj.abbreviation}
                      control={
                        <Checkbox 
                          checked={selectedAbbrs.includes(subj.abbreviation)}
                          onChange={() => {
                             if (selectedAbbrs.includes(subj.abbreviation)) {
                                setSelectedAbbrs(prev => prev.filter(s => s !== subj.abbreviation));
                             } else {
                                setSelectedAbbrs(prev => [...prev, subj.abbreviation]);
                             }
                          }}
                        />
                      }
                      label={subj.abbreviation}
                    />
                  ))}
                </FormGroup>
              </Grid>
            ))}
            </Grid>
         </DialogContent>
         <DialogActions>
            <Button onClick={() => setOpenCustomize(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveCustomSelection}>Save</Button>
         </DialogActions>
      </Dialog>
    </Box>
  );
}