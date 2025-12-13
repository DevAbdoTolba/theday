import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  Box, Typography, useTheme, Snackbar, Alert,
  alpha, Drawer, List, ListItemButton, ListItemText, IconButton, Collapse, TextField, InputAdornment
} from '@mui/material';
import { 
  School, InfoOutlined, KeyboardDoubleArrowRight, Close, 
  ExpandLess, ExpandMore, Book, Search 
} from '@mui/icons-material';
import Link from 'next/link';
import { DataContext } from '../context/TranscriptContext';

interface Props {
  currentSubject: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function SubjectSidebar({ currentSubject, mobileOpen, onMobileClose }: Props) {
  const theme = useTheme();
  const { transcript } = useContext(DataContext);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set());
  const [showHelper, setShowHelper] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Refs for scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // --- 1. DATA PREPARATION ---
  const semesterData = useMemo(() => {
    if (transcript && 'semesters' in transcript) {
      return transcript.semesters;
    }
    return [];
  }, [transcript]);

  // --- 2. KEYBOARD SHORTCUTS & AUTO-FOCUS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Sidebar: Shift + Left Arrow OR Shift + B
      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // Close: Escape
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus search when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to wait for animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // --- 3. AUTO-OPEN LOGIC ---
  useEffect(() => {
    if (semesterData.length > 0 && currentSubject) {
      const foundSemester = semesterData.find((sem: any) => 
        sem.subjects.some((s: any) => s.abbreviation === currentSubject)
      );
      if (foundSemester) {
        setExpandedSemesters(prev => new Set(prev).add(foundSemester.index));
      }
    }
  }, [semesterData, currentSubject]);

  // --- 4. AUTO-SCROLL TO ACTIVE ITEM ---
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isOpen]);

  const handleToggleSemester = (index: number) => {
    setExpandedSemesters(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // --- RENDER CONTENT ---
  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      
      {/* Header & Search Area */}
      <Box sx={{ 
        p: 2, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.default, 0.5)
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="800" color="primary">
            Curriculum
          </Typography>
          <IconButton onClick={() => { setIsOpen(false); onMobileClose(); }}>
            <Close />
          </IconButton>
        </Box>

        <TextField 
          fullWidth 
          size="small" 
          placeholder="Search subjects..." 
          value={searchQuery}
          inputRef={searchInputRef}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
            sx: { borderRadius: 2, bgcolor: theme.palette.action.hover }
          }}
        />
      </Box>

      {/* Scrollable List */}
      <Box 
        ref={scrollContainerRef}
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden',
          p: 1.5,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { 
            background: alpha(theme.palette.primary.main, 0.2), 
            borderRadius: '10px' 
          }
        }}
      >
        <List disablePadding>
          {semesterData.map((sem: any) => {
            // Filter Logic
            const filteredSubjects = sem.subjects.filter((sub: any) => 
              sub.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              sub.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // If searching, show only semesters with matches. If not searching, show all.
            if (searchQuery && filteredSubjects.length === 0) return null;

            // Always expand if searching, otherwise use toggle state
            const isExpanded = searchQuery ? true : expandedSemesters.has(sem.index);
            const hasActiveItem = sem.subjects.some((s:any) => s.abbreviation === currentSubject);

            return (
              <Box key={sem.index} sx={{ mb: 1 }}>
                <ListItemButton 
                  onClick={() => handleToggleSemester(sem.index)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: hasActiveItem ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    border: hasActiveItem ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : '1px solid transparent',
                  }}
                >
                  <Book sx={{ mr: 1.5, fontSize: 20, color: hasActiveItem ? 'primary.main' : 'text.secondary' }} />
                  <ListItemText 
                    primary={`Semester ${sem.index}`} 
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <Box sx={{ ml: 2.5, pl: 2, borderLeft: `2px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                      {(searchQuery ? filteredSubjects : sem.subjects).map((sub: any) => {
                        const isActive = sub.abbreviation === currentSubject;
                        return (
                          <Link 
                            key={sub.abbreviation} 
                            href={`/subjects/${sub.abbreviation}`} 
                            passHref 
                            style={{textDecoration:'none', color:'inherit'}}
                            onClick={() => { setIsOpen(false); onMobileClose(); }}
                          >
                            <Box ref={isActive ? activeItemRef : null}>
                              <ListItemButton
                                selected={isActive}
                                sx={{
                                  borderRadius: 2,
                                  py: 0.5,
                                  my: 0.5,
                                  '&.Mui-selected': {
                                    bgcolor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                    '&:hover': { bgcolor: theme.palette.primary.dark },
                                    '& .MuiSvgIcon-root': { color: theme.palette.primary.contrastText }
                                  }
                                }}
                              >
                                <School sx={{ 
                                  mr: 1.5, fontSize: 16, 
                                  opacity: isActive ? 1 : 0.7,
                                  color: isActive ? 'inherit' : 'text.disabled'
                                }} />
                                <ListItemText 
                                  primary={sub.abbreviation}
                                  secondary={sub.name}
                                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }}
                                  secondaryTypographyProps={{ fontSize: '0.75rem', noWrap: true, color: isActive ? alpha('#fff', 0.8) : 'text.secondary' }}
                                />
                              </ListItemButton>
                            </Box>
                          </Link>
                        );
                      })}
                    </Box>
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* 1. MOBILE DRAWER (Full Screen) */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ 
          display: { xs: 'block', md: 'none' }, 
          // Make drawer full width on mobile
          '& .MuiDrawer-paper': { width: '100%', maxWidth: '100%' } 
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* 2. DESKTOP SIDEBAR & TRIGGER */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        
        {/* Invisible Hover Trigger */}
        <Box
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed', left: 0, top: '25%', height: '50vh', width: '20px', zIndex: 1250,
            display: isOpen ? 'none' : 'flex', alignItems: 'center', cursor: 'pointer',
            '&:hover .trigger-btn': { opacity: 1, transform: 'translateX(0)' }
          }}
        >
          {/* Animated Button */}
          <Box
            className="trigger-btn"
            sx={{
              width: 40, height: 100, bgcolor: 'primary.main', borderRadius: '0 50px 50px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: 4,
              opacity: 0, transform: 'translateX(-100%)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'pulse-glow 2s infinite',
              '@keyframes pulse-glow': { '0%': { filter: 'brightness(1)' }, '50%': { filter: 'brightness(1.2)' }, '100%': { filter: 'brightness(1)' } }
            }}
          >
            <KeyboardDoubleArrowRight />
          </Box>
        </Box>

        {/* Sidebar Container */}
        <Box
          sx={{
            position: 'fixed', top: 0, left: 0, height: '100vh', width: 320,
            bgcolor: 'background.default', borderRight: `1px solid ${theme.palette.divider}`,
            zIndex: 1300, transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isOpen ? 24 : 0, willChange: 'transform',
          }}
        >
          {SidebarContent}
        </Box>

        {/* Backdrop for Desktop */}
        {isOpen && (
          <Box
            onClick={() => setIsOpen(false)}
            sx={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1290, backdropFilter: 'blur(2px)',
              animation: 'fade-in 0.3s', '@keyframes fade-in': { from: { opacity: 0 }, to: { opacity: 1 } }
            }}
          />
        )}
      </Box>

      {/* Helper Notification */}
      <Snackbar
        open={showHelper}
        autoHideDuration={3000}
        onClose={() => setShowHelper(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" icon={<InfoOutlined />}>
          Press <b>Shift + Left Arrow</b> to toggle menu.
        </Alert>
      </Snackbar>
    </>
  );
}