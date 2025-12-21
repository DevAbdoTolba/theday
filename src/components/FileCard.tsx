import React from 'react';
import { 
  Card, CardActionArea, CardContent, CardMedia, 
  Typography, Box, Chip, Tooltip, useTheme, alpha 
} from '@mui/material';
import { 
  PictureAsPdf, Folder, Image as ImageIcon, YouTube, 
  Article, Slideshow, TableChart, InsertDriveFile, PlayCircle 
} from '@mui/icons-material';
import { ParsedFile } from '../utils/types';
import { getYoutubeThumbnail } from '../utils/helpers';

const FileIcon = ({ type }: { type: ParsedFile['type'] }) => {
  const iconProps = { fontSize: 'large' as const };
  switch (type) {
    case 'youtube': return <PlayCircle {...iconProps} color="error" />; 
    case 'pdf': return <PictureAsPdf {...iconProps} color="error" />;
    case 'folder': return <Folder {...iconProps} color="primary" />;
    case 'image': return <ImageIcon {...iconProps} color="secondary" />;
    case 'doc': return <Article {...iconProps} color="primary" />;
    case 'slide': return <Slideshow {...iconProps} color="warning" />;
    case 'sheet': return <TableChart {...iconProps} color="success" />;
    default: return <InsertDriveFile {...iconProps} color="disabled" />;
  }
};

interface FileCardProps {
  file: ParsedFile;
  onClick?: () => void;
  isNew?: boolean;
}

export const FileCard = ({ file, onClick, isNew }: FileCardProps) => {
  const theme = useTheme();
  
  let thumbnail = file.thumbnailUrl;
  if (file.type === 'youtube') {
    const ytThumb = getYoutubeThumbnail(file.url);
    if (ytThumb) thumbnail = ytThumb;
  }

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: 3,
        border: `1px solid ${isNew ? theme.palette.primary.main : theme.palette.divider}`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderColor: theme.palette.primary.main,
        }
      }}
      onClick={(e) => {
        if (file.type === 'youtube') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardActionArea 
        component="a" 
        href={file.url} 
        target="_blank" 
        rel="noopener noreferrer"
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch', 
          height: '100%' 
        }}
      >
        {/* Thumbnail/Icon */}
        {thumbnail ? (
          <CardMedia
            component="img"
            height="160"
            image={thumbnail}
            alt={file.name}
            sx={{ objectFit: 'cover', bgcolor: alpha(theme.palette.text.primary, 0.03) }}
          />
        ) : (
          <Box 
            sx={{ 
              height: 160, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <FileIcon type={file.type} />
          </Box>
        )}

        {/* Content */}
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* Badges */}
          <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
            {isNew && (
              <Chip 
                size="small" 
                label="NEW" 
                color="primary"
                sx={{ fontSize: '0.65rem', height: 20, fontWeight: 800 }} 
              />
            )}
            <Chip 
              size="small" 
              label={file.type.toUpperCase()} 
              color={file.type === 'youtube' ? 'error' : file.type === 'folder' ? 'primary' : 'default'}
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }} 
            />
          </Box>
          
          {/* Title */}
          <Tooltip title={file.name} enterDelay={500}>
            <Typography 
              variant="body2" 
              fontWeight={600}
              sx={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                lineHeight: 1.4,
                minHeight: '2.8em', // Ensure consistent height
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