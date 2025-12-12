import React, { useContext, useEffect, useState } from 'react';
import {
  Box, Typography, useTheme, Snackbar, Alert,
  alpha, Drawer, List, ListItem, ListItemButton, ListItemText, IconButton
} from '@mui/material';
import { School, InfoOutlined, KeyboardDoubleArrowRight, Close } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { DataContext } from '../context/TranscriptContext';

interface Props {
  currentSubject: string;
  mobileOpen: boolean;       
  onMobileClose: () => void; 
}

// CONFIGURATION
const RADIUS = 400; 
const ITEM_SPACING_DEG = 10; 

export default function SubjectSidebar({ currentSubject, mobileOpen, onMobileClose }: Props) {
  const theme = useTheme();
  const { transcript } = useContext(DataContext);
  const [isOpen, setIsOpen] = useState(false); // Desktop State
  const [showHelper, setShowHelper] = useState(false);
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);
  
  const [flatSubjects, setFlatSubjects] = useState<any[]>([]);
  
  useEffect(() => {
    if (transcript && 'semesters' in transcript) {
      const flat = transcript.semesters.flatMap((sem: any) => 
        sem.subjects.map((sub: any) => ({ ...sub, semesterIndex: sem.index }))
      );
      setFlatSubjects(flat);
    }
  }, [transcript]);

  // Lock body scroll when Desktop sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'b')) {
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- SCROLL WHEEL LOGIC ---
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (flatSubjects.length > 0 && currentSubject) {
      const idx = flatSubjects.findIndex((s: any) => s.abbreviation === currentSubject);
      if (idx !== -1) setActiveIndex(idx);
    }
  }, [flatSubjects, currentSubject]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!isOpen) return;
    const direction = e.deltaY > 0 ? 1 : -1;
    setActiveIndex((prev) => {
      const next = prev + direction;
      return Math.max(0, Math.min(next, flatSubjects.length - 1));
    });
  };

  return (
    <>
      {/* ========================================= */}
      {/* 1. MOBILE DRAWER (Standard Side Bar)      */}
      {/* ========================================= */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' }, // Mobile only
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight="bold" color="primary">
            Navigation
          </Typography>
          <IconButton onClick={onMobileClose}>
            <Close />
          </IconButton>
        </Box>
        <List>
          {flatSubjects.map((subject) => (
            <Link 
              key={subject.abbreviation} 
              href={`/subjects/${subject.abbreviation}`} 
              passHref
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={onMobileClose}
            >
              <ListItem disablePadding>
                <ListItemButton 
                  selected={subject.abbreviation === currentSubject}
                  sx={{
                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                  }}
                >
                  <School sx={{ mr: 2, fontSize: 20, color: subject.abbreviation === currentSubject ? 'primary.main' : 'text.secondary' }} />
                  <ListItemText 
                    primary={subject.abbreviation} 
                    secondary={`Semester ${subject.semesterIndex}`} 
                    primaryTypographyProps={{ fontWeight: subject.abbreviation === currentSubject ? 700 : 400 }}
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>

      {/* ========================================= */}
      {/* 2. DESKTOP ROULETTE SIDEBAR               */}
      {/* ========================================= */}
      
      {/* Hover Trigger */}
      <Box
        onMouseEnter={() => setIsTriggerHovered(true)}
        onMouseLeave={() => setIsTriggerHovered(false)}
        onClick={() => setIsOpen(true)}
        sx={{
          display: { xs: 'none', md: isOpen ? 'none' : 'flex' },
          position: 'fixed',
          left: 0,
          top: '30%',
          height: '40vh',
          width: '40px',
          zIndex: 1300,
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <AnimatePresence>
          {isTriggerHovered && (
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
                y: [0, -8, 0],
                filter: ["hue-rotate(0deg)", "hue-rotate(45deg)", "hue-rotate(0deg)"]
              }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ 
                x: { duration: 0.2, ease: "easeOut" },
                y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
                filter: { repeat: Infinity, duration: 3, ease: "linear" }
              }}
              style={{
                width: '100%',
                height: '80px',
                background: theme.palette.primary.main,
                borderRadius: '0 20px 20px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                color: '#fff'
              }}
            >
              <KeyboardDoubleArrowRight />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Roulette Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1299,
                backdropFilter: 'blur(3px)'
              }}
            />

            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              onWheel={handleWheel}
              style={{
                position: 'fixed',
                left: 0, top: 0, bottom: 0,
                width: '400px',
                zIndex: 1300,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box sx={{ position: 'relative', height: '100%', width: '100%', pointerEvents: 'auto' }}>
                {/* RENDER ALL ITEMS TO PREVENT GLITCHES */}
                {flatSubjects.map((item, index) => {
                  const offset = index - activeIndex;
                  return (
                    <WheelItem 
                      key={item.abbreviation}
                      item={item}
                      offset={offset}
                      isActive={index === activeIndex}
                      onClick={() => setShowHelper(true)}
                      theme={theme}
                    />
                  );
                })}
              </Box>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Snackbar
        open={showHelper}
        autoHideDuration={3000}
        onClose={() => setShowHelper(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" icon={<InfoOutlined />}>
          Press <b>Shift + Left Arrow</b> to close.
        </Alert>
      </Snackbar>
    </>
  );
}

// --- ITEM LOGIC ---
function WheelItem({ item, offset, isActive, onClick, theme }: any) {
  // Math: Calculate positions for ALL items
  const angleDeg = offset * ITEM_SPACING_DEG;
  const angleRad = (angleDeg * Math.PI) / 180;

  const centerX = -RADIUS + 50; 
  
  // Basic Circular Motion
  const x = centerX + (RADIUS * Math.cos(angleRad)); 
  const y = RADIUS * Math.sin(angleRad);

  // Visibilty logic: Fade out items far away, but don't unmount them
  const isFar = Math.abs(offset) > 10;
  const opacity = isFar ? 0 : 1 - Math.abs(offset * 0.15);
  const pointerEvents = isFar ? 'none' : 'auto';

  return (
    <Link 
      href={`/subjects/${item.abbreviation}`} 
      passHref 
      style={{ textDecoration: 'none', pointerEvents: pointerEvents as any }}
      onClick={onClick}
    >
      <motion.div
        // We animate all props so they slide into place smoothly
        animate={{ 
          x: x + 40,
          y: `calc(50vh + ${y}px - 25px)`, 
          opacity: opacity,
          scale: 1 - Math.abs(offset * 0.05),
          display: isFar ? 'none' : 'block' // Performance optimization
        }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '280px',
          height: '50px',
        }}
      >
        <Box sx={{
          bgcolor: isActive 
            ? theme.palette.primary.main 
            : theme.palette.background.paper,
          color: isActive 
            ? theme.palette.primary.contrastText 
            : theme.palette.text.primary,
          
          borderRadius: '0 25px 25px 0', 
          border: `1px solid ${isActive ? 'transparent' : alpha(theme.palette.divider, 0.5)}`,
          boxShadow: isActive 
            ? `5px 0 25px ${alpha(theme.palette.primary.main, 0.4)}` 
            : '2px 2px 10px rgba(0,0,0,0.1)',
          
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          gap: 1.5,
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateX(15px)', 
            bgcolor: isActive ? theme.palette.primary.dark : theme.palette.action.hover,
          }
        }}>
          <School sx={{ fontSize: 18, opacity: isActive ? 1 : 0.6 }} />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={800} noWrap>
              {item.abbreviation}
            </Typography>
            {isActive && (
              <Typography variant="caption" noWrap sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                Semester {item.semesterIndex}
              </Typography>
            )}
          </Box>
        </Box>
      </motion.div>
    </Link>
  );
}