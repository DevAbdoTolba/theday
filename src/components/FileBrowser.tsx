import React, { useState, useMemo } from 'react';
import { 
  Box, Tabs, Tab, Grid, Typography, Fade, 
  TextField, InputAdornment, useMediaQuery, useTheme 
} from '@mui/material';
import { Search, SentimentDissatisfied } from '@mui/icons-material';
import { SubjectMaterials } from '../utils/types';
// import { parseGoogleFile } from '../utils/helpers';
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
    let files: any[] = []; 
    if (activeTab === 0) {
      // All categories
      Object.values(data).forEach(categoryFiles => {
        files = files.concat(categoryFiles);
      });
    } else {
      // Specific category
      const category = categories[activeTab];
      files = data[category] || [];
    }

    // Apply text filter
    if (filter.trim() !== '') {
      const lowerFilter = filter.toLowerCase();
      files = files.filter(file => 
        file.name.toLowerCase().includes(lowerFilter)
      );
    }
  }, [data, activeTab, filter, categories]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={10}>
        <SentimentDissatisfied sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6">No materials found for this subject yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Controls Area */}
      <Box 
        sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h4" fontWeight={800} color="primary">
          {subjectName}
        </Typography>

        <TextField
          placeholder="Filter files..."
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: { xs: '100%', md: 300 } }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minHeight: 48,
            }
          }}
        >
          {categories.map((cat) => (
            <Tab key={cat} label={cat} />
          ))}
        </Tabs>
      </Box>

      {/* Grid Content */}
      <Fade in={true} key={activeTab}>
        <>
          HAPPY :D
        </>
      </Fade>
    </Box>
  );
}