import { useContext } from "react";
import { DataContext } from "../../../../context/TranscriptContext";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Zoom from "@mui/material/Zoom";
import { Chip, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import Link from "next/link";

interface Props {
  search: string;
  currentSemester: number;
}

export default function MainPc({ search, currentSemester }: Props) {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A1A1A" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(3),
    textAlign: "center",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    }
  }));

  const { transcript, loadingTranscript, error } = useContext(DataContext);

  return (
    <Box
      sx={{
        m: 4,
        display: {
          xs: "none",
          sm: "block",
        },
      }}
    >
      <Grid container spacing={3}>
        {transcript.semesters
          .filter(
            (x: any) =>
              x.index !== currentSemester &&
              x.subjects.filter(
                (y: any) =>
                  y?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                  y?.abbreviation?.toLowerCase().includes(search?.toLowerCase())
              ).length > 0
          )
          .map((item: any, index: any) => (
            <Grid key={index} item xs={12} md={6} lg={4}>
              <Item>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3,
                    color: "#fff",
                    fontWeight: 600,
                    background: "linear-gradient(45deg, #0685da, #4FACFE)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    display: "inline-block"
                  }}
                >
                  Semester {item.index}
                </Typography>
                <Grid 
                  container 
                  spacing={2} 
                  sx={{ 
                    mb: 3,
                    justifyContent: "center"
                  }}
                >
                  {item.subjects
                    .filter(
                      (y: any) =>
                        y?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                        y?.abbreviation?.toLowerCase().includes(search?.toLowerCase())
                    )
                    .map((subjects: any, subIndex: any) => (
                      <Grid key={subIndex} item xs={12} sm={6}>
                        <Tooltip
                          title={subjects?.name}
                          arrow
                          TransitionComponent={Zoom}
                          disableInteractive
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
                              fontWeight: 500,
                              background: "rgba(6, 133, 218, 0.1)",
                              border: "1px solid rgba(6, 133, 218, 0.2)",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                background: "rgba(6, 133, 218, 0.2)",
                                transform: "scale(1.02)",
                              }
                            }}
                            className="subject__chip"
                            label={subjects.abbreviation}
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
              </Item>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
}