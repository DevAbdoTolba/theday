import YoutubePlayer from './YoutubePlayer';
import VisualState from './feedback/VisualState';
import React, { useState, useMemo } from 'react';
import { 
  Box, Tabs, Tab, Grid, Typography, Fade, 
  TextField, InputAdornment, useTheme, ToggleButtonGroup, ToggleButton 
} from '@mui/material';
import { 
  Search, SentimentDissatisfied, GridView, ViewList 
} from '@mui/icons-material';
import { SubjectMaterials } from '../utils/types';
import { parseGoogleFile } from '../utils/helpers';
import { FileCard } from './FileCard';
import { FileListItem } from './FileListItem';

interface Props {
  data: SubjectMaterials;
  subjectName: string;
}

export default function FileBrowser({ data, subjectName }: Props) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingVideo, setPlayingVideo] = useState<{ id: string, title: string } | null>(null);

  // Categories
  const categories = useMemo(() => ['All', ...Object.keys(data)], [data]);

  // Flatten and Filter
  const filteredFiles = useMemo(() => {
    const currentCategory = categories[activeTab];
    let files = currentCategory === 'All' ? Object.values(data).flat() : data[currentCategory] || [];
    const parsed = files.map(parseGoogleFile);
    if (!filter) return parsed;
    return parsed.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));
  }, [data, activeTab, filter, categories]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, nextView: 'grid' | 'list') => {
    if (nextView !== null) setViewMode(nextView);
  };
  const handleFileClick = (file: ParsedFile) => {
    if (file.type === 'youtube' && file.youtubeId) {
      setPlayingVideo({ id: file.youtubeId, title: file.name });
    } else {
      window.open(file.url, '_blank');
    }
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={10} opacity={0.6}>
        <SentimentDissatisfied sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6">No materials found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header / Controls */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between' }}>
        <Typography variant="h4" fontWeight={800} color="primary">{subjectName}</Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search files..."
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            InputProps={{
              startAdornment: (<InputAdornment position="start"><Search color="action" /></InputAdornment>),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <ToggleButtonGroup 
            value={viewMode} 
            exclusive 
            onChange={handleViewChange} 
            size="small"
            sx={{ height: 40 }}
          >
            <ToggleButton value="grid"><GridView /></ToggleButton>
            <ToggleButton value="list"><ViewList /></ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}
        >
          {categories.map((cat) => <Tab key={cat} label={cat} />)}
        </Tabs>
      </Box>

      {/* Content */}
      <Fade in={true} key={`${activeTab}-${viewMode}`}>
        <Box>
          {filteredFiles.length > 0 ? (
            viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredFiles.map((file) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={file.id}>
                    <FileCard 
                      file={file} 
                      // PASS THE CLICK HANDLER
                      onClick={() => handleFileClick(file)} 
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box>
                {filteredFiles.map((file) => (
                  <FileListItem 
                    key={file.id} 
                    file={file} 
                    // PASS THE CLICK HANDLER
                    onClick={() => handleFileClick(file)} 
                  />
                ))}
              </Box>
            )
          ) : (
            <VisualState type="empty" message="No materials found." />
          )}
        </Box>
      </Fade>

      {/* RENDER THE PLAYER */}
      <YoutubePlayer 
        open={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        videoId={playingVideo?.id || null}
        title={playingVideo?.title || ""}
      />
    </Box>
  );
}