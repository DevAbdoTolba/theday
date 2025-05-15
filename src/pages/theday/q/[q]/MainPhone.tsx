import { useContext } from "react";
import { DataContext } from "../../../../context/TranscriptContext";
import { useTheme } from "@mui/material/styles";

import Box from "@mui/material/Box";
import data from "src/Data/data.json";
import Grid from "@mui/material/Grid";
import Dialog from "./Dialog";
import Zoom from "@mui/material/Zoom";
import { Chip, Tooltip, Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";

interface Props {
  search: string;
  currentSemester: number;
}

function MainPhone({ search, currentSemester }: Props) {
  const { transcript, loadingTranscript, error } = useContext(DataContext);
  const theme = useTheme();
  console.log("Transcript in MainPhone:", transcript);
  return (
    <Box
      sx={{
        m: 2,
        display: {
          sm: "none",
          xs: "block",
        },
        background: theme.palette.background.paper,
        minHeight: "100vh",
        borderRadius: 2,
        p: 1,
      }}
    >
      {/* @ts-ignore */}
      {transcript && 'semesters' in transcript && transcript.semesters
        .filter(
          (x: any) =>
            x.subjects.filter(
              (y: any) =>
                y?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                y?.abbreviation?.toLowerCase().includes(search?.toLowerCase())
            ).length > 0
        )
        .map((item: any, index: any) => (
          <Accordion
            key={index}
            sx={{
              mb: 3,
              background: theme.palette.mode === "dark" ? "#19223c" : "#e3e8f7",
              borderRadius: 2,
              border: theme.palette.mode === "dark" ? "1px solid #232b3e" : "1px solid #bcd0fa",
              boxShadow: "0 2px 12px 0 rgba(59,130,246,0.10)",
              color: theme.palette.text.primary,
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.mode === "dark" ? '#3b82f6' : '#2563eb' }} />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              sx={{
                background: theme.palette.mode === "dark" ? "#232f55" : "#2563eb",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                px: 2,
                py: 1.2,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 18, color: theme.palette.mode === "dark" ? '#fff' : '#fff' }}>Semester {item.index}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ background: theme.palette.mode === "dark" ? "#151a2c" : "#fff", borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
              <Grid container spacing={1} sx={{ marginBottom: 1 }}>
                {item.subjects
                  .filter(
                    (y: any) =>
                      y?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                      y?.abbreviation
                        ?.toLowerCase()
                        .includes(search?.toLowerCase())
                  )
                  .map((subjects: any, subIndex: any) => (
                    <Grid key={subIndex} item xs={12}>
                      <Tooltip
                        title={subjects?.name}
                        arrow
                        TransitionComponent={Zoom}
                        disableInteractive
                        disableHoverListener
                        disableFocusListener
                        disableTouchListener
                      >
                        <Box
                          component={Link}
                          href={`/subjects/${subjects.abbreviation}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            background: theme.palette.mode === "dark" ? "#232b3e" : "#e3e8f7",
                            borderRadius: 1,
                            px: 2,
                            py: 1.2,
                            boxShadow: "0 1px 4px 0 rgba(59,130,246,0.08)",
                            mt: 1.5,
                            mb: .5,
                            fontWeight: 600,
                            fontSize: 15,
                            color: theme.palette.text.primary,
                            minHeight: 48,
                            transition: "all 0.18s",
                            cursor: "pointer",
                            textDecoration: 'none',
                            '&:hover': {
                              background: theme.palette.mode === "dark" ? '#2563eb' : '#bcd0fa',
                              color: theme.palette.mode === "dark" ? '#fff' : theme.palette.text.primary,
                              boxShadow: '0 4px 16px 0 rgba(59,130,246,0.13)',
                            },
                          }}
                        >
                          <b style={{ fontSize: 15, marginRight: 8, textDecoration: 'none' }}>{subjects.abbreviation}</b>
                          <span style={{
                            fontWeight: 400,
                            fontSize: 14,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: "inherit",
                            textDecoration: 'none',
                          }}>
                            {subjects.name.length > 20
                              ? subjects.name.slice(0, 20) + "..."
                              : subjects.name}
                          </span>
                        </Box>
                      </Tooltip>
                    </Grid>
                  ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
    </Box>
  );
}

export default MainPhone;
