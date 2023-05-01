import Box from "@mui/material/Box";
import data from "../../Data/data.json";
import Grid from "@mui/material/Grid";
import Dialog from "./Dialog";
import { Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function MainPhone({ search, curretnSemester }) {
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
                y.name?.toLowerCase().includes(search?.toLowerCase()) ||
                y.abbreviation?.toLowerCase().includes(search?.toLowerCase()) ||
                y.doctor?.toLowerCase().includes(search?.toLowerCase())
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
                      y.name.toLowerCase().includes(search.toLowerCase()) ||
                      y.abbreviation
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      y.doctor.toLowerCase().includes(search.toLowerCase())
                  )

                  .map((subjects, index) => (
                    <Grid
                      key={index}
                      item
                      // sx={{
                      //   width: "100%",
                      // }}
                    >
                      <Dialog
                        label={subjects.name}
                        subject={subjects}
                        curretnSemester={curretnSemester}
                        index={item.index}
                      />
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
