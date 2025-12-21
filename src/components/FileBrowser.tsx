import React, { useState, useMemo } from 'react';
import { 
  Box, Tabs, Tab, Grid, Typography, Fade, 
  TextField, InputAdornment, useMediaQuery, useTheme 
} from '@mui/material';
import { Search, SentimentDissatisfied } from '@mui/icons-material';
import { SubjectMaterials } from '../utils/types';
import { parseGoogleFile } from '../utils/helpers';
import { FileCard } from './FileCard';

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
    const currentCategory = categories[activeTab];
    let files = [];

    if (currentCategory === 'All') {
      // Combine all files from all categories
      files = Object.values(data).flat();
    } else {
      files = data[currentCategory] || [];
    }

    // Parse them first
    const parsed = files.map(parseGoogleFile);

    // Apply text filter
    if (!filter) return parsed;
    return parsed.filter(f  => f.name.toLowerCase().includes(filter.toLowerCase()));
  }, [data, activeTab, filter, categories]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <Box >
        <SentimentDissatisfied sx={{ fontSize: 60, mb: 2 }} />
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