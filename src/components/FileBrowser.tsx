import React, { useState, useMemo } from "react";
import {
  Box, Tabs, Tab, Grid, Typography, Fade, TextField,
  InputAdornment, ToggleButtonGroup, ToggleButton, Chip,
  Skeleton, Alert, useMediaQuery,
} from "@mui/material";
import { Search, GridView, ViewList, AutoAwesome, FilterList } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { SubjectMaterials, ParsedFile } from "../utils/types";
import { parseGoogleFile } from "../utils/helpers";
import { FileCard } from "./FileCard";
import { FileListItem } from "./FileListItem";
import YoutubePlayer from "./YoutubePlayer";

interface Props {
  data: SubjectMaterials;
  subjectName: string;
  newItems?: string[];
  fetching?: boolean;
}

export default function FileBrowser({ data, subjectName, newItems = [], fetching = false }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState("");
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "list" : "grid");
  const [playingVideo, setPlayingVideo] = useState<{ id: string; title: string } | null>(null);

  // Categories with "All" tab
  const categories = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];
    return ["All", ...Object.keys(data).sort()];
  }, [data]);

  // Filtered files with robust empty state handling
  const filteredFiles = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return [];
    
    const currentCategory = categories[activeTab];
    let files = currentCategory === "All" 
      ? Object.values(data).flat() 
      : data[currentCategory] || [];
    
    const parsed = files.map(parseGoogleFile);

    // Text filter
    let filtered = filter 
      ? parsed.filter(f => f.name.toLowerCase().includes(filter.toLowerCase())) 
      : parsed;

    // New items filter
    if (showOnlyNew) {
      filtered = filtered.filter(f => newItems.includes(f.id));
    }

    return filtered;
  }, [data, activeTab, filter, showOnlyNew, newItems, categories]);

  // New items count
  const newItemsInView = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return 0;
    
    const currentCategory = categories[activeTab];
    let files = currentCategory === "All" 
      ? Object.values(data).flat() 
      : data[currentCategory] || [];
    
    const parsed = files.map(parseGoogleFile);
    const filtered = filter 
      ? parsed.filter(f => f.name.toLowerCase().includes(filter.toLowerCase())) 
      : parsed;
    
    return filtered.filter(f => newItems.includes(f.id)).length;
  }, [data, activeTab, filter, newItems, categories]);

  const handleFileClick = (file: ParsedFile) => {
    if (file.type === "youtube" && file.youtubeId) {
      setPlayingVideo({ id: file.youtubeId, title: file.name });
    } else {
      window.open(file.url, "_blank");
    }
  };

  // Empty state
  if (!data || Object.keys(data).length === 0) {
    return (
      <Box textAlign="center" py={10} px={2}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No materials available yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Materials will appear here once uploaded by your instructors
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Controls Bar */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2, 
        alignItems: isMobile ? 'stretch' : 'center',
      }}>
        {/* Search */}
        <TextField
          placeholder="Search files..."
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 3 },
          }}
          sx={{ flexGrow: 1, maxWidth: isMobile ? '100%' : 400 }}
        />

        {/* View Toggle + New Filter */}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => val && setViewMode(val)}
            size="small"
            sx={{ height: 40 }}
          >
            <ToggleButton value="grid"><GridView fontSize="small" /></ToggleButton>
            <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
          </ToggleButtonGroup>

          {newItemsInView > 0 && (
            <Chip
              label={`New (${newItemsInView})`}
              icon={<AutoAwesome />}
              onClick={() => setShowOnlyNew(!showOnlyNew)}
              color={showOnlyNew ? "primary" : "default"}
              variant={showOnlyNew ? "filled" : "outlined"}
              sx={{ height: 40, fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      {/* Tabs */}
      {categories.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {categories.map((cat) => (
              <Tab key={cat} label={cat} sx={{ fontWeight: 600 }} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Loading State */}
      {fetching && (
        <Grid container spacing={2}>
          {[1,2,3,4,5,6].map(i => (
            <Grid item xs={6} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} lg={viewMode === 'grid' ? 3 : 12} key={i}>
              <Skeleton variant="rectangular" height={viewMode === 'grid' ? 200 : 80} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Content */}
      {!fetching && (
        <Fade in={true}>
          <Box>
            {filteredFiles.length > 0 ? (
              viewMode === "grid" ? (
                <Grid container spacing={2}>
                  {filteredFiles.map((file) => (
                    <Grid item xs={6} sm={6} md={4} lg={3} key={file.id}>
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
              <Box textAlign="center" py={8}>
                <FilterList sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No files found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filters
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      )}

      <YoutubePlayer
        open={!!playingVideo}
        onClose={() => setPlayingVideo(null)}
        videoId={playingVideo?.id || null}
        title={playingVideo?.title || ""}
      />
    </Box>
  );
}