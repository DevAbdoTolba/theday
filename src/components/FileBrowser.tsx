import YoutubePlayer from "./YoutubePlayer";
import VisualState from "./feedback/VisualState";
import React, { useState, useMemo } from "react";
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  Fade,
  TextField,
  InputAdornment,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Divider,
} from "@mui/material";
import {
  Search,
  SentimentDissatisfied,
  GridView,
  ViewList,
  AutoAwesome,
} from "@mui/icons-material";
import { SubjectMaterials, ParsedFile } from "../utils/types";
import { parseGoogleFile } from "../utils/helpers";
import { FileCard } from "./FileCard";
import { FileListItem } from "./FileListItem";

interface Props {
  data: SubjectMaterials;
  subjectName: string;
  newItems?: string[];
  fetching?: boolean;
}

export default function FileBrowser({
  data,
  subjectName,
  newItems = [],
  fetching = false,
}: Props) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState("");
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [playingVideo, setPlayingVideo] = useState<{
    id: string;
    title: string;
  } | null>(null);
  

  // Categories
  const categories = useMemo(() => ["All", ...Object.keys(data)], [data]);

  // Flatten and Filter
  const filteredFiles = useMemo(() => {
    const currentCategory = categories[activeTab];
    let files =
      currentCategory === "All"
        ? Object.values(data).flat()
        : data[currentCategory] || [];
    const parsed = files.map(parseGoogleFile);

    // Apply text filter
    let filtered = parsed;
    if (filter) {
      filtered = filtered.filter((f) =>
        f.name.toLowerCase().includes(filter.toLowerCase())
      );
    }

    // Apply "new items only" filter
    if (showOnlyNew) {
      filtered = filtered.filter((f) => newItems.includes(f.id));
    }

    return filtered;
  }, [data, activeTab, filter, showOnlyNew, newItems, categories]);

  // Count new items in current view
  const newItemsInView = useMemo(() => {
    const currentCategory = categories[activeTab];
    let files =
      currentCategory === "All"
        ? Object.values(data).flat()
        : data[currentCategory] || [];
    const parsed = files.map(parseGoogleFile);

    // Apply text filter for count
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      return parsed.filter(
        (f) =>
          newItems.includes(f.id) && f.name.toLowerCase().includes(lowerFilter)
      ).length;
    }

    return parsed.filter((f) => newItems.includes(f.id)).length;
  }, [data, activeTab, filter, newItems, categories]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) =>
    setActiveTab(newValue);

  const handleViewChange = (
    _: React.MouseEvent<HTMLElement>,
    nextView: "grid" | "list"
  ) => {
    if (nextView !== null) setViewMode(nextView);
  };
  const handleFileClick = (file: ParsedFile) => {
    if (file.type === "youtube" && file.youtubeId) {
      setPlayingVideo({ id: file.youtubeId, title: file.name });
    } else {
      window.open(file.url, "_blank");
    }
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        py={10}
        sx={{ opacity: 0.6 }}
      >
        <SentimentDissatisfied sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6">No materials found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header / Controls */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
        }}
      >


        {/* Left Side Controls Group */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            justifyContent: { xs: "space-between", md: "flex-end" },
          }}
        >
          {/* New Items Filter - Positioned next to View Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            size="small"
            sx={{
              height: 40,
              "& .MuiToggleButton-root": {
                borderRadius: 2,
                px: 2,
                border: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <ToggleButton value="grid">
              <GridView fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              height: 24,
              alignSelf: "center",
              display: newItemsInView > 0 ? "block" : "none",
            }}
          />
          {newItemsInView > 0 && (
            <Chip
              label={`New (${newItemsInView})`}
              icon={<AutoAwesome sx={{ fontSize: "1rem !important" }} />}
              onClick={() => setShowOnlyNew(!showOnlyNew)}
              color={showOnlyNew ? "primary" : "default"}
              variant={showOnlyNew ? "filled" : "outlined"}
              sx={{
                fontWeight: 600,
                height: 40,
                borderRadius: 2,
                border: showOnlyNew
                  ? "none"
                  : `1px solid ${theme.palette.divider}`,
                transition: "all 0.2s ease",
              }}
            />
          )}
        </Box>

        {/* Search Bar */}
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
            sx: { borderRadius: 2 },
          }}
          sx={{ flexGrow: 1, maxWidth: { md: 400 } }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ "& .MuiTab-root": { fontWeight: 600, textTransform: "none" } }}
        >
          {categories.map((cat) => (
            <Tab key={cat} label={cat} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Fade in={true} key={`${activeTab}-${viewMode}`}>
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
