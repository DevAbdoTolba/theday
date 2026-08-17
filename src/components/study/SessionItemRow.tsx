import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, IconButton, Tooltip, useTheme, alpha } from '@mui/material';
import { SessionItem } from '../../utils/types';

const PictureAsPdf = dynamic(() => import('@mui/icons-material/PictureAsPdf'), { ssr: false });
const YouTube = dynamic(() => import('@mui/icons-material/YouTube'), { ssr: false });
const Article = dynamic(() => import('@mui/icons-material/Article'), { ssr: false });
const Slideshow = dynamic(() => import('@mui/icons-material/Slideshow'), { ssr: false });
const TableChart = dynamic(() => import('@mui/icons-material/TableChart'), { ssr: false });
const InsertDriveFile = dynamic(() => import('@mui/icons-material/InsertDriveFile'), { ssr: false });
const ImageIcon = dynamic(() => import('@mui/icons-material/Image'), { ssr: false });
const PlayCircle = dynamic(() => import('@mui/icons-material/PlayCircle'), { ssr: false });
const Close = dynamic(() => import('@mui/icons-material/Close'), { ssr: false });

function FileTypeIcon({ type }: { type: SessionItem['type'] }) {
  switch (type) {
    case 'pdf': return <PictureAsPdf sx={{ fontSize: 18, color: '#ef4444' }} />;
    case 'youtube': return <YouTube sx={{ fontSize: 18, color: '#ef4444' }} />;
    case 'video': return <PlayCircle sx={{ fontSize: 18, color: '#8b5cf6' }} />;
    case 'image': return <ImageIcon sx={{ fontSize: 18, color: '#ec4899' }} />;
    case 'doc': return <Article sx={{ fontSize: 18, color: '#3b82f6' }} />;
    case 'slide': return <Slideshow sx={{ fontSize: 18, color: '#f59e0b' }} />;
    case 'sheet': return <TableChart sx={{ fontSize: 18, color: '#10b981' }} />;
    default: return <InsertDriveFile sx={{ fontSize: 18, color: 'text.secondary' }} />;
  }
}

interface Props {
  item: SessionItem;
  onRemove: (id: string) => void;
}

export default function SessionItemRow({ item, onRemove }: Props) {
  const theme = useTheme();

  return (
    <Box
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.15,
        minHeight: 52,
        px: 1,
        py: 0.65,
        listStyle: 'none',
        borderRadius: 2,
        transition: 'background-color 160ms ease-out',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.045) },
        '&:hover .study-row-remove': { opacity: 1 },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 1.75,
          bgcolor: alpha(theme.palette.text.primary, 0.055),
          border: `1px solid ${alpha(theme.palette.text.primary, 0.06)}`,
        }}
      >
        <FileTypeIcon type={item.type} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Tooltip title={item.name} enterDelay={600} placement="top">
          <Typography
            variant="body2"
            noWrap
            sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.01em' }}
          >
            {item.name}
          </Typography>
        </Tooltip>
        <Typography
          variant="caption"
          noWrap
          sx={{
            display: 'block',
            mt: 0.25,
            color: 'text.secondary',
            fontSize: '0.66rem',
            lineHeight: 1.2,
            letterSpacing: '0.025em',
          }}
        >
          {item.category || item.type.toUpperCase()}
        </Typography>
      </Box>

      <Tooltip title={`Remove ${item.name}`} placement="top">
        <IconButton
          className="study-row-remove"
          size="small"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            color: 'text.secondary',
            opacity: { xs: 0.82, md: 0.5 },
            transition: 'opacity 160ms ease-out, color 160ms ease-out, background-color 160ms ease-out',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            '&:hover': {
              color: 'error.main',
              bgcolor: alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <Close sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
