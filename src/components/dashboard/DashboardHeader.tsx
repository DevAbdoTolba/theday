import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormGroup, FormControlLabel, Checkbox, 
  useTheme, Grid, Alert, IconButton, TextField, Tooltip
} from '@mui/material';
import { 
  Tune, Check, Close, AutoAwesome, DashboardCustomize, Edit
} from '@mui/icons-material';
import SemesterCard from './SemesterCard';

interface Subject { name: string; abbreviation: string; }

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
  const [customName, setCustomName] = useState("Shortcuts");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    const storedSubjs = localStorage.getItem('customSemesterSubjects');
    const storedName = localStorage.getItem('customSemesterName');
    if (storedSubjs) setSelectedAbbrs(JSON.parse(storedSubjs));
    if (storedName) setCustomName(storedName);
  }, []);

  const handleSaveCustom = () => {
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

  // Determine active data
  const activeData = (() => {
    if (currentSemesterIndex === -2) {
      const allSubjectsFlat = allSemesters.flatMap(s => s.subjects);
      const mySubjects = allSubjectsFlat.filter(s => selectedAbbrs.includes(s.abbreviation));
      return { index: -2, displayName: customName, subjects: mySubjects };
    }
    const found = allSemesters.find(s => s.index === currentSemesterIndex);
    return found ? { ...found, displayName: `Semester ${found.index}` } : null;
  })();

  return (
    <Box mb={4}>
      {/* Minimal Toolbar */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        
        {/* Title Area */}
        <Box display="flex" alignItems="center" gap={1}>
          {isEditingName ? (
            <Box display="flex" alignItems="center" gap={0.5}>
              <TextField 
                variant="standard"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                placeholder="Name..."
                InputProps={{ sx: { fontSize: '1.5rem', fontWeight: 800 } }}
              />
              <IconButton size="small" color="success" onClick={saveName}><Check /></IconButton>
              <IconButton size="small" color="error" onClick={() => setIsEditingName(false)}><Close /></IconButton>
            </Box>
          ) : (
            <>
              <Typography variant="h5" fontWeight={800} color="text.primary">
                {activeData ? activeData.displayName : "Dashboard"}
              </Typography>
              {currentSemesterIndex === -2 && (
                <Tooltip title="Rename">
                  <IconButton size="small" onClick={() => { setTempName(customName); setIsEditingName(true); }}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>

        {/* Action Area */}
        <Tooltip title="Customize Dashboard">
          <IconButton 
            onClick={() => setOpenCustomize(true)}
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              color: '#fff',
              '&:hover': { bgcolor: theme.palette.primary.dark },
              boxShadow: theme.shadows[2]
            }}
          >
            <Tune />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Focus Card */}
      {activeData ? (
        <SemesterCard 
          semesterIndex={activeData.index} 
          subjects={activeData.subjects} 
          isCurrent={true} 
          customTitle={activeData.displayName}
        />
      ) : (
        <Alert 
          severity="info" 
          icon={<AutoAwesome fontSize="inherit" />}
          action={
            <Button color="inherit" size="small" onClick={() => setOpenCustomize(true)}>
              Setup
            </Button>
          }
        >
          Select a semester to focus on.
        </Alert>
      )}

      {/* Simplified Dialog */}
      <Dialog 
        open={openCustomize} 
        onClose={() => setOpenCustomize(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardCustomize color="primary" />
          <span>Dashboard Content</span>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {allSemesters.map((sem) => (
              <Grid item xs={12} sm={6} key={sem.index}>
                <Typography variant="overline" fontWeight={800} color="text.secondary">
                  Semester {sem.index}
                </Typography>
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
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">{subj.abbreviation}</Typography>}
                    />
                  ))}
                </FormGroup>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCustomize(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSaveCustom} startIcon={<Check />}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}