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
  const categories = useMemo(() => {
    return ['All', ...Object.keys(data)];
  }, [data]);

  // 2. Flatten and Filter Data
  const filteredFiles = useMemo(() => {
    return categories[activeTab] === 'All'
      ? Object.values(data).flat()
      : data[categories[activeTab]] || [];
  }, [data, activeTab, categories]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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