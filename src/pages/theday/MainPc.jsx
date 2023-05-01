import Box from "@mui/material/Box";
import data from "../../Data/data.json";
import Grid from "@mui/material/Grid";
import Dialog from "./Dialog";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

export default function MainPc({ search, currentSemester }) {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#232323" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    borderBottom: "1px solid #1e1e1e",
    //   shadow
    boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
    color: theme.palette.text.secondary,
  }));

  return (
    <>
      <Box
        sx={{
          m: 2,
          display: {
            xs: "none",
            sm: "block",
          },
        }}
      >
        <Grid container spacing={2}>
          {/*Filter for search
1-Semesters
2-Subjects
3-doctors
4-name
5-abbreviation
.filter?
*/}

          {data.semesters
            .filter(
              (x) =>
                x.subjects.filter(
                  (y) =>
                    y.name.toLowerCase().includes(search.toLowerCase()) ||
                    y.abbreviation
                      .toLowerCase()
                      .includes(search.toLowerCase()) ||
                    y.doctor.toLowerCase().includes(search.toLowerCase())
                ).length > 0
            )
            .map((item, index) => (
              <Grid key={index} item xs={4}>
                <Item
                  sx={{
                    minHeight: "100%",
                    transition: "all 0.2s",
                    "&:hover": {
                      WebkitBoxShadow: "0px 0px 5px 1px rgb(0 0 0 / 50%)",
                      MozBoxShadow: "0px 0px 5px 1px rgba(0, 0, 0, 0.5)",
                      boxShadow: "0px 0px 5px 1px rgb(0 0 0 / 50%)",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <Typography sx={{ marginBottom: 3, color: "#fff" }}>
                    Semester {item.index}
                  </Typography>
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
                        <Grid key={index} item>
                          <Dialog
                            currentSemester={currentSemester}
                            index={item.index}
                            label={subjects.abbreviation}
                            subject={subjects}
                          />
                        </Grid>
                      ))}
                  </Grid>
                </Item>
              </Grid>
            ))}
        </Grid>
      </Box>
    </>
  );
}
