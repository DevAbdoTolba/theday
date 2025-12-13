import YoutubePlayer from './YoutubePlayer';
import VisualState from './feedback/VisualState';
import React, { useState, useMemo } from 'react';
import { 
  Box, Tabs, Tab, Grid, Typography, Fade, 
  TextField, InputAdornment, useTheme, ToggleButtonGroup, ToggleButton, Chip 
} from '@mui/material';
import { 
  Search, SentimentDissatisfied, GridView, ViewList, Brightness1 
} from '@mui/icons-material';
import { SubjectMaterials, ParsedFile } from '../utils/types';
import { parseGoogleFile } from '../utils/helpers';
import { FileCard } from './FileCard';
import { FileListItem } from './FileListItem';

interface Props {
  data: SubjectMaterials;
  subjectName: string;
  newItems?: string[];
  fetching?: boolean;
}

export default function FileBrowser({ data, subjectName, newItems = [], fetching = false }: Props) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState('');
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingVideo, setPlayingVideo] = useState<{ id: string, title: string } | null>(null);

  // Categories
  const categories = useMemo(() => ['All', ...Object.keys(data)], [data]);

  // Flatten and Filter
  const filteredFiles = useMemo(() => {
    const currentCategory = categories[activeTab];
    let files = currentCategory === 'All' ? Object.values(data).flat() : data[currentCategory] || [];
    const parsed = files.map(parseGoogleFile);
    
    // Apply text filter
    let filtered = parsed;
    if (filter) {
      filtered = filtered.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));
    }
    
    // Apply "new items only" filter
    if (showOnlyNew) {
      filtered = filtered.filter(f => newItems.includes(f.id));
    }
    
    return filtered;
  }, [data, activeTab, filter, showOnlyNew, newItems, categories]);
  
  // Count new items in current view (before applying showOnlyNew filter)
  const newItemsInView = useMemo(() => {
    const currentCategory = categories[activeTab];
    let files = currentCategory === 'All' ? Object.values(data).flat() : data[currentCategory] || [];
    const parsed = files.map(parseGoogleFile);
    
    // Apply text filter
    let filtered = parsed;
    if (filter) {
      filtered = filtered.filter(f => f.name.toLowerCase().includes(filter.toLowerCase()));
    }
    
    return filtered.filter(f => newItems.includes(f.id)).length;
  }, [data, activeTab, filter, newItems, categories]);

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
      <Box display="flex" flexDirection="column" alignItems="center" py={10} sx={{ opacity: 0.6 }}>
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
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
          
          {/* New Items Filter - Only show if there are new items in current view */}
          {newItemsInView > 0 && (
            <Chip
              label={`New (${newItemsInView})`}
              icon={<Brightness1 sx={{ fontSize: '0.8rem !important' }} />}
              onClick={() => setShowOnlyNew(!showOnlyNew)}
              color={showOnlyNew ? "success" : "default"}
              variant={showOnlyNew ? "filled" : "outlined"}
              sx={{
                fontWeight: 700,
                fontSize: '0.875rem',
                height: 40,
                px: 2,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'fadeInScale 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                '@keyframes fadeInScale': {
                  '0%': {
                    opacity: 0,
                    transform: 'scale(0.8)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                },
                '&::before': showOnlyNew ? {} : {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  padding: '2px',
                  background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light}, ${theme.palette.success.main})`,
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  animation: 'shimmer 2s infinite',
                },
                '@keyframes shimmer': {
                  '0%': {
                    backgroundPosition: '-200% 0',
                  },
                  '100%': {
                    backgroundPosition: '200% 0',
                  },
                },
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: showOnlyNew 
                    ? `0 4px 20px ${theme.palette.success.main}40`
                    : `0 4px 20px ${theme.palette.primary.main}20`,
                },
                '& .MuiChip-icon': {
                  color: showOnlyNew ? 'inherit' : theme.palette.success.main,
                  animation: showOnlyNew ? 'none' : 'pulse 2s infinite',
                },
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                    transform: 'scale(1)',
                  },
                  '50%': {
                    opacity: 0.7,
                    transform: 'scale(1.2)',
                  },
                },
              }}
            />
          )}
          
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
                      onClick={() => handleFileClick(file)}
                      isNew={newItems.includes(file.id)}
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
                    onClick={() => handleFileClick(file)}
                    isNew={newItems.includes(file.id)}
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