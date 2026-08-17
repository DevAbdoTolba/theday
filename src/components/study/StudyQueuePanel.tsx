import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useStudySession } from '../../context/StudySessionContext';
import { formatStudyContext, formatUrls } from '../../utils/study-export';
import { trackStudyCopy, trackStudyOpenNLM, trackStudyToggle } from '../../utils/clarity';
import ClipboardFallback from './ClipboardFallback';
import CollectionGroup from './CollectionGroup';

const AutoStories = dynamic(() => import('@mui/icons-material/AutoStories'), { ssr: false });
const KeyboardArrowDown = dynamic(() => import('@mui/icons-material/KeyboardArrowDown'), { ssr: false });
const PauseCircleOutline = dynamic(() => import('@mui/icons-material/PauseCircleOutline'), { ssr: false });
const PlayArrow = dynamic(() => import('@mui/icons-material/PlayArrow'), { ssr: false });
const Link = dynamic(() => import('@mui/icons-material/Link'), { ssr: false });
const Description = dynamic(() => import('@mui/icons-material/Description'), { ssr: false });
const OpenInNew = dynamic(() => import('@mui/icons-material/OpenInNew'), { ssr: false });
const DeleteOutline = dynamic(() => import('@mui/icons-material/DeleteOutline'), { ssr: false });
const AddCircleOutline = dynamic(() => import('@mui/icons-material/AddCircleOutline'), { ssr: false });

