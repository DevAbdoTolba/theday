import React from 'react';
import { 
  Box, Typography, Chip, useTheme, Paper, Tooltip 
} from '@mui/material';
import { 
  PictureAsPdf, Folder, Image as ImageIcon, YouTube, 
  Article, Slideshow, TableChart, InsertDriveFile, 
  OpenInNew, Visibility, PlayCircle, FolderOpen 
} from '@mui/icons-material';
import { ParsedFile } from '../utils/types';

// Left-side File Type Icon
const FileIcon = ({ type }: { type: ParsedFile['type'] }) => {
  switch (type) {
    case 'pdf': return <PictureAsPdf color="error" />;
    case 'folder': return <Folder color="primary" />;
    case 'image': return <ImageIcon color="secondary" />;
    case 'youtube': return <YouTube color="error" />;
    case 'video': return <YouTube color="action" />;
    case 'doc': return <Article color="primary" />;
    case 'slide': return <Slideshow color="warning" />;
    case 'sheet': return <TableChart color="success" />;
    default: return <InsertDriveFile color="disabled" />;
  }
};

interface Props {
  file: ParsedFile;
  onClick: () => void;
}

export const FileListItem = ({ file, onClick }: Props) => {
  const theme = useTheme();

  // Right-side Action Icon Logic
  const getActionIcon = () => {
    if (file.type === 'folder') return <FolderOpen fontSize="small" />;
    if (file.type === 'url') return <OpenInNew fontSize="small" />;
    if (file.type === 'youtube' || file.type === 'video') return <PlayCircle fontSize="small" />;
    // Default for docs, pdfs, images:
    return <Visibility fontSize="small" />;
  };

  return (
    <Paper
      component="a"
      href={file.url}
      // Intercept click to open Modal or New Tab based on logic passed from parent
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1.5,
        mb: 1,
        textDecoration: 'none',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.15s ease',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: theme.palette.action.hover,
          borderColor: theme.palette.primary.main,
          transform: 'translateX(4px)'
        }
      }}
    >
      {/* 1. File Type Icon */}
      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        <FileIcon type={file.type} />
      </Box>

      {/* 2. File Name */}
      <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
        <Typography 
          variant="body2" 
          fontWeight={600} 
          color="text.primary"
          noWrap
        >
          {file.name}
        </Typography>
      </Box>

      {/* 3. Type Chip (Hidden on mobile) */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}>
        <Chip 
          label={file.type === 'url' ? 'LINK' : file.type.toUpperCase()} 
          size="small" 
          variant="outlined" 
          color={file.type === 'youtube' ? 'error' : 'default'}
          sx={{ fontSize: '0.65rem', height: 20, width: 70 }} 
        />
      </Box>

      {/* 4. Action Icon (The Update) */}
      <Tooltip title={file.type === 'url' ? "Open in new tab" : "Preview here"}>
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', opacity: 0.7 }}>
          {getActionIcon()}
        </Box>
      </Tooltip>
    </Paper>
  );
};