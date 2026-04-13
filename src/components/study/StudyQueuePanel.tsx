import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Paper, Typography, IconButton, Button,
  Collapse, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, Tooltip, useTheme,
  useMediaQuery, alpha,
} from '@mui/material';
import { useStudySession } from '../../context/StudySessionContext';
import { formatUrls, formatStudyContext } from '../../utils/study-export';
import { trackButtonClick } from '../../utils/clarity';
import SessionItemRow from './SessionItemRow';
import ClipboardFallback from './ClipboardFallback';

const Close = dynamic(() => import('@mui/icons-material/Close'), { ssr: false });
const ExpandLess = dynamic(() => import('@mui/icons-material/ExpandLess'), { ssr: false });
const ExpandMore = dynamic(() => import('@mui/icons-material/ExpandMore'), { ssr: false });
const ContentCopy = dynamic(() => import('@mui/icons-material/ContentCopy'), { ssr: false });
const OpenInNew = dynamic(() => import('@mui/icons-material/OpenInNew'), { ssr: false });
const DeleteSweep = dynamic(() => import('@mui/icons-material/DeleteSweep'), { ssr: false });
const AutoAwesome = dynamic(() => import('@mui/icons-material/AutoAwesome'), { ssr: false });

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
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [fallback, setFallback] = useState<{ content: string; title: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => setShiftHeld(e.shiftKey);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);

  const handleCopy = async () => {
    const subjects = Array.from(new Set(items.map(i => i.subjectName))).join(', ');
    trackButtonClick('StudyQueueCopy', { item_count: itemCount, copy_type: shiftHeld ? 'Context' : 'URLs', subjects: subjects || 'None' });
    if (shiftHeld) {
      const text = formatStudyContext(items);
      const ok = await writeToClipboard(text);
      if (ok) setToast('Study context copied — paste as a text source in NotebookLM');
      else setFallback({ content: text, title: 'Copy Study Context' });
    } else {
      const text = formatUrls(items);
      const ok = await writeToClipboard(text);
      if (ok) setToast('URLs copied — paste as website sources in NotebookLM');
      else setFallback({ content: text, title: 'Copy URLs' });
    }
  };

  const handleOpenNotebookLM = () => {
    const subjects = Array.from(new Set(items.map(i => i.subjectName))).join(', ');
    trackButtonClick('StudyQueueOpenNLM', { item_count: itemCount, subjects: subjects || 'None' });
    window.open(NOTEBOOKLM_URL, '_blank');
  };

  const panelWidth = isMobile ? '100vw' : 380;
  const panelEdge = isMobile ? 0 : 16;
  const panelBorderRadius = isMobile ? '12px 12px 0 0' : '12px';

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="study-queue-panel"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            style={{
              position: 'fixed',
              bottom: isMobile ? 0 : 16,
              right: panelEdge,
              width: panelWidth,
              zIndex: 1300,
            }}
          >
          <Paper
            elevation={12}
            sx={{
              borderRadius: panelBorderRadius,
              overflow: 'hidden',
              backdropFilter: 'blur(16px)',
              bgcolor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.95)
                : alpha(theme.palette.background.paper, 0.97),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              boxShadow: `0 -2px 24px ${alpha(theme.palette.primary.main, 0.12)}, ${theme.shadows[12]}`,
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1.25,
                borderBottom: collapsed ? 'none' : `1px solid ${theme.palette.divider}`,
                background: `linear-gradient(135deg, ${alpha('#8b5cf6', 0.12)}, ${alpha('#3b82f6', 0.08)})`,
                cursor: 'pointer',
                userSelect: 'none',
              }}
              onClick={() => setCollapsed(c => !c)}
            >
              <AutoAwesome sx={{ fontSize: 14, color: 'primary.main', mr: 1, flexShrink: 0 }} />
              <Typography variant="body2" fontWeight={700} sx={{ flexGrow: 1, color: 'text.primary' }}>
                Study Session
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  mr: 1,
                  px: 1,
                  py: 0.25,
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                }}
              >
                {itemCount}/{MAX_ITEMS}
              </Typography>
              <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setCollapsed(c => !c); }}
                  sx={{ color: 'text.secondary', mr: 0.5 }}
                >
                  {collapsed ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="End study session">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); if (isActive) toggleMode(); }}
                  sx={{ color: 'text.secondary' }}
                >
                  <Close sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>

            <Collapse in={!collapsed}>
              {/* Limit warning */}
              {itemCount >= WARN_THRESHOLD && (
                <Alert severity="warning" sx={{ mx: 1.5, mt: 1, py: 0.25, borderRadius: 1.5, fontSize: '0.75rem' }}>
                  {itemCount >= MAX_ITEMS ? 'Limit reached — 50 items max' : `${MAX_ITEMS - itemCount} slots remaining`}
                </Alert>
              )}

              {/* Actions row */}
              {itemCount > 0 && (
                <Box sx={{ display: 'flex', gap: 0.75, px: 1.5, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopy sx={{ fontSize: '14px !important' }} />}
                    onClick={handleCopy}
                    sx={{ flex: 1, fontSize: '0.72rem', py: 0.5, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                  >
                    {shiftHeld ? 'Context' : 'Copy'}
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<OpenInNew sx={{ fontSize: '14px !important' }} />}
                    onClick={handleOpenNotebookLM}
                    sx={{ flex: 1, fontSize: '0.72rem', py: 0.5, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                  >
                    NLM
                  </Button>
                </Box>
              )}

              {/* Items list */}
              <Box
                sx={{
                  maxHeight: isMobile ? '40vh' : 260,
                  overflowY: 'auto',
                  px: 0.5,
                  py: itemCount === 0 ? 3 : 0.5,
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    borderRadius: 2,
                  },
                }}
              >
                {itemCount === 0 ? (
                  <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                    Enable Study Mode and tap file cards to collect materials
                  </Typography>
                ) : (
                  items.map(item => (
                    <SessionItemRow key={item.id} item={item} onRemove={removeItem} />
                  ))
                )}
              </Box>

              {/* Footer */}
              {itemCount > 0 && (
                <Box sx={{ px: 1.5, py: 0.75, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Button
                    fullWidth
                    size="small"
                    color="error"
                    startIcon={<DeleteSweep sx={{ fontSize: '14px !important' }} />}
                    onClick={() => setConfirmClear(true)}
                    sx={{ fontSize: '0.72rem', py: 0.4, textTransform: 'none', fontWeight: 600, opacity: 0.75 }}
                  >
                    Clear All
                  </Button>
                </Box>
              )}
            </Collapse>
          </Paper>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Clear All confirmation */}
      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Clear study collection?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Remove all {itemCount} item{itemCount !== 1 ? 's' : ''}? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button onClick={() => { clearAll(); setConfirmClear(false); }} color="error" variant="contained">Clear All</Button>
        </DialogActions>
      </Dialog>

      {/* Clipboard fallback */}
      {fallback && (
        <ClipboardFallback
          open={!!fallback}
          onClose={() => setFallback(null)}
          content={fallback.content}
          title={fallback.title}
        />
      )}

      {/* Toast */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
