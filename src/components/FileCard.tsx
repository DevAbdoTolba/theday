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
  // let thumbnail = file.thumbnailUrl;
  // if (file.type === 'youtube') {
  //   const ytThumb = getYoutubeThumbnail(file.url);
  //   if (ytThumb) thumbnail = ytThumb;
  // }

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
          borderColor: theme.palette.primary.main,
        }
      }}
    >
      <CardActionArea 
        component="a" 
        href={file.url} 
        target="_blank" 
        rel="noopener noreferrer"
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', height: '100%' }}
      >

          <Box 
            sx={{ 
              height: 140, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
            }}
          >
            <Box sx={{ transform: 'scale(2.5)', opacity: 0.5 }}>
              {file.type}
            </Box>
          </Box>
        

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box display="flex" gap={1} mb={1}>
            <Chip 
              size="small" 
              label={file.type.toUpperCase()} 
              color={file.type === 'folder' ? 'primary' : 'default'}
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
            {file.isExternalLink && (
              <Chip 
                size="small" 
                icon={<OpenInNew sx={{ fontSize: '0.8rem !important' }} />}
                label="LINK" 
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            )}
          </Box>
          
          <Tooltip title={file.name} enterDelay={500}>
            <Typography 
              variant="body2" 
              fontWeight={600}
              sx={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                lineHeight: 1.4
              }}
            >
              {file.name}
            </Typography>
          </Tooltip>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};