import React from 'react';
import { Dialog, Box, IconButton, Fade, Typography, Tooltip, Button } from '@mui/material';
import { Close, OpenInNew, Download } from '@mui/icons-material';
import { ParsedFile } from '../utils/types';

interface Props {
  open: boolean;
  onClose: () => void;
  file: ParsedFile | null;
}

export default function FilePreviewModal({ open, onClose, file }: Props) {
  if (!file) return null;

  // Helper to get render content
  const renderContent = () => {
    // 1. YouTube
    if (file.type === 'youtube' && file.youtubeId) {
      return (
        <iframe
          style={{ width: '100%', height: '100%', border: 0 }}
          src={`https://www.youtube.com/embed/${file.youtubeId}?autoplay=1`}
          title={file.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // 2. Images (Use high-res thumbnail for speed/cleanliness)
    if (file.type === 'image') {
      // Request a large image (w1920)
      const highResUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w1920`;
      return (
        <img 
          src={highResUrl} 
          alt={file.name} 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      );
    }

    // 3. Drive Files (PDF, Doc, Slide, Video, Sheet)
    // We use the /preview endpoint which is embed-friendly
    const embedUrl = `https://drive.google.com/file/d/${file.id}/preview`;
    return (
      <iframe
        src={embedUrl}
        style={{ width: '100%', height: '100%', border: 0 }}
        title={file.name}
        allow="autoplay"
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#0f172a', // Dark background for cinema mode
          height: '90vh',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.9)',
        }
      }}
      TransitionComponent={Fade}
    >
      {/* Header Bar */}
      <Box 
        sx={{ 
          p: 1.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          zIndex: 10
        }}
      >
        <Typography variant="subtitle1" color="white" noWrap sx={{ ml: 1, fontWeight: 600, maxWidth: '70%' }}>
          {file.name}
        </Typography>

        <Box display="flex" gap={1}>
          {/* Option to open in full drive if needed */}
          <Tooltip title="Open original in new tab">
            <IconButton 
              size="small" 
              onClick={() => window.open(file.url, '_blank')}
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              <OpenInNew />
            </IconButton>
          </Tooltip>
          
          <IconButton onClick={onClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ width: '100%', height: '100%', pt: 6, bgcolor: '#000' }}>
        {renderContent()}
      </Box>
    </Dialog>
  );
}