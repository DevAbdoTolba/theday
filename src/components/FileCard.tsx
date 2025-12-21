import React from 'react';
import { 
  Card, CardActionArea, CardContent, CardMedia, 
  Typography, Box, Chip, Tooltip, useTheme 
} from '@mui/material';
import { 
  PictureAsPdf, Folder, Image as ImageIcon, YouTube, 
  Article, Slideshow, TableChart, InsertDriveFile, 
  OpenInNew 
} from '@mui/icons-material';
import { ParsedFile } from '../utils/types';
import { getYoutubeThumbnail } from '../utils/helpers';

// const FileIcon = ({ type }: { type: ParsedFile['type'] }) => {
//   switch (type) {
//     case 'pdf': return <PictureAsPdf color="error" />;
//     case 'folder': return <Folder color="primary" />;
//     case 'image': return <ImageIcon color="secondary" />;
//     case 'youtube': return <YouTube color="error" />;
//     case 'video': return <YouTube color="action" />;
//     case 'doc': return <Article color="primary" />;
//     case 'slide': return <Slideshow color="warning" />;
//     case 'sheet': return <TableChart color="success" />;
//     default: return <InsertDriveFile color="disabled" />;
//   }
// };

export const FileCard = ({ file }: { file: ParsedFile }) => {
  const theme = useTheme();
  
  // Determine thumbnail source
  let thumbnail = file.thumbnailUrl;
  if (file.type === 'youtube') {
    const ytThumb = getYoutubeThumbnail(file.url);
    if (ytThumb) thumbnail = ytThumb;
  }

  return (
    <Card>
      Card :DD
    </Card>
  );
};