import { useContext } from "react";
import { DataContext } from "../../../../context/TranscriptContext";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
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
  
  return (
    <Box
      sx={{
        m: 2,
        display: {
          sm: "none",
          xs: "block",
        },
      }}
    >
      {transcript.semesters
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
              mb: 2,
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background: "rgba(26, 26, 26, 0.8)",
              backdropFilter: "blur(10px)",
              "&:before": {
                display: "none",
              },
              "&.Mui-expanded": {
                margin: "8px 0",
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                background: "linear-gradient(45deg, #0685da, #4FACFE)",
                "& .MuiAccordionSummary-content": {
                  margin: "12px 0",
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Semester {item.index}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {item.subjects
                  .filter(
                    (y: any) =>
                      y?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                      y?.abbreviation?.toLowerCase().includes(search?.toLowerCase())
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
                        <Chip
                          component={Link}
                          href={`/subjects/${subjects.abbreviation}`}
                          sx={{
                            width: "100%",
                            height: "auto",
                            padding: "12px 8px",
                            borderRadius: "12px",
                            fontSize: "1rem",
                            background: "rgba(6, 133, 218, 0.1)",
                            border: "1px solid rgba(6, 133, 218, 0.2)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              background: "rgba(6, 133, 218, 0.2)",
                            }
                          }}
                          className="subject__chip"
                          label={subjects.name}
                          clickable
                          onClick={() => {
                            localStorage.setItem(
                              "currentSemester",
                              index.toString()
                            );
                          }}
                        />
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