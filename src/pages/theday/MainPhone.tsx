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

interface Props {
  search: string;
  currentSemester: number;
}

function MainPhone({ search, currentSemester }: Props) {
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
      {data.semesters
        .filter(
          (x) =>
            x.subjects.filter(
              (y) =>
                y?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                y?.abbreviation?.toLowerCase().includes(search?.toLowerCase())
            ).length > 0
        )
        .map((item, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 3,
              borderBottom: "1px solid #1e1e1e",
              //   shadow
              boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Semester {item.index}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} sx={{ marginBottom: 3 }}>
                {item.subjects
                  .filter(
                    (y) =>
                      y?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                      y?.abbreviation
                        ?.toLowerCase()
                        .includes(search?.toLowerCase())
                  )

                  .map((subjects, index) => (
                    <Grid
                      key={index}
                      item
                      // sx={{
                      //   width: "100%",
                      // }}
                    >
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
                          sx={{
                            width: "100%",
                            MozBoxShadow:
                              "0px 1.2px 2px 0.5px rgba(0, 0, 0, 0.5)",
                            boxShadow: "0px 1.2px 2px 0.5px rgb(0 0 0 / 50%)",
                          }}
                          className="subject__chip"
                          label={subjects.abbreviation}
                          clickable
                          // component={"a"}
                          onClick={() => {
                            // redirect

                            console.log(
                              "currentSemester : " +
                                currentSemester +
                                "\nIndex : " +
                                index
                            );
                            localStorage.setItem(
                              "currentSemester",
                              index.toString()
                            );
                            window.location.href =
                              "/subjects/" + subjects.abbreviation;
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
