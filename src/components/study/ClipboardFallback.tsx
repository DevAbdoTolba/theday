import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

const SelectAll = dynamic(() => import('@mui/icons-material/SelectAll'), { ssr: false });

interface Props {
  open: boolean;
  onClose: () => void;
  content: string;
  title: string;
}

export default function ClipboardFallback({ open, onClose, content, title }: Props) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const theme = useTheme();

  const handleSelectAll = () => {
    textRef.current?.focus();
    textRef.current?.select();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ pb: 0.5, fontWeight: 750, letterSpacing: '-0.02em' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>
          Your browser could not access the clipboard. Select the content below and copy it manually.
        </Typography>
        <Box
          sx={{
            p: 0.75,
            borderRadius: 2.5,
            bgcolor: alpha(theme.palette.text.primary, 0.04),
            border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          }}
        >
          <TextField
            inputRef={textRef}
            multiline
            fullWidth
            minRows={7}
            maxRows={12}
            value={content}
            InputProps={{ readOnly: true, inputProps: { 'aria-label': 'Content to copy' } }}
            variant="standard"
            sx={{
              '& .MuiInputBase-root': { p: 1, fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace', fontSize: '0.76rem', lineHeight: 1.55 },
              '& .MuiInput-root::before, & .MuiInput-root::after': { display: 'none' },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 0.5 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button
          onClick={handleSelectAll}
          variant="contained"
          startIcon={<SelectAll />}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Select all
        </Button>
      </DialogActions>
    </Dialog>
  );
}
