import React, { useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField,
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  content: string;
  title: string;
}

export default function ClipboardFallback({ open, onClose, content, title }: Props) {
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleSelectAll = () => {
    if (textRef.current) {
      textRef.current.select();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={textRef}
          multiline
          fullWidth
          rows={8}
          value={content}
          InputProps={{ readOnly: true, inputProps: { 'aria-label': 'Copy content' } }}
          variant="outlined"
          size="small"
          sx={{ mt: 1, fontFamily: 'monospace' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSelectAll} variant="outlined" size="small">
          Select All
        </Button>
        <Button onClick={onClose} variant="contained" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