const MAX_ITEMS = 50;
const WARN_THRESHOLD = 40;
const NOTEBOOKLM_URL = 'https://notebooklm.google.com/';

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function StudyQueuePanel() {
  const { isActive, items, itemCount, removeItem, clearAll, toggleMode } = useStudySession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const reduceMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [fallback, setFallback] = useState<{ content: string; title: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, typeof items>();
    for (const item of items) {
      const group = groups.get(item.subjectName) ?? [];
      group.push(item);
      groups.set(item.subjectName, group);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  useEffect(() => {
    if (isActive) setCollapsed(false);
  }, [isActive]);

  useEffect(() => {
    const updateShift = (event: KeyboardEvent) => setShiftHeld(event.shiftKey);
    const releaseShift = () => setShiftHeld(false);
    window.addEventListener('keydown', updateShift);
    window.addEventListener('keyup', updateShift);
    window.addEventListener('blur', releaseShift);
    return () => {
      window.removeEventListener('keydown', updateShift);
      window.removeEventListener('keyup', updateShift);
      window.removeEventListener('blur', releaseShift);
    };
  }, []);

  const handleModeToggle = () => {
    trackStudyToggle(!isActive);
    toggleMode();
    if (isActive && itemCount > 0) setCollapsed(true);
  };

  const handleCopyUrls = async () => {
    trackStudyCopy(items, 'URLs', 'Queue');
    const content = formatUrls(items);
    if (await writeToClipboard(content)) {
      setToast('Links copied. Paste them as website sources in NotebookLM.');
    } else {
      setFallback({ content, title: 'Copy source links' });
    }
  };

  const handleCopyContext = async () => {
    trackStudyCopy(items, 'Context', 'Queue');
    const content = formatStudyContext(items);
    if (await writeToClipboard(content)) {
      setToast('Study prompt copied. Add it as a text source in NotebookLM.');
    } else {
      setFallback({ content, title: 'Copy study prompt' });
    }
  };

  const handleCopyPrimary = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.shiftKey) {
      void handleCopyContext();
      return;
    }
    void handleCopyUrls();
  };

  const handleOpenNotebookLM = async () => {
    trackStudyOpenNLM(items, 'Queue');
    window.open(NOTEBOOKLM_URL, '_blank', 'noopener,noreferrer');
    const content = formatUrls(items);
    if (await writeToClipboard(content)) {
      setToast('Links copied. In NotebookLM, choose Add sources, then Website.');
    } else {
      setFallback({ content, title: 'Copy source links for NotebookLM' });
    }
  };

  const shouldShow = isActive || itemCount > 0;
  const enterState = reduceMotion ? { opacity: 0 } : { y: 28, opacity: 0, scale: 0.98 };
  const activeState = reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 };

  return (
    <>
      <AnimatePresence initial={false}>
        {shouldShow && (
          <motion.aside
            key="study-set-dock"
            initial={enterState}
            animate={activeState}
            exit={enterState}
            transition={reduceMotion ? { duration: 0.12 } : { type: 'spring', bounce: 0, duration: 0.4 }}
            aria-label="Study set"
            style={{
              position: 'fixed',
              right: isMobile ? 0 : 20,
              bottom: isMobile ? 0 : 20,
              width: isMobile ? '100%' : 410,
              zIndex: 1300,
              transformOrigin: isMobile ? 'bottom center' : 'bottom right',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: isMobile ? '22px 22px 0 0' : 3.5,
                color: 'text.primary',
                bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.92 : 0.9),
                backdropFilter: 'blur(22px) saturate(145%)',
                WebkitBackdropFilter: 'blur(22px) saturate(145%)',
                border: `1px solid ${alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.13 : 0.09)}`,
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 24px 70px rgba(0,0,0,0.48), 0 8px 24px rgba(49,46,129,0.18)'
                  : '0 24px 70px rgba(30,41,59,0.18), 0 8px 24px rgba(79,70,229,0.1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: '0 18% auto',
                  height: 2,
                  zIndex: 1,
                  borderRadius: '0 0 999px 999px',
                  background: 'linear-gradient(90deg, transparent, #a78bfa 28%, #60a5fa 70%, transparent)',
                  opacity: isActive ? 0.85 : 0.28,
                },
                '@media (prefers-reduced-transparency: reduce)': {
                  bgcolor: 'background.paper',
                  backdropFilter: 'none',
                  WebkitBackdropFilter: 'none',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 66, px: 1.15, py: 0.85 }}>
                <ButtonBase
                  onClick={() => setCollapsed(value => !value)}
                  aria-expanded={!collapsed}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    alignSelf: 'stretch',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: 1.1,
                    px: 0.65,
                    borderRadius: 2.25,
                    textAlign: 'left',
                    '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.045) },
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 2.25,
                      color: '#fff',
                      background: isActive
                        ? 'linear-gradient(145deg, #7c3aed, #4f46e5 56%, #2563eb)'
                        : alpha(theme.palette.text.primary, 0.1),
                      boxShadow: isActive ? '0 8px 18px rgba(76,29,149,0.24), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
                    }}
                  >
                    <AutoStories sx={{ fontSize: 20 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 750, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                      Study Set
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mt: 0.4 }}>
                      <Box
                        component="span"
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: isActive ? '#22c55e' : 'text.disabled',
                          boxShadow: isActive ? '0 0 0 3px rgba(34,197,94,0.1)' : 'none',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.69rem', lineHeight: 1 }}>
                        {isActive ? 'Selection on' : 'Saved for later'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      minWidth: 48,
                      height: 28,
                      px: 0.9,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '999px',
                      color: isActive ? (theme.palette.mode === 'dark' ? '#ddd6fe' : '#6d28d9') : 'text.secondary',
                      bgcolor: isActive ? alpha('#7c3aed', 0.1) : alpha(theme.palette.text.primary, 0.055),
                      fontSize: '0.7rem',
                      fontWeight: 750,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {itemCount}/{MAX_ITEMS}
                  </Box>
                  <KeyboardArrowDown
                    sx={{
                      color: 'text.secondary',
                      fontSize: 21,
                      transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms ease-out',
                      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    }}
                  />
                </ButtonBase>

                <Tooltip title={isActive ? 'Pause selection' : 'Resume selection'} placement="top">
                  <IconButton
                    onClick={handleModeToggle}
                    aria-label={isActive ? 'Pause Study Mode' : 'Resume Study Mode'}
                    sx={{
                      ml: 0.35,
                      width: 40,
                      height: 40,
                      color: isActive ? (theme.palette.mode === 'dark' ? '#c4b5fd' : '#6d28d9') : 'text.secondary',
                      '&:hover': { bgcolor: alpha('#7c3aed', 0.08) },
                    }}
                  >
                    {isActive ? <PauseCircleOutline sx={{ fontSize: 21 }} /> : <PlayArrow sx={{ fontSize: 22 }} />}
                  </IconButton>
                </Tooltip>
              </Box>

              <Collapse in={!collapsed} timeout={reduceMotion ? 0 : 220}>
                <Box sx={{ borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.065)}` }}>
                  {!isActive && itemCount > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mx: 1.5,
                        mt: 1.25,
                        px: 1.25,
                        py: 0.9,
                        borderRadius: 2,
                        bgcolor: alpha('#7c3aed', 0.07),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontSize: '0.7rem' }}>
                        Your sources are saved. Resume selection to add more.
                      </Typography>
                      <Button size="small" onClick={handleModeToggle} startIcon={<PlayArrow />} sx={{ textTransform: 'none', fontWeight: 700 }}>
                        Resume
                      </Button>
                    </Box>
                  )}

                  {itemCount >= WARN_THRESHOLD && (
                    <Alert severity="warning" sx={{ mx: 1.5, mt: 1.25, py: 0.2, borderRadius: 2, fontSize: '0.72rem' }}>
                      {itemCount >= MAX_ITEMS ? 'Source limit reached.' : `${MAX_ITEMS - itemCount} source slots remaining.`}
                    </Alert>
                  )}

                  <Box
                    sx={{
                      maxHeight: isMobile ? '44dvh' : 292,
                      overflowY: 'auto',
                      px: 1.25,
                      py: itemCount === 0 ? 3.5 : 1.25,
                      overscrollBehavior: 'contain',
                      scrollbarWidth: 'thin',
                      scrollbarColor: `${alpha(theme.palette.text.primary, 0.18)} transparent`,
                    }}
                  >
                    {itemCount === 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', px: 3 }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: '50%',
                            color: theme.palette.mode === 'dark' ? '#c4b5fd' : '#7c3aed',
                            bgcolor: alpha('#7c3aed', 0.08),
                            border: `1px solid ${alpha('#7c3aed', 0.12)}`,
                          }}
                        >
                          <AddCircleOutline sx={{ fontSize: 25 }} />
                        </Box>
                        <Typography sx={{ mt: 1.25, fontSize: '0.84rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
                          Build your study set
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, maxWidth: 260, fontSize: '0.72rem', lineHeight: 1.45 }}>
                          Select files from any subject. They will stay organized here and ready for NotebookLM.
                        </Typography>
                      </Box>
                    ) : (
                      groupedItems.map(([subjectName, subjectItems]) => (
                        <CollectionGroup
                          key={subjectName}
                          subjectName={subjectName}
                          items={subjectItems}
                          onRemoveItem={removeItem}
                        />
                      ))
                    )}
                  </Box>

                  {itemCount > 0 && (
                    <Box
                      sx={{
                        px: 1.5,
                        pt: 1.25,
                        pb: isMobile ? 'max(14px, env(safe-area-inset-bottom))' : 1.5,
                        borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.065)}`,
                        bgcolor: alpha(theme.palette.background.paper, 0.52),
                      }}
                    >
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
                        <Button
                          variant="outlined"
                          startIcon={shiftHeld
                            ? <Description sx={{ fontSize: '16px !important' }} />
                            : <Link sx={{ fontSize: '17px !important' }} />}
                          onClick={handleCopyPrimary}
                          sx={{ minHeight: 38, borderRadius: 2, textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          {shiftHeld ? 'Copy context' : 'Copy links'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Description sx={{ fontSize: '16px !important' }} />}
                          onClick={handleCopyContext}
                          sx={{ minHeight: 38, borderRadius: 2, textTransform: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          Copy prompt
                        </Button>
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<OpenInNew sx={{ fontSize: '16px !important' }} />}
                        onClick={handleOpenNotebookLM}
                        sx={{
                          mt: 0.8,
                          minHeight: 42,
                          borderRadius: 2,
                          color: '#fff',
                          background: 'linear-gradient(135deg, #7c3aed, #4f46e5 58%, #2563eb)',
                          boxShadow: '0 8px 20px rgba(67,56,202,0.2)',
                          textTransform: 'none',
                          fontSize: '0.78rem',
                          fontWeight: 750,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #6d28d9, #4338ca 58%, #1d4ed8)',
                            boxShadow: '0 10px 24px rgba(67,56,202,0.28)',
                          },
                        }}
                      >
                        Continue in NotebookLM
                      </Button>
                      <Button
                        fullWidth
                        color="error"
                        size="small"
                        startIcon={<DeleteOutline sx={{ fontSize: '15px !important' }} />}
                        onClick={() => setConfirmClear(true)}
                        sx={{ mt: 0.45, minHeight: 32, opacity: 0.68, textTransform: 'none', fontSize: '0.7rem' }}
                      >
                        Clear study set
                      </Button>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Paper>
          </motion.aside>
        )}
      </AnimatePresence>

      <Dialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 750, letterSpacing: '-0.02em' }}>Clear this study set?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This removes all {itemCount} source{itemCount === 1 ? '' : 's'} from this device.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setConfirmClear(false)} sx={{ textTransform: 'none' }}>Keep sources</Button>
          <Button
            onClick={() => { clearAll(); setConfirmClear(false); }}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Clear set
          </Button>
        </DialogActions>
      </Dialog>

      {fallback && (
        <ClipboardFallback
          open
          onClose={() => setFallback(null)}
          content={fallback.content}
          title={fallback.title}
        />
      )}

      <Snackbar
        open={!!toast}
        autoHideDuration={4200}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
