import React from 'react';
import { 
  Box, Typography, IconButton, Chip, 
  useTheme, Paper, Tooltip 
} from '@mui/material';
import { 
  PictureAsPdf, Folder, Image as ImageIcon, YouTube, 
  Article, Slideshow, TableChart, InsertDriveFile, 
  OpenInNew, Download 
} from '@mui/icons-material';
import { ParsedFile } from '../utils/types';

// Reusing the icon logic for consistency
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

export const FileListItem = ({ file }: { file: ParsedFile }) => {
  const theme = useTheme();

  return (
    <Paper
      component="a"
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
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
        '&:hover': {
          bgcolor: theme.palette.action.hover,
          borderColor: theme.palette.primary.main,
          transform: 'translateX(4px)'
        }
      }}
    >
      {/* Icon Column */}
      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        <FileIcon type={file.type} />
      </Box>

      {/* Name Column */}
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

      {/* Type Tag */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}>
        <Chip 
          label={file.type.toUpperCase()} 
          size="small" 
          variant="outlined" 
          sx={{ fontSize: '0.65rem', height: 20, width: 70 }} 
        />
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
        {file.isExternalLink ? <OpenInNew fontSize="small" /> : <Download fontSize="small" />}
      </Box>
    </Paper>
  );
};