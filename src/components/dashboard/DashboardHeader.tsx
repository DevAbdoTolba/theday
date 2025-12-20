import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormGroup, FormControlLabel, Checkbox, 
  useTheme, Grid, Alert, IconButton, TextField, Tooltip, 
  InputAdornment, Paper, Chip, Divider, alpha
} from '@mui/material';
import { 
  Tune, Check, Close, AutoAwesome, DashboardCustomize, Edit, 
  Search, FilterList, DeleteSweep
} from '@mui/icons-material';
import SemesterCard from './SemesterCard';

import { useRouter } from "next/router";


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
  
  // -- Main State --
  const [openCustomize, setOpenCustomize] = useState(false);
  const [selectedAbbrs, setSelectedAbbrs] = useState<string[]>([]);
  
  // -- Custom Name State --
  const [customName, setCustomName] = useState("Shortcuts");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // -- Search Filter State --
  const [searchQuery, setSearchQuery] = useState("");

  // Load initial data
  useEffect(() => {
    const storedSubjs = localStorage.getItem('customSemesterSubjects');
    const storedName = localStorage.getItem('customSemesterName');
    if (storedSubjs) setSelectedAbbrs(JSON.parse(storedSubjs));
    if (storedName) setCustomName(storedName);
  }, []);

  // -- Handlers --

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

  // Toggle Single Subject
  const handleToggleSubject = (abbr: string) => {
    if (selectedAbbrs.includes(abbr)) {
      setSelectedAbbrs(prev => prev.filter(s => s !== abbr));
    } else {
      setSelectedAbbrs(prev => [...prev, abbr]);
    }
  };

  // Toggle Entire Semester (Select All / Deselect All)
  const handleToggleSemester = (subjects: Subject[]) => {
    const subjectAbbrs = subjects.map(s => s.abbreviation);
    const allSelected = subjectAbbrs.every(abbr => selectedAbbrs.includes(abbr));

    if (allSelected) {
      // Deselect all from this semester
      setSelectedAbbrs(prev => prev.filter(abbr => !subjectAbbrs.includes(abbr)));
    } else {
      // Select all (merge unique)
      const newSelection = new Set([...selectedAbbrs, ...subjectAbbrs]);
      setSelectedAbbrs(Array.from(newSelection));
    }
  };

  // Clear All Selections
  const handleClearAll = () => {
    setSelectedAbbrs([]);
  };

  // -- Search Filtering Logic --
  const filteredSemesters = useMemo(() => {
    if (!searchQuery.trim()) return allSemesters;

    return allSemesters.map(sem => {
      const matchingSubjects = sem.subjects.filter(
        s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             s.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
      );
      // Return semester structure but only with matching subjects
      return { ...sem, subjects: matchingSubjects };
    }).filter(sem => sem.subjects.length > 0); // Remove empty semesters
  }, [allSemesters, searchQuery]);


  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Global navigation handler
  const handleNavigate = async (abbreviation: string) => {
    setIsNavigating(true);
    
    try {
      await router.push(`/subjects/${abbreviation}`);
      // Navigation successful - state will reset on unmount
    } catch (error) {
      console.error("Navigation failed:", error);
      setIsNavigating(false);
    }
  };


  // Determine active data for display
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
      {/* --- DASHBOARD HEADER TOOLBAR --- */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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

      {/* --- ACTIVE SEMESTER CARD --- */}
      {activeData ? (
        <SemesterCard 
          semesterIndex={activeData.index} 
          subjects={activeData.subjects} 
          isCurrent={true} 
          customTitle={activeData.displayName}
          isNavigating={isNavigating}
          onNavigate={handleNavigate}
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

      {/* --- CUSTOMIZATION DIALOG --- */}
      <Dialog 
        open={openCustomize} 
        onClose={() => setOpenCustomize(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 3, 
            height: '80vh', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: theme.palette.background.default
          } 
        }}
      >
        {/* Modal Header */}
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <DashboardCustomize color="primary" />
            <Typography variant="h6" fontWeight={700}>Build Your Dashboard</Typography>
          </Box>
          
          {/* Search Bar */}
          <TextField 
            fullWidth 
            placeholder="Search subjects..." 
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 3, bgcolor: theme.palette.background.paper }
            }}
          />
        </DialogTitle>

        {/* Modal Content */}
        <DialogContent sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#f8fafc' }}>
          <Box display="flex" flexDirection="column" gap={2}>
            {filteredSemesters.length === 0 ? (
              <Box py={4} textAlign="center" color="text.secondary">
                <Typography>{`No subjects found matching "${searchQuery}"`}</Typography>
              </Box>
            ) : (
              filteredSemesters.map((sem) => {
                // Tri-state Logic Calculations
                const semAbbrs = sem.subjects.map(s => s.abbreviation);
                const selectedCount = semAbbrs.filter(abbr => selectedAbbrs.includes(abbr)).length;
                const totalCount = semAbbrs.length;
                
                const isAllSelected = selectedCount === totalCount && totalCount > 0;
                const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

                return (
                  <Paper 
                    key={sem.index} 
                    elevation={0}
                    variant="outlined"
                    sx={{ 
                      borderRadius: 2, 
                      overflow: 'hidden',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper
                    }}
                  >
                    {/* Semester Header Row */}
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        borderBottom: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onChange={() => handleToggleSemester(sem.subjects)}
                            color="primary"
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight={700}>
                              Semester {sem.index}
                            </Typography>
                            <Chip 
                              label={`${selectedCount}/${totalCount}`} 
                              size="small" 
                              color={selectedCount > 0 ? "primary" : "default"}
                              variant={selectedCount > 0 ? "filled" : "outlined"}
                              sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                            />
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Box>

                    {/* Subjects Grid */}
                    <Box sx={{ p: 2 }}>
                      <Grid container spacing={1}>
                        {sem.subjects.map(subj => {
                          const isSelected = selectedAbbrs.includes(subj.abbreviation);
                          return (
                            <Grid item xs={12} sm={6} key={subj.abbreviation}>
                              <Box 
                                onClick={() => handleToggleSubject(subj.abbreviation)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  p: 1,
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  border: '1px solid',
                                  borderColor: isSelected ? 'primary.main' : 'transparent',
                                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                                  }
                                }}
                              >
                                <Checkbox 
                                  checked={isSelected}
                                  size="small"
                                  sx={{ p: 0.5, mr: 1 }}
                                />
                                <Box sx={{ overflow: 'hidden' }}>
                                  <Typography variant="body2" fontWeight={700} noWrap>
                                    {subj.abbreviation}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                                    {subj.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                          )
                        })}
                      </Grid>
                    </Box>
                  </Paper>
                );
              })
            )}
          </Box>
        </DialogContent>

        {/* Modal Footer */}
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleClearAll} 
            color="error" 
            startIcon={<DeleteSweep />}
            disabled={selectedAbbrs.length === 0}
          >
            Clear Selection
          </Button>
          <Box display="flex" gap={1}>
            <Button onClick={() => setOpenCustomize(false)} color="inherit">
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveCustom} 
              startIcon={<Check />}
              disabled={selectedAbbrs.length === 0}
            >
              Save Dashboard
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}