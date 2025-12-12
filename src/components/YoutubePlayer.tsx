import React from 'react';
import { Dialog, Box, IconButton, useTheme, Fade } from '@mui/material';
import { Close } from '@mui/icons-material';

interface Props {
  open: boolean;
  onClose: () => void;
  videoId: string | null;
  title: string;
}

export default function YoutubePlayer({ open, onClose, videoId, title }: Props) {
  const theme = useTheme();

  if (!videoId) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#000',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
        }
      }}
      TransitionComponent={Fade}
    >
      {/* Close Button Header */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            bgcolor: 'rgba(0,0,0,0.5)', 
            color: '#fff',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
          }}
        >
          <Close />
        </IconButton>
      </Box>

      {/* Video Container (16:9 Aspect Ratio) */}
      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          paddingTop: '56.25%' // 16:9 Aspect Ratio
        }}
      >
        <iframe
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 0
          }}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
    </Dialog>
  );
}