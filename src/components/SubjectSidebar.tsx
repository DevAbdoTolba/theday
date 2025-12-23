import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Box, Typography, useTheme, Snackbar, Alert,
  alpha, Drawer, List, ListItemButton, ListItemText, IconButton, Collapse, CircularProgress
} from '@mui/material';
import Link from 'next/link';
import { DataContext } from '../context/TranscriptContext';

// Dynamic imports for MUI icons
const School = dynamic(() => import('@mui/icons-material/School'), { ssr: false });
const InfoOutlined = dynamic(() => import('@mui/icons-material/InfoOutlined'), { ssr: false });
const KeyboardArrowRight = dynamic(() => import('@mui/icons-material/KeyboardArrowRight'), { ssr: false });
const Close = dynamic(() => import('@mui/icons-material/Close'), { ssr: false });
const ExpandLess = dynamic(() => import('@mui/icons-material/ExpandLess'), { ssr: false });
const ExpandMore = dynamic(() => import('@mui/icons-material/ExpandMore'), { ssr: false });
const Book = dynamic(() => import('@mui/icons-material/Book'), { ssr: false });
const SentimentDissatisfied = dynamic(() => import('@mui/icons-material/SentimentDissatisfied'), { ssr: false });

interface Props {
  currentSubject: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function SubjectSidebar({ currentSubject, mobileOpen, onMobileClose }: Props) {
  const theme = useTheme();
  const { transcript, loadingTranscript } = useContext(DataContext);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set());
  const [showHelper, setShowHelper] = useState(false);
  
  // Proximity Button State
  const [btnTransform, setBtnTransform] = useState(0); 

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // --- ROBUST DATA PREPARATION ---
  const semesterData = useMemo(() => {
    if (!transcript) return [];
    
    // Check various structures the transcript might arrive in
    if ('semesters' in transcript && Array.isArray(transcript.semesters)) {
        return transcript.semesters;
    }
    // Fallback if transcript itself is the array
    if (Array.isArray(transcript)) {
        return transcript;
    }
    // Fallback if nested inside 'transcript' key
    // @ts-ignore
    if (transcript.transcript && Array.isArray(transcript.transcript.data)) {
        // @ts-ignore
        return transcript.transcript.data;
    }

    return [];
  }, [transcript]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.code === 'ArrowLeft' || e.code === 'KeyB')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.code === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto Open Active Semester
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

  // Scroll to active
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isOpen]);

  // Mouse Proximity (NARROWER & SMOOTHER)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isOpen) return;
      const threshold = 100; // Only react when mouse is within 100px of left edge
      if (e.clientX < threshold) {
        let shift = -100 + (100 * (1 - (e.clientX / threshold)));
        if (shift > 0) shift = 0;
        if (shift < -100) shift = -100;
        setBtnTransform(shift);
      } else {
        setBtnTransform(-100);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  const handleToggleSemester = (index: number) => {
    setExpandedSemesters(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const SidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ 
        p: 2, borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.default, 0.5),
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Typography variant="h6" fontWeight="800" color="primary">Curriculum</Typography>
        <IconButton onClick={() => { setIsOpen(false); onMobileClose(); }}><Close /></IconButton>
      </Box>
      <Box 
        ref={scrollContainerRef}
        sx={{ 
          flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', p: 1.5,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { background: alpha(theme.palette.primary.main, 0.2), borderRadius: '10px' }
        }}
      >
        {loadingTranscript && semesterData.length === 0 ? (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress size={30} />
            </Box>
        ) : semesterData.length === 0 ? (
            <Box display="flex" flexDirection="column" alignItems="center" mt={4} color="text.secondary">
                <SentimentDissatisfied sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2">No curriculum found.</Typography>
            </Box>
        ) : (
            <List disablePadding>
            {semesterData.map((sem: any) => {
                const isExpanded = expandedSemesters.has(sem.index);
                const hasActiveItem = sem.subjects.some((s:any) => s.abbreviation === currentSubject);
                return (
                <Box key={sem.index} sx={{ mb: 1 }}>
                    <ListItemButton 
                    onClick={() => handleToggleSemester(sem.index)}
                    sx={{
                        borderRadius: 2, mb: 0.5,
                        bgcolor: hasActiveItem ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                        border: hasActiveItem ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : '1px solid transparent',
                    }}
                    >
                    <Book sx={{ mr: 1.5, fontSize: 20, color: hasActiveItem ? 'primary.main' : 'text.secondary' }} />
                    <ListItemText primary={`Semester ${sem.index}`} primaryTypographyProps={{ fontWeight: 700 }} />
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <Box sx={{ ml: 2.5, pl: 2, borderLeft: `2px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                        {sem.subjects.map((sub: any) => {
                            const isActive = sub.abbreviation === currentSubject;
                            return (
                            <Link 
                                key={sub.abbreviation} href={`/subjects/${sub.abbreviation}`} passHref 
                                style={{textDecoration:'none', color:'inherit'}}
                                onClick={() => { setIsOpen(false); onMobileClose(); }}
                            >
                                <Box ref={isActive ? activeItemRef : null}>
                                <ListItemButton
                                    selected={isActive}
                                    sx={{
                                    borderRadius: 2, py: 0.5, my: 0.5,
                                    '&.Mui-selected': {
                                        bgcolor: theme.palette.primary.main,
                                        color: theme.palette.primary.contrastText,
                                        '&:hover': { bgcolor: theme.palette.primary.dark },
                                        '& .MuiSvgIcon-root': { color: theme.palette.primary.contrastText }
                                    }
                                    }}
                                >
                                    <School sx={{ mr: 1.5, fontSize: 16, opacity: isActive ? 1 : 0.7, color: isActive ? 'inherit' : 'text.disabled' }} />
                                    <ListItemText 
                                    primary={sub.abbreviation} secondary={sub.name}
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
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary" anchor="left" open={mobileOpen} onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: '85%', maxWidth: '320px' } }}
      >
        {SidebarContent}
      </Drawer>

      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        {/* Floating Trigger Button - FIXED WIDTH & CENTER */}
        <Box
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed', 
            left: 0, 
            top: '50%', // Perfectly centered vertically
            marginTop: '-40px', // Offset by half height
            height: 80, 
            width: 24, // Narrower button
            zIndex: 1250,
            display: isOpen ? 'none' : 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            bgcolor: 'primary.main',
            borderRadius: '0 12px 12px 0',
            color: '#fff',
            boxShadow: 3,
            transform: `translateX(${btnTransform}%)`,
            transition: 'transform 0.1s linear', 
            '&:hover': { transform: 'translateX(0%) !important' } 
          }}
        >
          <KeyboardArrowRight fontSize="small" />
        </Box>

        {/* Trigger Zone (Invisible) - Narrowed */}
        <Box 
           sx={{ 
             position: 'fixed', left: 0, top: 0, bottom: 0, width: '15px', zIndex: 1240, 
             display: isOpen ? 'none' : 'block' 
           }} 
        />

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

      <Snackbar
        open={showHelper} autoHideDuration={3000} onClose={() => setShowHelper(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" icon={<InfoOutlined />}>
          Press <b>Shift + Left Arrow</b> to toggle menu.
        </Alert>
      </Snackbar>
    </>
  );
}