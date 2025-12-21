import React from 'react';
import dynamic from 'next/dynamic';
import { 
  Card, CardActionArea, CardContent, CardMedia, 
  Typography, Box, Chip, Tooltip, useTheme 
} from '@mui/material';
import { ParsedFile } from '../utils/types';
import { getYoutubeThumbnail } from '../utils/helpers';

// Dynamic imports for MUI icons
const PictureAsPdf = dynamic(() => import('@mui/icons-material/PictureAsPdf'), { ssr: false });
const Folder = dynamic(() => import('@mui/icons-material/Folder'), { ssr: false });
const ImageIcon = dynamic(() => import('@mui/icons-material/Image'), { ssr: false });
const YouTube = dynamic(() => import('@mui/icons-material/YouTube'), { ssr: false });
const Article = dynamic(() => import('@mui/icons-material/Article'), { ssr: false });
const Slideshow = dynamic(() => import('@mui/icons-material/Slideshow'), { ssr: false });
const TableChart = dynamic(() => import('@mui/icons-material/TableChart'), { ssr: false });
const InsertDriveFile = dynamic(() => import('@mui/icons-material/InsertDriveFile'), { ssr: false });
const OpenInNew = dynamic(() => import('@mui/icons-material/OpenInNew'), { ssr: false });
const PlayCircle = dynamic(() => import('@mui/icons-material/PlayCircle'), { ssr: false });

const FileIcon = ({ type }: { type: ParsedFile['type'] }) => {
  switch (type) {
    case 'youtube': return <PlayCircle color="error" />;
    case 'pdf': return <PictureAsPdf color="error" />;
    case 'folder': return <Folder color="primary" />;
    case 'image': return <ImageIcon color="secondary" />;
    case 'video': return <YouTube color="action" />;
    case 'doc': return <Article color="primary" />;
    case 'slide': return <Slideshow color="warning" />;
    case 'sheet': return <TableChart color="success" />;
    default: return <InsertDriveFile color="disabled" />;
  }
};

interface FileCardProps {
  file: ParsedFile;
  onClick?: () => void;
  isNew?: boolean;
}

export const FileCard = ({ file, onClick, isNew }: FileCardProps) => {
  const theme = useTheme();
  
  // Determine thumbnail source
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
        // REMOVED ANIMATION, kept clean border
        border: `1px solid ${isNew ? theme.palette.primary.main : theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
          borderColor: theme.palette.primary.main,
        }
      }}
      onClick={(e) => {
        if (file.type === 'youtube') {
          e.preventDefault();
          if (onClick) onClick();
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
        {thumbnail ? (
          <CardMedia
            component="img"
            height="140"
            image={thumbnail}
            alt={file.name}
            sx={{ objectFit: 'cover', bgcolor: theme.palette.grey[100] }}
          />
        ) : (
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
              <FileIcon type={file.type} />
            </Box>
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box display="flex" gap={1} mb={1} flexWrap="wrap">
            <Chip 
              size="small" 
              label={file.type.toUpperCase()} 
              color={file.type === 'youtube' ? 'error' : file.type === 'folder' ? 'primary' : 'default'}
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
            {/* FIXED NEW BADGE: No Animation, Solid Color */}
            {isNew && (
              <Chip 
                size="small" 
                label="NEW" 
                color="primary"
                sx={{ 
                  fontSize: '0.65rem', 
                  height: 20,
                  fontWeight: 800,
                  borderRadius: 1
                }} 
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