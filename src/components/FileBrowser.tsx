import React, { useState, useMemo } from 'react';
import { 
  Box, Tabs, Tab, Grid, Typography, Fade, 
  TextField, InputAdornment, useMediaQuery, useTheme 
} from '@mui/material';
import { SubjectMaterials } from '../utils/types';

interface Props {
  data: SubjectMaterials;
  subjectName: string;
}

export default function FileBrowser({ data, subjectName }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState('');

  // 1. Get Categories (Tabs)


  if (!data || Object.keys(data).length === 0) {
    return (
      <Box >
        <Typography variant="h6">No materials found for this subject yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      Happy &#x1F60A;
    </Box>
  );
}