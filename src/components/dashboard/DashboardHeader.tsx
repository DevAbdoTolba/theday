import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField, Tooltip, InputAdornment, Paper, Chip, alpha, Grid, 
  Checkbox, FormControlLabel, Collapse
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Tune, Check, Close, AutoAwesome, Edit, Search, Add,
  KeyboardArrowDown, KeyboardArrowUp, DeleteSweep
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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
  const isDark = theme.palette.mode === 'dark';
  
  // -- Main State --
  const [openCustomize, setOpenCustomize] = useState(false);
  const [selectedAbbrs, setSelectedAbbrs] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);
  
  // -- Custom Name State --
  const [customName, setCustomName] = useState("My Shortcuts");
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

  const handleToggleSubject = (abbr: string) => {
    if (selectedAbbrs.includes(abbr)) {
      setSelectedAbbrs(prev => prev.filter(s => s !== abbr));
    } else {
      setSelectedAbbrs(prev => [...prev, abbr]);
    }
  };

  const handleToggleSemester = (subjects: Subject[]) => {
    const subjectAbbrs = subjects.map(s => s.abbreviation);
    const allSelected = subjectAbbrs.every(abbr => selectedAbbrs.includes(abbr));

    if (allSelected) {
      setSelectedAbbrs(prev => prev.filter(abbr => !subjectAbbrs.includes(abbr)));
    } else {
      const newSelection = new Set([...selectedAbbrs, ...subjectAbbrs]);
      setSelectedAbbrs(Array.from(newSelection));
    }
  };

  const handleClearAll = () => {
    setSelectedAbbrs([]);
  };

  // -- Search Filtering --
  const filteredSemesters = useMemo(() => {
    if (!searchQuery.trim()) return allSemesters;
    return allSemesters.map(sem => {
      const matchingSubjects = sem.subjects.filter(
        s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             s.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...sem, subjects: matchingSubjects };
    }).filter(sem => sem.subjects.length > 0);
  }, [allSemesters, searchQuery]);

  // Get active shortcuts data
  const activeSubjects = useMemo(() => {
    if (currentSemesterIndex === -2) {
      const allSubjectsFlat = allSemesters.flatMap(s => s.subjects);
      return allSubjectsFlat.filter(s => selectedAbbrs.includes(s.abbreviation));
    }
    const found = allSemesters.find(s => s.index === currentSemesterIndex);
    return found?.subjects || [];
  }, [allSemesters, currentSemesterIndex, selectedAbbrs]);

  // Dynamic display name
  const displayName = currentSemesterIndex === -2 ? customName : `Semester ${currentSemesterIndex}`;
  const hasShortcuts = activeSubjects.length > 0;

  return (
    <Box mb={4}>
      {/* --- SHORTCUTS CARD --- */}
      {!hasShortcuts ? (
        /* Empty State - Dashed Border Card */
        <Box
          sx={{
            borderRadius: 3,
            border: `2px dashed ${alpha(theme.palette.text.secondary, 0.3)}`,
            bgcolor: isDark ? alpha('#0f172a', 0.6) : alpha(theme.palette.background.paper, 0.8),
            py: 5,
            px: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <AutoAwesome 
            sx={{ 
              fontSize: 48, 
              color: alpha(theme.palette.primary.main, 0.6),
              mb: 2,
            }} 
          />
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
            Create Your Shortcuts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Pin your favorite subjects for quick access
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenCustomize(true)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: alpha(theme.palette.primary.main, 0.5),
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            Add Shortcuts
          </Button>
        </Box>
      ) : (
        /* Filled State - With Shortcuts */
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            bgcolor: isDark ? alpha('#0f172a', 0.6) : theme.palette.background.paper,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: expanded ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 'none',
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <AutoAwesome sx={{ fontSize: 24, color: theme.palette.primary.main }} />
              
              {isEditingName ? (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <TextField 
                    variant="standard"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    autoFocus
                    placeholder="Name..."
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    InputProps={{ sx: { fontSize: '1.1rem', fontWeight: 700 } }}
                  />
                  <IconButton size="small" color="success" onClick={saveName}><Check /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setIsEditingName(false)}><Close /></IconButton>
                </Box>
              ) : (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                    {displayName}
                  </Typography>
                  {currentSemesterIndex === -2 && (
                    <Tooltip title="Rename">
                      <IconButton 
                        size="small" 
                        onClick={() => { setTempName(customName); setIsEditingName(true); }}
                        sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                      >
                        <Edit sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={0.5}>
              <Tooltip title="Edit shortcuts">
                <IconButton 
                  onClick={() => setOpenCustomize(true)}
                  size="small"
                  sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.primary.main } }}
                >
                  <Tune fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton 
                onClick={() => setExpanded(!expanded)} 
                size="small"
                sx={{ color: theme.palette.text.secondary }}
              >
                {expanded ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
              </IconButton>
            </Box>
          </Box>

          {/* Subjects Grid */}
          <Collapse in={expanded}>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={1.5}>
                <AnimatePresence mode="popLayout">
                  {activeSubjects.map((subj, index) => (
                    <Grid item xs={6} sm={4} md={3} key={subj.abbreviation}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <Link
                          href={`/subjects/${subj.abbreviation}`}
                          style={{ textDecoration: 'none', display: 'block' }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: isDark ? alpha('#1e293b', 0.8) : alpha(theme.palette.grey[100], 0.8),
                              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: isDark ? alpha('#334155', 0.8) : alpha(theme.palette.grey[200], 0.8),
                                transform: 'translateY(-1px)',
                              },
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={700} color={isDark ? 'primary.light' : 'primary.main'}>
                              {subj.abbreviation}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                overflow: 'hidden',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 1,
                                lineHeight: 1.4,
                              }}
                            >
                              {subj.name}
                            </Typography>
                          </Box>
                        </Link>
                      </motion.div>
                    </Grid>
                  ))}
                </AnimatePresence>
              </Grid>
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* --- CUSTOMIZATION DIALOG (Smaller) --- */}
      <Dialog 
        open={openCustomize} 
        onClose={() => setOpenCustomize(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 3, 
            maxHeight: '70vh',
            bgcolor: isDark ? '#0f172a' : theme.palette.background.default,
          } 
        }}
      >
        <DialogTitle sx={{ pb: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <AutoAwesome sx={{ color: theme.palette.primary.main }} />
              <Typography variant="h6" fontWeight={700}>Edit Shortcuts</Typography>
            </Box>
            <IconButton onClick={() => setOpenCustomize(false)} size="small">
              <Close />
            </IconButton>
          </Box>
          
          {/* Search Bar */}
          <TextField 
            fullWidth 
            placeholder="Search subjects..." 
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mt: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              sx: { 
                borderRadius: 2, 
                bgcolor: isDark ? alpha('#1e293b', 0.6) : theme.palette.background.paper 
              }
            }}
          />
        </DialogTitle>

        <DialogContent sx={{ p: 2, bgcolor: isDark ? alpha('#0f172a', 0.4) : alpha(theme.palette.grey[50], 0.5) }}>
          {filteredSemesters.length === 0 ? (
            <Box py={3} textAlign="center" color="text.secondary">
              <Typography variant="body2">{`No subjects found matching "${searchQuery}"`}</Typography>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" gap={1.5}>
              {filteredSemesters.map((sem) => {
                const semAbbrs = sem.subjects.map(s => s.abbreviation);
                const selectedCount = semAbbrs.filter(abbr => selectedAbbrs.includes(abbr)).length;
                const totalCount = semAbbrs.length;
                const isAllSelected = selectedCount === totalCount && totalCount > 0;
                const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

                return (
                  <Paper 
                    key={sem.index} 
                    elevation={0}
                    sx={{ 
                      borderRadius: 2, 
                      overflow: 'hidden', 
                      bgcolor: isDark ? alpha('#1e293b', 0.5) : theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                  >
                    {/* Semester Header */}
                    <Box 
                      sx={{ 
                        px: 1.5, 
                        py: 1,
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.04),
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={isAllSelected}
                            indeterminate={isIndeterminate}
                            onChange={() => handleToggleSemester(sem.subjects)}
                            color="primary"
                            size="small"
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight={700}>
                              Semester {sem.index}
                            </Typography>
                            <Chip 
                              label={`${selectedCount}/${totalCount}`} 
                              size="small" 
                              color={selectedCount > 0 ? "primary" : "default"}
                              variant={selectedCount > 0 ? "filled" : "outlined"}
                              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                            />
                          </Box>
                        }
                        sx={{ m: 0 }}
                      />
                    </Box>

                    {/* Subjects */}
                    <Box sx={{ p: 1 }}>
                      <Grid container spacing={0.5}>
                        {sem.subjects.map(subj => {
                          const isSelected = selectedAbbrs.includes(subj.abbreviation);
                          return (
                            <Grid item xs={6} key={subj.abbreviation}>
                              <Box 
                                onClick={() => handleToggleSubject(subj.abbreviation)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  p: 0.75,
                                  borderRadius: 1.5,
                                  cursor: 'pointer',
                                  border: '1px solid',
                                  borderColor: isSelected ? 'primary.main' : 'transparent',
                                  bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                  transition: 'all 0.15s',
                                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                                }}
                              >
                                <Checkbox checked={isSelected} size="small" sx={{ p: 0.25, mr: 0.5 }} />
                                <Box sx={{ overflow: 'hidden', minWidth: 0 }}>
                                  <Typography variant="caption" fontWeight={700} noWrap display="block">
                                    {subj.abbreviation}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
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
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleClearAll} 
            color="error" 
            size="small"
            startIcon={<DeleteSweep fontSize="small" />}
            disabled={selectedAbbrs.length === 0}
          >
            Clear
          </Button>
          <Box display="flex" gap={1}>
            <Button onClick={() => setOpenCustomize(false)} color="inherit" size="small">
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleSaveCustom} 
              size="small"
              startIcon={<Check fontSize="small" />}
              sx={{ borderRadius: 2, px: 2 }}
            >
              Save
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}