import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Drawer, Box, Typography, IconButton, Button, Divider,
  Alert, Snackbar, Dialog, DialogTitle, DialogContent,
  DialogActions, useTheme, useMediaQuery, alpha,
} from '@mui/material';
import { useStudySession } from '../../context/StudySessionContext';
import { formatUrls, formatStudyContext } from '../../utils/study-export';
import CollectionGroup from './CollectionGroup';
import ClipboardFallback from './ClipboardFallback';

const Close = dynamic(() => import('@mui/icons-material/Close'), { ssr: false });
const ContentCopy = dynamic(() => import('@mui/icons-material/ContentCopy'), { ssr: false });
const OpenInNew = dynamic(() => import('@mui/icons-material/OpenInNew'), { ssr: false });
const DeleteSweep = dynamic(() => import('@mui/icons-material/DeleteSweep'), { ssr: false });
const Description = dynamic(() => import('@mui/icons-material/Description'), { ssr: false });

const LIMIT_WARN_THRESHOLD = 40;
const MAX_ITEMS = 50;
const NOTEBOOKLM_URL = 'https://notebooklm.google.com';

interface Props {
  open: boolean;
  onClose: () => void;
}

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function CollectionPanel({ open, onClose }: Props) {
  const { items, itemCount, removeItem, clearAll } = useStudySession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [toast, setToast] = useState<string | null>(null);
  const [fallback, setFallback] = useState<{ content: string; title: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  // Group items by subject, sorted alphabetically
  const groupedItems = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      if (!map.has(item.subjectName)) map.set(item.subjectName, []);
      map.get(item.subjectName)!.push(item);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const handleCopyUrls = async () => {
    const text = formatUrls(items);
    const ok = await writeToClipboard(text);
    if (ok) {
      setToast('URLs copied — paste as website sources in NotebookLM');
    } else {
      setFallback({ content: text, title: 'Copy URLs' });
    }
  };

  const handleCopyContext = async () => {
    const text = formatStudyContext(items);
    const ok = await writeToClipboard(text);
    if (ok) {
      setToast('Study context copied — paste as a text source in NotebookLM');
    } else {
      setFallback({ content: text, title: 'Copy Study Context' });
    }
  };

  const handleOpenNotebookLM = async () => {
    const text = formatUrls(items);
    await writeToClipboard(text);
    window.open(NOTEBOOKLM_URL, '_blank');
    setToast('URLs copied — Create a new notebook → Add sources → Paste as website URLs');
  };

  const handleConfirmClear = () => {
    clearAll();
    setConfirmClear(false);
  };

  return (
    <>
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 380,
            maxHeight: isMobile ? '85vh' : '100vh',
            borderRadius: isMobile ? '16px 16px 0 0' : 0,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ flexGrow: 1 }}>
            Study Collection
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            {itemCount}/{MAX_ITEMS}
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close panel">
            <Close />
          </IconButton>
        </Box>

        {/* Limit warning */}
        {itemCount >= LIMIT_WARN_THRESHOLD && (
          <Alert severity="warning" sx={{ mx: 2, mt: 1.5, borderRadius: 1.5, py: 0.5 }}>
            {itemCount >= MAX_ITEMS
              ? 'Limit reached — 50 items max for NotebookLM'
              : `Approaching limit — ${MAX_ITEMS - itemCount} items remaining`}
          </Alert>
        )}

        {/* Body - scrollable */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 1.5 }}>
          {itemCount === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
                opacity: 0.5,
              }}
            >
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No items yet. Activate Study Mode and tap file cards to collect materials.
              </Typography>
            </Box>
          ) : (
            groupedItems.map(([subjectName, subjectItems]) => (
              <CollectionGroup
                key={subjectName}
                subjectName={subjectName}
                items={subjectItems}
                onRemoveItem={removeItem}
                defaultExpanded
              />
            ))
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            px: 2,
            py: 1.5,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<ContentCopy />}
            onClick={handleCopyUrls}
            disabled={itemCount === 0}
          >
            Copy URLs
          </Button>
          <Box display="flex" gap={1}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<Description />}
              onClick={handleCopyContext}
              disabled={itemCount === 0}
              sx={{ flex: 1 }}
            >
              Copy Context
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<OpenInNew />}
              onClick={handleOpenNotebookLM}
              disabled={itemCount === 0}
              sx={{ flex: 1 }}
            >
              Open NotebookLM
            </Button>
          </Box>
          <Divider />
          <Button
            fullWidth
            variant="text"
            size="small"
            color="error"
            startIcon={<DeleteSweep />}
            onClick={() => setConfirmClear(true)}
            disabled={itemCount === 0}
            sx={{ color: alpha(theme.palette.error.main, 0.7) }}
          >
            Clear All
          </Button>
        </Box>
      </Drawer>

      {/* Clear All confirmation */}
      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Clear all items?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will remove all {itemCount} item{itemCount !== 1 ? 's' : ''} from your study collection. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button onClick={handleConfirmClear} color="error" variant="contained">
            Clear All
          </Button>
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

      {/* Toast notifications */}
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
