import YoutubePlayer from "./YoutubePlayer";
import VisualState from "./feedback/VisualState";
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Divider,
  Tooltip,
  alpha,
} from "@mui/material";
import { SubjectMaterials, ParsedFile } from "../utils/types";
import { parseGoogleFile } from "../utils/helpers";
import { FileCard } from "./FileCard";
import { FileListItem } from "./FileListItem";

// Dynamic imports for MUI icons
const Search = dynamic(() => import("@mui/icons-material/Search"), { ssr: false });
const SentimentDissatisfied = dynamic(() => import("@mui/icons-material/SentimentDissatisfied"), { ssr: false });
const GridView = dynamic(() => import("@mui/icons-material/GridView"), { ssr: false });
const ViewList = dynamic(() => import("@mui/icons-material/ViewList"), { ssr: false });
const AutoAwesome = dynamic(() => import("@mui/icons-material/AutoAwesome"), { ssr: false });
const VisibilityOutlined = dynamic(() => import("@mui/icons-material/VisibilityOutlined"), { ssr: false });
const StudyModeToggle = dynamic(() => import("./study/StudyModeToggle"), { ssr: false });

interface Props {
  data: SubjectMaterials;
  subjectName: string;
  newItems?: string[];
  fetching?: boolean;
  // Study Mode props
  studyModeActive?: boolean;
  onStudySelect?: (file: ParsedFile, category: string) => void;
}

export default function FileBrowser({
  data,
  subjectName,
  newItems = [],
  fetching = false,
  studyModeActive = false,
  onStudySelect,
}: Props) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [filter, setFilter] = useState("");
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [peekMode, setPeekMode] = useState(false);
  const [mobileExpandedCardId, setMobileExpandedCardId] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Study mode onboarding — hint label next to Study button
  const prevStudyMode = useRef(false);
  const [showHint, setShowHint] = useState(false);
  const [hintFading, setHintFading] = useState(false);

  const dismissHint = useCallback(() => {
    setHintFading(true);
    setTimeout(() => { setShowHint(false); setHintFading(false); }, 400);
  }, []);

  useEffect(() => {
    if (studyModeActive && !prevStudyMode.current) {
      setShowHint(true);
      setHintFading(false);
      const hintTimer = setTimeout(() => dismissHint(), 4000);
      prevStudyMode.current = true;
      return () => clearTimeout(hintTimer);
    }
    if (!studyModeActive) {
      setShowHint(false);
      setHintFading(false);
      prevStudyMode.current = false;
    }
  }, [studyModeActive, dismissHint]);

  // Categories
  const categories = useMemo(() => ["All", ...Object.keys(data)], [data]);

  // Flatten and Filter
  const filteredFiles = useMemo(() => {
    const currentCategory = categories[activeTab];
    let files: { file: ParsedFile; category: string }[];
    if (currentCategory === "All") {
      files = Object.entries(data).flatMap(([cat, driveFiles]) =>
        driveFiles.map(parseGoogleFile).map((f) => ({ file: f, category: cat }))
      );
    } else {
      files = (data[currentCategory] || [])
        .map(parseGoogleFile)
        .map((f) => ({ file: f, category: currentCategory }));
    }

    // Apply text filter
    let filtered = files;
    if (filter) {
      const lf = filter.toLowerCase();
      filtered = filtered.filter((entry) =>
        entry.file.name.toLowerCase().includes(lf)
      );
    }

    // Apply "new items only" filter
    if (showOnlyNew) {
      filtered = filtered.filter((entry) => newItems.includes(entry.file.id));
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
    <Box 
      sx={{ width: "100%" }}
      onClick={() => {
        // Collapse any expanded mobile card when clicking away
        if (mobileExpandedCardId) {
          setMobileExpandedCardId(null);
        }
      }}
    >
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
          {/* View Mode Toggle - Grid/List */}
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

          {/* Peek Mode Toggle - Only show in grid mode on desktop */}
          {viewMode === "grid" && (
            <Tooltip title={peekMode ? "Peek Mode ON: Click to preview" : "Enable Peek Mode for quick preview"}>
              <ToggleButton
                value="peek"
                selected={peekMode}
                onChange={() => setPeekMode(!peekMode)}
                size="small"
                sx={{
                  height: 40,
                  px: 2,
                  borderRadius: 2,
                  border: `1px solid ${peekMode ? theme.palette.primary.main : theme.palette.divider}`,
                  bgcolor: peekMode ? `${theme.palette.primary.main}15` : "transparent",
                  display: { xs: "none", md: "flex" },
                  "&:hover": {
                    bgcolor: peekMode ? `${theme.palette.primary.main}25` : "rgba(0,0,0,0.04)",
                  },
                }}
              >
                <VisibilityOutlined fontSize="small" color={peekMode ? "primary" : "action"} />
              </ToggleButton>
            </Tooltip>
          )}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: 24, alignSelf: "center", mx: 0.5 }}
          />
          <StudyModeToggle />
          {showHint && (
            <Chip
              label="Tap items to add"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.10),
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 28,
                animation: hintFading
                  ? 'studyHintOut 0.4s ease forwards'
                  : 'studyHintIn 0.5s ease forwards',
              }}
            />
          )}
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

      {/* Content with simple GPU-accelerated transition */}
      <Box
        key={activeTab}
        sx={{
          minHeight: 200,
          opacity: 1,
          willChange: 'opacity',
          animation: 'simpleAppear 0.2s ease-out',
          '@keyframes simpleAppear': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
        }}
      >
          {filteredFiles.length > 0 ? (
            viewMode === "grid" ? (
              <Grid container spacing={2}>
                {filteredFiles.map((entry, index) => (
                  <Grid item xs={6} sm={6} md={4} lg={3} key={entry.file.id}>
                    <FileCard
                      file={entry.file}
                      onClick={() => handleFileClick(entry.file)}
                      isNew={newItems.includes(entry.file.id)}
                      peekMode={peekMode}
                      mobileExpandedId={mobileExpandedCardId}
                      onMobileExpand={setMobileExpandedCardId}
                      gridPosition={index % 2 === 0 ? 'left' : 'right'}
                      studyModeActive={studyModeActive}

                      onStudySelect={(file) => { if (showHint) dismissHint(); onStudySelect?.(file, entry.category); }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box>
                {filteredFiles.map((entry) => (
                  <FileListItem
                    key={entry.file.id}
                    file={entry.file}
                    onClick={() => handleFileClick(entry.file)}
                    isNew={newItems.includes(entry.file.id)}
                    studyModeActive={studyModeActive}

                    onStudySelect={(file) => { if (showHint) dismissHint(); onStudySelect?.(file, entry.category); }}
                  />
                ))}
              </Box>
            )
          ) : (
            <VisualState type="empty" message="No materials found." />
          )}
      </Box>

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
