import React, { useId, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, Collapse, ButtonBase, useMediaQuery, useTheme, alpha } from '@mui/material';
import { SessionItem } from '../../utils/types';
import SessionItemRow from './SessionItemRow';

const ExpandMore = dynamic(() => import('@mui/icons-material/ExpandMore'), { ssr: false });

interface Props {
  subjectName: string;
  items: SessionItem[];
  onRemoveItem: (id: string) => void;
  defaultExpanded?: boolean;
}

export default function CollectionGroup({
  subjectName,
  items,
  onRemoveItem,
  defaultExpanded = true,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const contentId = useId();

  return (
    <Box
      sx={{
        mb: 1,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.text.primary, 0.07)}`,
        borderRadius: 2.5,
        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.5 : 0.7),
      }}
    >
      <ButtonBase
        onClick={() => setExpanded(value => !value)}
        aria-expanded={expanded}
        aria-controls={contentId}
        sx={{
          width: '100%',
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.1,
          py: 0.7,
          textAlign: 'left',
          '&:hover': { bgcolor: alpha('#7c3aed', 0.055) },
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 1.75,
            color: theme.palette.mode === 'dark' ? '#ddd6fe' : '#6d28d9',
            bgcolor: alpha('#7c3aed', theme.palette.mode === 'dark' ? 0.18 : 0.09),
            fontSize: '0.72rem',
            fontWeight: 750,
            textTransform: 'uppercase',
          }}
        >
          {subjectName.trim().charAt(0) || 'S'}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography noWrap variant="body2" sx={{ fontWeight: 700, letterSpacing: '-0.015em' }}>
            {subjectName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.67rem' }}>
            {items.length} source{items.length === 1 ? '' : 's'}
          </Typography>
        </Box>
        <ExpandMore
          sx={{
            mr: 0.25,
            color: 'text.secondary',
            fontSize: 20,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease-out',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        />
      </ButtonBase>

      <Collapse in={expanded} timeout={reduceMotion ? 0 : 220}>
        <Box
          id={contentId}
          component="ul"
          sx={{ m: 0, px: 0.5, pb: 0.5, borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.055)}` }}
        >
          {items.map(item => (
            <SessionItemRow key={item.id} item={item} onRemove={onRemoveItem} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
