import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, Chip, Collapse, useTheme, alpha } from '@mui/material';
import { SessionItem } from '../../utils/types';
import SessionItemRow from './SessionItemRow';

const ExpandMore = dynamic(() => import('@mui/icons-material/ExpandMore'), { ssr: false });
const ExpandLess = dynamic(() => import('@mui/icons-material/ExpandLess'), { ssr: false });

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

  return (
    <Box sx={{ mb: 1 }}>
      {/* Subject header - tappable to collapse */}
      <Box
        onClick={() => setExpanded(prev => !prev)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 0.75,
          borderRadius: 1.5,
          cursor: 'pointer',
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.10) },
          userSelect: 'none',
        }}
        role="button"
        aria-expanded={expanded}
        aria-label={`${subjectName} group, ${items.length} item${items.length !== 1 ? 's' : ''}`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(prev => !prev); }}
      >
        <Typography variant="caption" fontWeight={700} sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
          {subjectName}
        </Typography>
        <Chip
          label={items.length}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontSize: '0.65rem', height: 18, minWidth: 28 }}
        />
        <Box sx={{ color: theme.palette.text.secondary, display: 'flex', alignItems: 'center' }}>
          {expanded ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ pl: 1 }}>
          {items.map(item => (
            <SessionItemRow key={item.id} item={item} onRemove={onRemoveItem} />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
