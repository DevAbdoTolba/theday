import { useContext } from "react";
import { DataContext } from "../../../../context/TranscriptContext";
import { useTheme } from "@mui/material/styles";

import Box from "@mui/material/Box";
import data from "src/Data/data.json";
import Grid from "@mui/material/Grid";
import Zoom from "@mui/material/Zoom";
import { Chip, Tooltip, Typography, Card, CardContent, Divider } from "@mui/material";
import Link from "next/link";
import SchoolIcon from "@mui/icons-material/School";

interface Props {
  search: string;
  currentSemester: number;
}

export default function MainPc({ search, currentSemester }: Props) {
  const { transcript, loadingTranscript, error } = useContext(DataContext);
  const theme = useTheme();
  console.log("Transcript in MainPc:", transcript);

  return (
    <>
      <Box
        sx={{
          m: 2,
          display: {
            xs: "none",
            sm: "block",
          },
          background: theme.palette.background.paper,
          borderRadius: 3,
          p: 3,
        }}
      >
        <Grid container spacing={3}>
          {/*Filter for search
1-Semesters
2-Subjects
4-name
5-abbreviation
.filter?
*/}
          {/* @ts-ignore */}
          {transcript && 'semesters' in transcript && transcript.semesters
            .filter(
              (x: any) =>
                x.index !== currentSemester &&
                x.subjects.filter(
                  (y: any) =>
                    y?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                    y?.abbreviation
                      ?.toLowerCase()
                      .includes(search?.toLowerCase())
                ).length > 0
            )
            .map((item: any, index: any) => (
              <Grid key={index} item xs={12} sm={6} md={4}>
                <SemesterCard semester={item} />
              </Grid>
            ))}
        </Grid>
      </Box>
    </>
  );
}

interface SemesterCardProps {
  semester: {
    index: number;
    subjects: { name: string; abbreviation: string }[];
  };
}

function SemesterCard({ semester }: SemesterCardProps) {
  const theme = useTheme();
  const cardBg = theme.palette.background.paper;
  const headerBg = theme.palette.mode === "dark" ? "#232f55" : "#e3e8f7";
  const pillBg = theme.palette.mode === "dark" ? "#232b3e" : "#e3e8f7";
  const textColor = theme.palette.text.primary;
  const iconColor = theme.palette.mode === "dark" ? "#3b82f6" : "#2563eb";
  const pillHoverBg = theme.palette.mode === "dark" ? "#2563eb" : "#bcd0fa";

  return (
    <Card
      sx={{
        mb: 4,
        borderRadius: 2,
        boxShadow: "0 2px 16px 0 rgba(59,130,246,0.10)",
        background: cardBg,
        color: textColor,
        overflow: "visible",
        px: 0,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          background: headerBg,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          px: 2.5,
          py: 1.5,
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
          Semester {semester.index}
        </Typography>
      </Box>
      <CardContent sx={{ pb: 2, px: 3, pt: 2 }}>
        <Grid container spacing={1}>
          {semester.subjects.map((subject, idx) => (
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
                      {subject.name.length > 20
                        ? subject.name.slice(0, 20) + "..."
                        : subject.name}
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
