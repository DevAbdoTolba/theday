import React from 'react';
import dynamic from 'next/dynamic';
import { 
  Card, CardActionArea, CardContent, CardMedia, 
  Typography, Box, Chip, Tooltip, useTheme, useMediaQuery
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
const ZoomOutMap = dynamic(() => import('@mui/icons-material/ZoomOutMap'), { ssr: false });

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
  peekMode?: boolean;
  // Mobile expansion control - only one card can be expanded at a time
  mobileExpandedId?: string | null;
  onMobileExpand?: (id: string | null) => void;
  // Position in grid (0 = left, 1 = right on 2-column mobile grid)
  gridPosition?: 'left' | 'right';
}

export const FileCard = ({ 
  file, 
  onClick, 
  isNew, 
  peekMode = false,
  mobileExpandedId,
  onMobileExpand,
  gridPosition = 'left'
}: FileCardProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  // Mobile expansion - controlled by parent for single expansion
  const isMobileExpanded = !isDesktop && mobileExpandedId === file.id;
  
  // Determine thumbnail source
  let thumbnail = file.thumbnailUrl;
  if (file.type === 'youtube') {
    const ytThumb = getYoutubeThumbnail(file.url);
    if (ytThumb) thumbnail = ytThumb;
  }

  // Handle mobile zoom click
  const handleMobileZoom = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onMobileExpand) {
      onMobileExpand(isMobileExpanded ? null : file.id);
    }
  };

  // Smart transform for mobile - expand towards center to prevent overflow
  const mobileTransform = gridPosition === 'right' 
    ? 'scale(1.15) translateX(-8%)' 
    : 'scale(1.15) translateX(8%)';

  return (
    // Wrapper maintains layout space - never changes size
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        // Desktop hover expansion
        '&:hover .file-card-inner': isDesktop && !peekMode ? {
          transform: 'scale(1.12)',
          zIndex: 100,
          boxShadow: theme.shadows[20],
          transitionDelay: '0.4s',
        } : {},
        '&:hover .file-card-inner .thumbnail': isDesktop && !peekMode ? {
          height: 200,
          transitionDelay: '0.4s',
        } : {},
        '&:hover .file-card-inner .file-title': isDesktop && !peekMode ? {
          WebkitLineClamp: 5,
          transitionDelay: '0.4s',
        } : {},
        // Mobile expansion (controlled by parent)
        '& .file-card-inner': isMobileExpanded ? {
          transform: mobileTransform,
          zIndex: 100,
          boxShadow: theme.shadows[16],
        } : {},
        '& .file-card-inner .thumbnail': isMobileExpanded ? {
          height: 200,
        } : {},
        '& .file-card-inner .file-title': isMobileExpanded ? {
          WebkitLineClamp: 6,
        } : {},
      }}
      onClick={isMobileExpanded ? () => onMobileExpand?.(null) : undefined}
    >
      {/* Invisible placeholder that maintains grid space */}
      <Box sx={{ height: '100%', visibility: 'hidden' }}>
        <Card sx={{ height: '100%' }}>
          <Box sx={{ height: 140 }} />
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ height: 20, mb: 1 }} />
            <Typography variant="body2" sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4
            }}>
              {file.name}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Actual card - positioned absolute so it can grow without affecting layout */}
      <Card 
        className="file-card-inner"
        elevation={0}
        sx={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          minHeight: '100%',
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: 3,
          border: `1px solid ${isNew ? theme.palette.primary.main : theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
          // Smooth transitions with easing
          transition: `
            transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.35s ease,
            z-index 0s
          `,
          transformOrigin: 'center top',
          zIndex: 1,
          '&:hover': {
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
        {/* Zoom icon - always visible on mobile, clickable */}
        {!isDesktop && (
          <Box
            onClick={handleMobileZoom}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 5,
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: isMobileExpanded ? theme.palette.primary.main : 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:active': {
                transform: 'scale(0.9)',
              }
            }}
          >
            <ZoomOutMap sx={{ fontSize: 18 }} />
          </Box>
        )}

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
          }}
        >
          {/* Thumbnail with smooth height transition */}
          {thumbnail ? (
            <CardMedia
              className="thumbnail"
              component="img"
              image={thumbnail}
              alt={file.name}
              sx={{ 
                objectFit: 'cover', 
                bgcolor: theme.palette.grey[100],
                height: 140,
                transition: 'height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          ) : (
            <Box 
              className="thumbnail"
              sx={{ 
                height: 140,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                transition: 'height 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
            
            {/* Title with smooth line-clamp transition */}
            <Tooltip title={file.name} enterDelay={500}>
              <Typography 
                className="file-title"
                variant="body2"
                fontWeight={600}
                sx={{
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  lineHeight: 1.4,
                }}
              >
                {file.name}
              </Typography>
            </Tooltip>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
};