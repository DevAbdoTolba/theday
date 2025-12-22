import { useEffect, useState, useContext, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tooltip,
  IconButton,
  Zoom,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  TextField,
  Alert,
  Fade,
  Divider,
  DialogContentText,
  Paper,
  Tab,
  Tabs,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SchoolIcon from "@mui/icons-material/School";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckIcon from "@mui/icons-material/Check";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Link from "next/link";

import { DataContext } from "../../../../context/TranscriptContext";

interface Props {
  currentSemester: number;
  handleClick: () => void;
  setOpen: (value: boolean) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CurrentSemester({
  currentSemester,
  handleClick,
  setOpen,
}: Props) {
  const [subjects, setSubjects] = useState<
    {
      name: string;
      abbreviation: string;
    }[]
  >();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [initialSelectedCourses, setInitialSelectedCourses] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<
    { name: string; abbreviation: string; semester: number }[]
  >([]);
  const [hasCustomSubjects, setHasCustomSubjects] = useState(false);
  const [emptyCustomSubjects, setEmptyCustomSubjects] = useState(false);
  const [semesterName, setSemesterName] = useState(
    `Semester ${currentSemester}`
  );
  const [editingSemesterName, setEditingSemesterName] = useState(false);
  const [isSpecialCustomSemester, setIsSpecialCustomSemester] = useState(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [isFirstTimeCustomize, setIsFirstTimeCustomize] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const customizeButtonRef = useRef<HTMLButtonElement>(null);
  const customizeIconRef = useRef<HTMLButtonElement>(null);

  const { transcript, loadingTranscript, error } = useContext(DataContext);
  const theme = useTheme();

  const cardBg = theme.palette.background.paper;
  const headerBg = theme.palette.mode === "dark" ? "#232f55" : "#e3e8f7";
  const pillBg = theme.palette.mode === "dark" ? "#232b3e" : "#e3e8f7";
  const textColor = theme.palette.text.primary;
  const iconColor = theme.palette.mode === "dark" ? "#3b82f6" : "#2563eb";
  const pillHoverBg = theme.palette.mode === "dark" ? "#2563eb" : "#bcd0fa";

  useEffect(() => {
    const custom = localStorage.getItem("customSemesterSubjects");
    const customName = localStorage.getItem("customSemesterName");
    
    // Check and initialize firstTimeCustomize flag
    const firstTimeCustomize = localStorage.getItem("firstTimeCustomizeSemester");
    
    if (!firstTimeCustomize) {
      // If flag doesn't exist in localStorage, this is first time - set the state to true
      setIsFirstTimeCustomize(true);
      // But don't set in localStorage yet - we'll do that when they click the customize button
    } else {
      // Flag already exists, not first time anymore
      setIsFirstTimeCustomize(false);
    }
    
    // Check if this is a special custom semester
    const semesterStatus = localStorage.getItem("semester");
    const isSpecialSemester = semesterStatus === "-2";
    setIsSpecialCustomSemester(isSpecialSemester);
    
    if (customName) {
      setSemesterName(customName);
    } else if (isSpecialSemester) {
      // Default name for special custom semester
      setSemesterName("Special for you 🌹");
      // Save it to localStorage for consistency
      localStorage.setItem("customSemesterName", "Special for you 🌹");
    } else {
      setSemesterName(`Semester ${currentSemester}`);
    }// Check if we're in a special custom semester
 
    
    if (custom || isSpecialSemester) {
      // Handle both normal custom subjects and our special custom semester
      const abbrs = JSON.parse(custom || "[]");
      setHasCustomSubjects(true);
      setEmptyCustomSubjects(abbrs.length === 0);

      // Find the subject objects for these abbreviations
      if (transcript && "semesters" in transcript) {
        const allSubjects = transcript.semesters.flatMap(
          (sem: any) => sem.subjects
        );
        setSubjects(
          allSubjects.filter((subj: any) => abbrs.includes(subj.abbreviation))
        );
      }
      
      // If this is our special custom semester, make sure the semester name is set correctly
      if (isSpecialSemester && !localStorage.getItem("customSemesterName")) {
        setSemesterName("Special for you 🌹");
      }
    } else {
      setHasCustomSubjects(false);
      setEmptyCustomSubjects(false);
      
      if (
        transcript &&
        "semesters" in transcript &&
        transcript.semesters[currentSemester]
      ) {
        setSubjects(transcript.semesters[currentSemester].subjects);
      }
    }
  }, [transcript, currentSemester]);

  useEffect(() => {
    if (transcript && "semesters" in transcript) {
      const courses: {
        name: string;
        abbreviation: string;
        semester: number;
      }[] = [];
      transcript.semesters.forEach((sem: any, idx: number) => {
        sem.subjects.forEach((subj: any) => {
          courses.push({ ...subj, semester: idx + 1 });
        });
      });
      setAllCourses(courses);
    }
  }, [transcript]);

  // Show tooltip after delay for customize icon animation
  useEffect(() => {
    // check local stroage for first time customize
    const firstTimeCustomize = localStorage.getItem(
      "firstTimeCustomizeSemester"
    );
    // If the customize icon is not in the DOM yet, we can't show the tooltip
    if (firstTimeCustomize === "shown") return;
    // Show tooltip after 4 seconds
    const timer = setTimeout(() => {
      setShowTooltip(true);

      // // Auto hide after 6 seconds
      // const hideTimer = setTimeout(() => {
      //   setShowTooltip(false);
      // }, 6000);

      return () => setShowTooltip(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleResetCustomSemester = () => {
    localStorage.removeItem("customSemesterSubjects");
    localStorage.removeItem("customSemesterName");
    setSemesterName(`Semester ${currentSemester}`);
    setHasCustomSubjects(false);
    setEmptyCustomSubjects(false);
    setIsSpecialCustomSemester(false);

    if (
      transcript &&
      "semesters" in transcript &&
      transcript.semesters[currentSemester]
    ) {
      setSubjects(transcript.semesters[currentSemester].subjects);
    }

    setResetDialogOpen(false);
  };

  const handleSaveSemesterName = () => {
    // Prevent empty semester name
    if (!semesterName.trim()) {
      setSemesterName(`Semester ${currentSemester}`);
    }

    localStorage.setItem(
      "customSemesterName",
      semesterName.trim() || `Semester ${currentSemester}`
    );
    setEditingSemesterName(false);
  };

  const handleCustomizeClick = () => {
    if (isFirstTimeCustomize) {
      // First time user is accessing customize feature
      setHelpDialogOpen(true);
      // Mark that user has seen the help dialog
      localStorage.setItem("firstTimeCustomizeSemester", "shown");
      setIsFirstTimeCustomize(false);
    } else {
      // Regular customize flow
      if (subjects) {
        const currentSelection = subjects.map(s => s.abbreviation);
        setSelectedCourses(currentSelection);
        setInitialSelectedCourses(currentSelection); // Save initial selection for comparison
      }
      setCustomizeOpen(true);
    }
    setShowTooltip(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        maxWidth: { sm: "80%", xs: "100%" },
        p: "2rem 0",
        mb: {
          sm: 1,
          xs: 0,
        },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          mb: 1,
          borderRadius: 1,
          boxShadow: "0 2px 16px 0 rgba(59,130,246,0.10)",
          background: cardBg,
          color: textColor,
          overflow: "visible",
          px: 0,
          width: { sm: "100%", xs: "100%" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            background: headerBg,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2.5,
            py: 1.5,
            position: "relative",
          }}
        >
          <SchoolIcon sx={{ mr: 1, fontSize: 24, color: iconColor }} />

          {editingSemesterName ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TextField
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                size="small"
                variant="standard"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveSemesterName();
                  }
                }}
                error={!semesterName.trim()}
                helperText={!semesterName.trim() ? "Name cannot be empty" : ""}
                sx={{
                  fontWeight: 800,
                  fontSize: 20,
                  color: textColor,
                  mb: 0,
                  width: 200,
                }}
                inputProps={{
                  style: { fontWeight: 800, fontSize: 20 },
                  // Add this for mobile devices to show the "done" button on virtual keyboard
                  enterKeyHint: "done",
                }}
                // Add this for form submission handling on mobile
                onBlur={handleSaveSemesterName}
              />
              <IconButton
                onClick={handleSaveSemesterName}
                size="small"
                sx={{ ml: 1 }}
              >
                <CheckIcon sx={{ fontSize: 18, color: iconColor }} />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: 20,
                  color: textColor,
                  mb: 0,
                }}
              >
                {semesterName}
              </Typography>
              <Tooltip
                disableInteractive
                title="Rename"
                placement="top"
                arrow
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor:
                        theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
                      color: theme.palette.mode === "dark" ? "#fff" : "#000",
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 1.5,

                      boxShadow: "0 4px 16px 0 rgba(0,0,0,0.15)",
                      maxWidth: 300,
                    },
                  },
                  arrow: {
                    sx: {
                      color:
                        theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
                    },
                  },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setEditingSemesterName(true)}
                  sx={{
                    ml: 1,
                    color: iconColor,
                    "&:hover": { backgroundColor: "rgba(59,130,246,0.08)" },
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          <Box
            sx={{
              position: "absolute",
              right: "2%",
              display: "flex",
              alignItems: "center",
              gap: 1, // Add consistent gap between buttons
            }}
          >
            {/* Only show reset button for custom semester but not special custom semester */}
            {hasCustomSubjects && !isSpecialCustomSemester && (
              <Tooltip
                disableInteractive
                title="Reset to Default Semester"
                placement="top"
                arrow
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor:
                        theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
                      color: theme.palette.mode === "dark" ? "#fff" : "#000",
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 1.5,
                      boxShadow: "0 4px 16px 0 rgba(0,0,0,0.15)",
                      maxWidth: 300,
                    },
                  },
                  arrow: {
                    sx: {
                      color:
                        theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
                    },
                  },
                }}
              >
                <IconButton
                  color="inherit"
                  onClick={() => setResetDialogOpen(true)}
                  sx={{
                    "&:hover *": {
                      color: theme.palette.warning.main,
                    },
                  }}
                >
                  <RestartAltIcon
                    sx={{
                      color: textColor,
                      cursor: "pointer",
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}

            {/* First tooltip for normal hover behavior */}
            <Tooltip
              title="Customize your semester to make it personal to you!!!"
              placement="bottom"
              arrow
              disableInteractive
              slotProps={{
                tooltip: {
                  
                  sx: {
                    display: showTooltip ? "none" : "block", // Hide when animated tooltip is active
                    bgcolor:
                      theme.palette.mode === "dark" ? "#3b82f6" : "#e3e8f7",
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    fontSize: 14,
                    fontWeight: 500,
                    borderRadius: 1.5,
                    p: 1.5,
                    boxShadow: "0 4px 16px 0 rgba(0,0,0,0.15)",
                    maxWidth: 300,
                  },
                },
                arrow: {
                  sx: {
                    color:
                      theme.palette.mode === "dark" ? "#3b82f6" : "#e3e8f7",
                  },
                },
              }}
            >
              <Box>
                {/* Second tooltip for animation - controlled by showTooltip state */}
                <Tooltip
                  title="Customize your semester to make it personal to you!"
                  placement="bottom"
                  arrow
                  open={showTooltip}
                  TransitionComponent={Zoom}
                  TransitionProps={{ timeout: 200 }}
                  PopperProps={{
                    sx: {
                      display: showTooltip ? "block" : "none", // Show only when animated tooltip is active
                      zIndex: 1100, // Higher z-index for the animated tooltip to ensure it's on top
                    },
                  }}
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor:
                          theme.palette.mode === "dark" ? "#3b82f6" : "#e3e8f7",
                        color: theme.palette.mode === "dark" ? "#fff" : "#000",
                        fontSize: 14,
                        fontWeight: 500,
                        borderRadius: 1.5,
                        p: 1.5,
                        boxShadow: "0 4px 16px 0 rgba(0,0,0,0.15)",
                        maxWidth: 300,
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%": {
                            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.7)",
                          },
                          "70%": {
                            boxShadow: "0 0 0 10px rgba(59, 130, 246, 0)",
                          },
                          "100%": {
                            boxShadow: "0 0 0 0 rgba(59, 130, 246, 0)",
                          },
                        },
                      },
                    },
                    arrow: {
                      sx: {
                        color:
                          theme.palette.mode === "dark" ? "#3b82f6" : "#e3e8f7",
                      },
                    },
                  }}
                >
                  <IconButton
                    ref={customizeIconRef}
                    color="inherit"
                    onClick={handleCustomizeClick}
                    sx={{
                      animation: showTooltip
                        ? "bounceAndGlow 0.6s infinite alternate"
                        : "none",
                      "@keyframes bounceAndGlow": {
                        "0%": {
                          transform: "scale(1)",
                          boxShadow: "0 0 0 rgba(37, 99, 235, 0)",
                        },
                        "100%": {
                          transform: "scale(1.3)",
                          boxShadow: "0 0 15px rgba(37, 99, 235, 0.8)",
                        },
                      },
                      borderRadius: "50%",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(37, 99, 235, 0.2)"
                            : "rgba(37, 99, 235, 0.1)",
                        "& .MuiSvgIcon-root": {
                          color: theme.palette.primary.main,
                        },
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <SettingsIcon
                      sx={{
                        color: showTooltip
                          ? theme.palette.primary.main
                          : iconColor,
                        cursor: "pointer",
                        fontSize: 24,
                        transition: "color 0.3s ease",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </Tooltip>

            <Tooltip
              disableInteractive
              title="Remove Shortcut Semester"
              placement="top"
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor:
                      theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    fontSize: 14,
                    fontWeight: 500,
                    borderRadius: 1.5,

                    boxShadow: "0 4px 16px 0 rgba(0,0,0,0.15)",
                    maxWidth: 300,
                  },
                },
                arrow: {
                  sx: {
                    color:
                      theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
                  },
                },
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                sx={{
                  "&:hover *": {
                    color: "#900",
                  },
                  m: 0,
                }}
                onClick={() => {
                  handleClick();
                  localStorage.setItem("semester", "-1");
                  localStorage.removeItem("customSemesterName");
                  localStorage.removeItem("customSemesterSubjects");
                  localStorage.removeItem("firstTimeCustomizeSemester");
                }}
              >
                <RemoveCircleOutlineIcon
                  sx={{
                    color: textColor,
                    cursor: "pointer",
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardContent sx={{ pb: 2, px: 3, pt: 2 }}>
          {emptyCustomSubjects ? (
            <Alert
              severity="info"
              icon={<SettingsIcon fontSize="inherit" />}
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: "0 2px 12px rgba(59,130,246,0.1)",
              }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleCustomizeClick}
                >
                  Add Subjects
                </Button>
              }
            >
              Please select subjects to be added in your shortcut menu.
            </Alert>
          ) : (
            <Grid container spacing={1}>
              {subjects?.map((subject, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <Tooltip
                    title={subject.name}
                    slotProps={{
                      tooltip: {
                        sx: {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#1e293b"
                              : "#e3e8f7",
                          color:
                            theme.palette.mode === "dark" ? "#fff" : "#000",
                          fontSize: 14,
                          fontWeight: 500,
                          borderRadius: 1.5,
                          border:
                            theme.palette.mode === "dark"
                              ? "0.1ch solid #fff"
                              : "0.1ch solid #000",

                          boxShadow: "0 4px 16px 0 rgba(0,0,0,0.15)",
                          maxWidth: 300,
                        },
                      },
                      arrow: {
                        sx: {
                          color:
                            theme.palette.mode === "dark"
                              ? "#1e293b"
                              : "#e3e8f7",
                        },
                      },
                    }}
                  >
                    <Link
                      href={`/subjects/${subject.abbreviation}`}
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          background: pillBg,
                          borderRadius: 1,
                          px: 2,
                          py: 1.2,
                          boxShadow: "0 1px 4px 0 rgba(59,130,246,0.08)",
                          mb: 1,
                          fontWeight: 600,
                          fontSize: 15,
                          color: textColor,
                          minHeight: 56,
                          transition: "all 0.18s",
                          cursor: "pointer",
                          "&:hover": {
                            background: pillHoverBg,
                            color:
                              theme.palette.mode === "dark" ? "#fff" : textColor,
                            boxShadow: "0 4px 16px 0 rgba(59,130,246,0.13)",
                            "& .MuiSvgIcon-root": {
                              color:
                                theme.palette.mode === "dark"
                                  ? "#fff"
                                  : iconColor,
                            },
                          },
                        }}
                      >
                        <SchoolIcon
                          sx={{
                            fontSize: 20,
                            color: iconColor,
                            mr: 1.5,
                            transition: "color 0.18s",
                          }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                            minWidth: 0,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <b
                              style={{
                                fontSize: 16,
                                marginRight: 6,
                                textDecoration: "none",
                              }}
                            >
                              {subject.abbreviation}
                            </b>
                          </Box>

                          <span
                            style={{
                              fontWeight: 400,
                              fontSize: 14,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: "inherit",
                              textDecoration: "none",
                            }}
                          >
                            {subject.name}
                          </span>
                        </Box>
                      </Box>
                    </Link>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>

        {/* Removing the large customization button and keeping only the icon in header */}
      </Card>
      {/* Modal Dialog for Customizing Semester */}
      <Dialog
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: 1,
            color: theme.palette.primary.main,
            background: theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            mb: 1,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Select Your Courses</span>
          <Tooltip
            disableInteractive
            title="Help"
            placement="top"
            slotProps={{
              tooltip: {
                sx: {
                  bgcolor:
                    theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
                  color: theme.palette.mode === "dark" ? "#fff" : "#000",
                  fontSize: 14,
                  fontWeight: 500,
                  borderRadius: 1.5,
                  border:
                    theme.palette.mode === "dark"
                      ? "0.1ch solid #fff"
                      : "0.1ch solid #000",

                  boxShadow: "0 4px 16px 0 rgba(0,0,0,0.15)",
                  maxWidth: 300,
                },
              },
              arrow: {
                sx: {
                  color: theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
                },
              },
            }}
          >
            <IconButton onClick={() => setHelpDialogOpen(true)}>
              <HelpOutlineIcon color="primary" />
            </IconButton>
          </Tooltip>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            background: theme.palette.mode === "dark" ? "#181f33" : "#f7fafd",
            px: { xs: 0.5, sm: 2 },
            py: 2,
            minHeight: 300,
            maxHeight: 500,
          }}
        >
          <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
            {Object.entries(
              allCourses.reduce((acc, course) => {
                acc[course.semester] = acc[course.semester] || [];
                acc[course.semester].push(course);
                return acc;
              }, {} as { [key: number]: typeof allCourses })
            )
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([semester, courses]) => (
                <Box
                  key={semester}
                  sx={{
                    mb: 3,
                    background:
                      theme.palette.mode === "dark" ? "#232b3e" : "#fff",
                    borderRadius: 3,
                    boxShadow: "0 2px 12px 0 rgba(59,130,246,0.07)",
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      background:
                        theme.palette.mode === "dark" ? "#232b3e" : "#fff",
                      py: 1,
                      px: 1,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: 18,
                      color: theme.palette.primary.main,
                      boxShadow: "0 1px 6px 0 rgba(59,130,246,0.04)",
                      mb: 1.5,
                      letterSpacing: 0.5,
                    }}
                  >
                    Semester {semester}
                  </Box>
                  <Box sx={{ pl: 1, pt: 1 }}>
                    {courses.map((course) => (
                      <FormControlLabel
                        key={course.abbreviation + course.semester}
                        control={
                          <Checkbox
                            checked={selectedCourses.includes(
                              course.abbreviation
                            )}
                            onChange={(_, checked) => {
                              setSelectedCourses((prev) =>
                                checked
                                  ? [...prev, course.abbreviation]
                                  : prev.filter(
                                      (abbr) => abbr !== course.abbreviation
                                    )
                              );
                            }}
                            sx={{
                              color: theme.palette.primary.main,
                              "&.Mui-checked": {
                                color: theme.palette.primary.main,
                              },
                            }}
                          />
                        }
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography fontWeight={700} fontSize={15}>
                              {course.abbreviation}
                            </Typography>
                            <Typography color="text.secondary" fontSize={13}>
                              {course.name}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          mb: 0.5,
                          borderRadius: 2,
                          px: 1,
                          py: 0.5,
                          "&:hover": {
                            background: theme.palette.action.hover,
                          },
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            background: theme.palette.mode === "dark" ? "#232b3e" : "#e3e8f7",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            py: 2,
            px: 3,
          }}
        >
          <Button onClick={() => setCustomizeOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              // Check if the selection has actually changed
              const hasSelectionChanged = 
                selectedCourses.length !== initialSelectedCourses.length || 
                selectedCourses.some(course => !initialSelectedCourses.includes(course)) ||
                initialSelectedCourses.some(course => !selectedCourses.includes(course));
                
              if (hasSelectionChanged) {
                localStorage.setItem(
                  "customSemesterSubjects",
                  JSON.stringify(selectedCourses)
                );
                
                if (transcript && "semesters" in transcript) {
                  const allSubjects = transcript.semesters.flatMap(
                    (sem: any) => sem.subjects
                  );
                  setSubjects(
                    allSubjects.filter((subj: any) =>
                      selectedCourses.includes(subj.abbreviation)
                    )
                  );
                  setHasCustomSubjects(true);
                  setEmptyCustomSubjects(selectedCourses.length === 0);
                }
              } else {
                console.log("No changes detected in course selection, skipping save");
              }
              
              setOpen(false);
              setCustomizeOpen(false);
            }}
            variant="contained"
            color="primary"
            sx={{ fontWeight: 700, px: 4 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirmation Dialog for Reset */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle
          sx={{
            fontWeight: 700,
            backgroundColor:
              theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
            color: theme.palette.primary.main,
          }}
        >
          Reset Custom Semester?
        </DialogTitle>
        <DialogContent sx={{ pt: 2, mt: 1, minWidth: 300 }}>
          <Typography>
            This will restore the default semester courses and remove your
            customizations. Are you sure?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setResetDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleResetCustomSemester}
            variant="contained"
            color="warning"
            startIcon={<RestartAltIcon />}
          >
            Reset
          </Button>
        </DialogActions>
      </Dialog>
      {/* Help Dialog in both languages */}
      <Dialog
        open={helpDialogOpen}
        onClose={() => {
          setHelpDialogOpen(false);
          if (isFirstTimeCustomize) {
            if (subjects) {
              setSelectedCourses(subjects.map((s) => s.abbreviation));
            }
            setCustomizeOpen(true);
          }
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            backgroundColor:
              theme.palette.mode === "dark" ? "#1e293b" : "#e3e8f7",
            color: theme.palette.primary.main,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Customize Semester Helper</span>
          <Paper elevation={0} sx={{ bgcolor: "background.paper" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="English" />
              <Tab label="العربية" />
            </Tabs>
          </Paper>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                How to Customize Your Semester
              </Typography>
              <Typography paragraph>
                The semester customization feature allows you to create your own
                personalized view of subjects from any semester.
              </Typography>

              <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                Features:
              </Typography>
              <Typography component="div">
                <ul>
                  <li>
                    Select courses from any semester to display in your shortcut
                    menu
                  </li>
                  <li>Rename your semester to anything you want</li>
                  <li>Easily reset to the default semester view when needed</li>
                  <li>
                    Quick access to all your important subjects in one place
                  </li>
                </ul>
              </Typography>

              <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                How to use:
              </Typography>
              <Typography paragraph>
                1. Click on the checkboxes next to the courses you want to
                include
                <br />
                2. Click &quot;Save&quot; to create your custom semester view
                <br />
                3. Your selections will be remembered whenever you return
              </Typography>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(66, 153, 225, 0.08)"
                      : "rgba(66, 153, 225, 0.05)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{ fontStyle: "italic", color: "text.secondary" }}
                >
                  Tip: You can always modify your custom semester by clicking on
                  the settings icon in the top right corner.
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 2, py: 1 }} dir="rtl">
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                كيفية تخصيص الفصل الدراسي الخاص بك
              </Typography>
              <Typography paragraph>
                تتيح لك ميزة تخصيص الفصل الدراسي إنشاء عرض مخصص للمواد من أي فصل
                دراسي.
              </Typography>

              <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                الميزات:
              </Typography>
              <Typography component="div">
                <ul>
                  <li>
                    اختر المقررات من أي فصل دراسي لعرضها في قائمة الاختصارات
                  </li>
                  <li>أعد تسمية الفصل الدراسي الخاص بك إلى أي شيء تريده</li>
                  <li>
                    إعادة التعيين بسهولة إلى عرض الفصل الدراسي الافتراضي عند
                    الحاجة
                  </li>
                  <li>وصول سريع إلى جميع المواد المهمة في مكان واحد</li>
                </ul>
              </Typography>

              <Typography sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                كيفية الاستخدام:
              </Typography>
              <Typography paragraph>
                1. انقر على مربعات الاختيار بجانب المقررات التي تريد تضمينها
                <br />
                2. انقر على &quot;حفظ&quot; لإنشاء عرض الفصل الدراسي المخصص
                الخاص بك
                <br />
                3. سيتم تذكر اختياراتك عند العودة
              </Typography>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(66, 153, 225, 0.08)"
                      : "rgba(66, 153, 225, 0.05)",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{ fontStyle: "italic", color: "text.secondary" }}
                >
                  نصيحة: يمكنك دائمًا تعديل الفصل الدراسي المخصص الخاص بك بالنقر
                  على أيقونة الإعدادات في الزاوية العلوية اليمنى.
                </Typography>
              </Box>
            </Box>
          </TabPanel>
        </DialogContent>
        <DialogActions
          sx={{
            background: theme.palette.mode === "dark" ? "#232b3e" : "#e3e8f7",
            p: 2,
          }}
        >
          {isFirstTimeCustomize ? (
            <Button
              onClick={() => {
                setHelpDialogOpen(false);
                if (subjects) {
                  setSelectedCourses(subjects.map((s) => s.abbreviation));
                }
                setCustomizeOpen(true);
              }}
              variant="contained"
              color="primary"
              autoFocus
              sx={{ fontWeight: 600 }}
            >
              Continue to Customization
            </Button>
          ) : (
            <Button
              onClick={() => setHelpDialogOpen(false)}
              variant="contained"
              color="primary"
              autoFocus
              sx={{ fontWeight: 600 }}
            >
              Got it!
            </Button>
          )}{" "}
        </DialogActions>{" "}
      </Dialog>{" "}
    </Box>
  );
}
