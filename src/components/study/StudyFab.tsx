import React, { useState } from 'react';
import { Fab, Badge, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { useStudySession } from '../../context/StudySessionContext';
import CollectionPanel from './CollectionPanel';

const AutoStories = dynamic(() => import('@mui/icons-material/AutoStories'), { ssr: false });

export default function StudyFab() {
  const { isActive, itemCount } = useStudySession();
  const [panelOpen, setPanelOpen] = useState(false);
  const theme = useTheme();

  // FAB is visible when Study Mode is active OR there are collected items
  if (!isActive && itemCount === 0) return null;

  return (
    <>
      <Badge
        badgeContent={itemCount}
        color="primary"
        overlap="circular"
        sx={{
          position: 'fixed',
          bottom: { xs: 24, md: 32 },
          right: { xs: 16, md: 32 },
          zIndex: theme.zIndex.fab,
        }}
      >
        <Fab
          color="primary"
          aria-label="Open study collection"
          onClick={() => setPanelOpen(true)}
          sx={{
            boxShadow: theme.shadows[6],
          }}
        >
          <AutoStories />
        </Fab>
      </Badge>

      <CollectionPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
