import React from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, Chip, IconButton, useTheme } from '@mui/material';
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

const FileTypeIcon = ({ type }: { type: SessionItem['type'] }) => {
  switch (type) {
    case 'pdf': return <PictureAsPdf sx={{ fontSize: 18 }} color="error" />;
    case 'youtube': return <YouTube sx={{ fontSize: 18 }} color="error" />;
    case 'video': return <PlayCircle sx={{ fontSize: 18 }} color="action" />;
    case 'image': return <ImageIcon sx={{ fontSize: 18 }} color="secondary" />;
    case 'doc': return <Article sx={{ fontSize: 18 }} color="primary" />;
    case 'slide': return <Slideshow sx={{ fontSize: 18 }} color="warning" />;
    case 'sheet': return <TableChart sx={{ fontSize: 18 }} color="success" />;
    default: return <InsertDriveFile sx={{ fontSize: 18 }} color="disabled" />;
  }
};

interface Props {
  item: SessionItem;
  onRemove: (id: string) => void;
}

export default function SessionItemRow({ item, onRemove }: Props) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        px: 1,
        borderRadius: 1.5,
        '&:hover': { bgcolor: theme.palette.action.hover },
      }}
    >
      <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <FileTypeIcon type={item.type} />
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={500}
          noWrap
          sx={{ color: theme.palette.text.primary }}
        >
          {item.name}
        </Typography>
        <Chip
          label={item.category}
          size="small"
          sx={{ fontSize: '0.6rem', height: 16, mt: 0.25 }}
        />
      </Box>

      <IconButton
        size="small"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.name}`}
        sx={{ flexShrink: 0, color: theme.palette.text.secondary }}
      >
        <Close sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}
