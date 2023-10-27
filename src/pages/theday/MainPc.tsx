import Box from "@mui/material/Box";
import data from "src/Data/data.json";
import Grid from "@mui/material/Grid";
import Zoom from "@mui/material/Zoom";
import { Chip, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

interface Props {
  search: string;
  currentSemester: number;
}

export default function MainPc({ search, currentSemester }: Props) {
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
4-name
5-abbreviation
.filter?
*/}

          {data.semesters
            .filter(
              (x) =>
                x.index !== currentSemester &&
                x.subjects.filter(
                  (y) =>
                    y?.name?.toLowerCase().includes(search?.toLowerCase()) ||
                    y?.abbreviation
                      ?.toLowerCase()
                      .includes(search?.toLowerCase())
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
                          y?.name
                            ?.toLowerCase()
                            .includes(search?.toLowerCase()) ||
                          y?.abbreviation
                            ?.toLowerCase()
                            .includes(search?.toLowerCase())
                      )
                      .map((subjects, index) => (
                        <Grid key={index} item>
                          <Tooltip
                            title={subjects?.name}
                            arrow
                            TransitionComponent={Zoom}
                            disableInteractive
                          >
                            <Chip
                              sx={{
                                width: "100%",
                                MozBoxShadow:
                                  "0px 1.2px 2px 0.5px rgba(0, 0, 0, 0.5)",
                                boxShadow:
                                  "0px 1.2px 2px 0.5px rgb(0 0 0 / 50%)",
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
                </Item>
              </Grid>
            ))}
        </Grid>
      </Box>
    </>
  );
}
