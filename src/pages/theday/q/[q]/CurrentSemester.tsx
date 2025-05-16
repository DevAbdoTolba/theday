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

  const { transcript, loadingTranscript, error } = useContext(DataContext);
  const theme = useTheme();

  const cardBg = theme.palette.background.paper;
  const headerBg = theme.palette.mode === "dark" ? "#232f55" : "#e3e8f7";
  const pillBg = theme.palette.mode === "dark" ? "#232b3e" : "#e3e8f7";
  const textColor = theme.palette.text.primary;
  const iconColor = theme.palette.mode === "dark" ? "#3b82f6" : "#2563eb";
  const pillHoverBg = theme.palette.mode === "dark" ? "#2563eb" : "#bcd0fa";

  useEffect(() => {
    if (transcript && 'semesters' in transcript && transcript.semesters[currentSemester]) {
      setSubjects(transcript.semesters[currentSemester].subjects);
    }
  }, [transcript, currentSemester]);

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
      </Card>
    </Box>
  );
}
