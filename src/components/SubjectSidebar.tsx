import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  Box, Typography, useTheme, Snackbar, Alert,
  alpha, Drawer, List, ListItemButton, ListItemText, IconButton, Collapse, Divider
} from '@mui/material';
import { 
  School, InfoOutlined, KeyboardDoubleArrowRight, Close, 
  ExpandLess, ExpandMore, Book 
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
  
  // Ref to the scroll container to manage auto-scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // --- 1. DATA PREPARATION (Memoized for Performance) ---
  const semesterData = useMemo(() => {
    if (transcript && 'semesters' in transcript) {
      return transcript.semesters;
    }
    return [];
  }, [transcript]);

  // --- 2. AUTO-OPEN LOGIC ---
  // Runs only when data loads or current subject changes
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

  // --- 3. AUTO-SCROLL TO ACTIVE ITEM ---
  // Runs when sidebar opens to ensure user sees their current location
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100); // Small delay to allow CSS transition to finish
    }
  }, [isOpen]);

  // --- 4. KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'b')) setIsOpen(p => !p);
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSemester = (index: number) => {
    setExpandedSemesters(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // --- RENDER HELPERS ---
  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        bgcolor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="h6" fontWeight="800" color="primary">
          Curriculum
        </Typography>
        <IconButton onClick={() => setIsOpen(false)} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Close />
        </IconButton>
        <IconButton onClick={onMobileClose} sx={{ display: { xs: 'flex', md: 'none' } }}>
          <Close />
        </IconButton>
      </Box>

      {/* NATIVE CSS SCROLL CONTAINER */}
      <Box 
        ref={scrollContainerRef}
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', // NATIVE SCROLLING
          overflowX: 'hidden',
          p: 1.5,
          // Custom Scrollbar Styling
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { 
            background: alpha(theme.palette.primary.main, 0.2), 
            borderRadius: '10px' 
          },
          '&::-webkit-scrollbar-thumb:hover': { 
            background: alpha(theme.palette.primary.main, 0.5) 
          }
        }}
      >
        <List disablePadding>
          {semesterData.map((sem: any) => {
            const isExpanded = expandedSemesters.has(sem.index);
            const hasActiveItem = sem.subjects.some((s:any) => s.abbreviation === currentSubject);

            return (
              <Box key={sem.index} sx={{ mb: 1 }}>
                {/* Semester Header */}
                <ListItemButton 
                  onClick={() => handleToggleSemester(sem.index)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: hasActiveItem ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    border: hasActiveItem ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : '1px solid transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  <Book sx={{ mr: 1.5, fontSize: 20, color: hasActiveItem ? 'primary.main' : 'text.secondary' }} />
                  <ListItemText 
                    primary={`Semester ${sem.index}`} 
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                {/* Subjects List */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <Box sx={{ 
                      ml: 2.5, 
                      pl: 2, 
                      borderLeft: `2px solid ${alpha(theme.palette.divider, 0.5)}` 
                    }}>
                      {sem.subjects.map((sub: any) => {
                        const isActive = sub.abbreviation === currentSubject;
                        return (
                          <Link 
                            key={sub.abbreviation} 
                            href={`/subjects/${sub.abbreviation}`} 
                            passHref 
                            style={{textDecoration:'none', color:'inherit'}}
                            onClick={onMobileClose}
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
                                  mr: 1.5, 
                                  fontSize: 16, 
                                  opacity: isActive ? 1 : 0.7,
                                  color: isActive ? 'inherit' : 'text.disabled'
                                }} />
                                <ListItemText 
                                  primary={sub.abbreviation}
                                  secondary={sub.name}
                                  primaryTypographyProps={{ 
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: '0.9rem'
                                  }}
                                  secondaryTypographyProps={{ 
                                    fontSize: '0.75rem',
                                    noWrap: true,
                                    color: isActive ? alpha('#fff', 0.8) : 'text.secondary'
                                  }}
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
      {/* 1. MOBILE DRAWER */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280 } }}
      >
        {SidebarContent}
      </Drawer>

      {/* 2. DESKTOP SIDEBAR & TRIGGER */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        
        {/* Invisible Hover Trigger */}
        <Box
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            left: 0,
            top: '25%', // Vertically centered hit area
            height: '50vh',
            width: '20px', // Narrow hit zone
            zIndex: 1250,
            display: isOpen ? 'none' : 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            // CSS Animation for the button appearance
            '&:hover .trigger-btn': {
              opacity: 1,
              transform: 'translateX(0)',
            }
          }}
        >
          {/* Pure CSS Animated Button (No JS Render Cycle) */}
          <Box
            className="trigger-btn"
            sx={{
              width: 40,
              height: 100,
              bgcolor: 'primary.main',
              borderRadius: '0 50px 50px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 4,
              opacity: 0, // Hidden by default
              transform: 'translateX(-100%)', // Off screen by default
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'pulse-glow 2s infinite',
              '@keyframes pulse-glow': {
                '0%': { filter: 'brightness(1)' },
                '50%': { filter: 'brightness(1.2)' },
                '100%': { filter: 'brightness(1)' }
              }
            }}
          >
            <KeyboardDoubleArrowRight />
          </Box>
        </Box>

        {/* Sidebar Container (Native CSS Transition) */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: 320,
            bgcolor: 'background.default',
            borderRight: `1px solid ${theme.palette.divider}`,
            zIndex: 1300,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isOpen ? 24 : 0,
            willChange: 'transform', // Optimizes rendering
          }}
        >
          {SidebarContent}
        </Box>

        {/* Backdrop for Desktop */}
        {isOpen && (
          <Box
            onClick={() => setIsOpen(false)}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: 1290,
              backdropFilter: 'blur(2px)',
              animation: 'fade-in 0.3s',
              '@keyframes fade-in': {
                from: { opacity: 0 },
                to: { opacity: 1 }
              }
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