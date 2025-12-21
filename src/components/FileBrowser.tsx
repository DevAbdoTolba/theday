import React, { useState, useMemo } from 'react';
import { 
  Box, Tabs, Tab, Grid, Typography, Fade, 
  TextField, InputAdornment, useMediaQuery, useTheme 
} from '@mui/material';
// import { Search, SentimentDissatisfied } from '@mui/icons-material';
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
    return parsed.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));
  }, [data, activeTab, filter, categories]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // if (!data || Object.keys(data).length === 0) {
  //   return (
  //     <Box display="flex" flexDirection="column" alignItems="center" py={10} >
  //       <Typography variant="h6">No materials found for this subject yet.</Typography>
  //     </Box>
  //   );
  // }

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
                {/* <Search /> */}
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
        <Box>
          {filteredFiles.length > 0 ? (
            <Grid container spacing={3}>
              {filteredFiles.map((file) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
                  hello card :D
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={8}>
              <Typography variant="body1" color="text.secondary">
                No files found matching your criteria.
              </Typography>
            </Box>
          )}
        </Box>
      </Fade>
    </Box>
  );
}