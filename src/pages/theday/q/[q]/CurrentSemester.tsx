import { useEffect, useState, useContext } from "react";
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SchoolIcon from "@mui/icons-material/School";

import { DataContext } from "../../../../context/TranscriptContext";

interface Props {
  currentSemester: number;
  handleClick: () => void;
  setOpen: (value: boolean) => void;
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
  const [allCourses, setAllCourses] = useState<{ name: string; abbreviation: string; semester: number }[]>([]);

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
    if (custom) {
      const abbrs = JSON.parse(custom);
      // Find the subject objects for these abbreviations
      if (transcript && 'semesters' in transcript) {
        const allSubjects = transcript.semesters.flatMap((sem: any) => sem.subjects);
        setSubjects(allSubjects.filter((subj: any) => abbrs.includes(subj.abbreviation)));
      }
    } else if (transcript && 'semesters' in transcript && transcript.semesters[currentSemester]) {
      setSubjects(transcript.semesters[currentSemester].subjects);
    }
  }, [transcript, currentSemester]);

  useEffect(() => {
    if (transcript && 'semesters' in transcript) {
      const courses: { name: string; abbreviation: string; semester: number }[] = [];
      transcript.semesters.forEach((sem: any, idx: number) => {
        sem.subjects.forEach((subj: any) => {
          courses.push({ ...subj, semester: idx + 1 });
        });
      });
      setAllCourses(courses);
    }
  }, [transcript]);

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
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: 20,
              color: textColor,
              mb: 0,
            }}
          >
            Semester {currentSemester}
          </Typography>
          <Tooltip title="Remove Shortcut Semester" disableInteractive>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{
                position: "absolute",
                right: "2%",
                "&:hover *": {
                  color: "#900",
                },
              }}
              onClick={() => {
                handleClick();
                localStorage.setItem("semester", "-1");
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

        <CardContent sx={{ pb: 2, px: 3, pt: 2 }}>
          <Grid container spacing={1}>
            {subjects?.map((subject, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
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
                    '&:hover': {
                      background: pillHoverBg,
                      color: theme.palette.mode === "dark" ? "#fff" : textColor,
                      boxShadow: "0 4px 16px 0 rgba(59,130,246,0.13)",
                      '& .MuiSvgIcon-root': {
                        color: theme.palette.mode === "dark" ? "#fff" : iconColor,
                      },
                    },
                    textDecoration: 'none',
                  }}
                  component="a"
                  href={`/subjects/${subject.abbreviation}`}
                >
                  <SchoolIcon sx={{ fontSize: 20, color: iconColor, mr: 1.5, transition: "color 0.18s" }} />
                  <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <b style={{ fontSize: 16, marginRight: 6, textDecoration: 'none' }}>{subject.abbreviation}</b>
                    </Box>
                    <Tooltip title={subject.name} arrow>
                      <span style={{
                        fontWeight: 400,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: "inherit",
                        textDecoration: 'none',
                      }}>
                        {subject.name}
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2, width: "100%", fontWeight: 700 }}
          onClick={() => {
            if (subjects) {
              setSelectedCourses(subjects.map((s) => s.abbreviation));
            }
            setCustomizeOpen(true);
          }}
        >
          Customize My Semester
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          sx={{ mt: 2, width: "100%", fontWeight: 700 }}
          onClick={() => {
            localStorage.removeItem("customSemesterSubjects");
            if (transcript && 'semesters' in transcript && transcript.semesters[currentSemester]) {
              setSubjects(transcript.semesters[currentSemester].subjects);
            }
          }}
        >
          Reset to Default Semester
        </Button>
      </Card>

      {/* Modal Dialog for Customizing Semester */}
      <Dialog open={customizeOpen} onClose={() => setCustomizeOpen(false)} maxWidth="sm" fullWidth>
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
          }}
        >
          Select Your Courses
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
          <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
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
                    background: theme.palette.mode === "dark" ? "#232b3e" : "#fff",
                    borderRadius: 3,
                    boxShadow: "0 2px 12px 0 rgba(59,130,246,0.07)",
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      background: theme.palette.mode === "dark" ? "#232b3e" : "#fff",
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
                            checked={selectedCourses.includes(course.abbreviation)}
                            onChange={(_, checked) => {
                              setSelectedCourses((prev) =>
                                checked
                                  ? [...prev, course.abbreviation]
                                  : prev.filter((abbr) => abbr !== course.abbreviation)
                              );
                            }}
                            sx={{
                              color: theme.palette.primary.main,
                              '&.Mui-checked': {
                                color: theme.palette.primary.main,
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          '&:hover': {
                            background: theme.palette.action.hover,
                          },
                          transition: 'background 0.2s',
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
              localStorage.setItem("customSemesterSubjects", JSON.stringify(selectedCourses));
              if (transcript && 'semesters' in transcript) {
                const allSubjects = transcript.semesters.flatMap((sem: any) => sem.subjects);
                setSubjects(allSubjects.filter((subj: any) => selectedCourses.includes(subj.abbreviation)));
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
    </Box>
  );
}
