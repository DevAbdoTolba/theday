import { Box, Paper, Typography, Grid } from "@mui/material";

function Material({
  name,
  abbreviation,
  material, // subject => 1-lecture 2-whitenning 3-section

  PreviousExams,
  schedule,
  description,
}) {
  const containerStyle = {
    display: "flex",
    flexWrap: "noWrap",
    justifyContent: "flex-start",
    width: "80vw",
    overflowX: "scroll",
  };

  const itemStyle = {};

  return (
    <>
      {["Lectures", "Sections", "Whitenning"].map((item, index) => (
        <Paper
          key={index}
          sx={{
            p: "0.5rem",
            m: "1rem",
          }}
        >
          <Typography variant="h4" sx={{ margin: "1rem" }}>
            {item}
          </Typography>
          <Box
            className="Material_container"
            key={index}
            style={containerStyle}
          >
            {[
              1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1,
              1, 1, 1, 1, 1, 1,
            ].map((x, index) => (
              <Box
                key={index}
                sx={{
                  mr: "1rem",
                  mb: "1rem",
                }}
              >
                <Typography variant="h6">Title</Typography>
                <Paper
                  className="Material_item"
                  style={itemStyle}
                  elevation={20}
                  sx={{
                    aspectRatio: "2 / 3",
                    flexBasis: "50%",
                    cursor: "pointer",
                    p: 4,
                    m: 1,
                    ml: 0,
                    userSelect: "none",
                    textAlign: "center",
                    width: "5vw",
                    minHeight: "25vh",
                    maxHeight: "100%",
                    display: "flex",
                    justifyContent: "center",
                    border: "1px solid black",
                    boxSizing: "border-box",
                    minWidth: "100%",
                    padding: "4rem",
                  }}
                >
                  {x === 1 ? (
                    <Typography
                      variant="h5"
                      sx={{ fontSize: { sm: "2vw", xs: "6vw" } }}
                    >
                      PDF
                    </Typography>
                  ) : (
                    <Typography
                      variant="h5"
                      sx={{ fontSize: { sm: "2vw", xs: "6vw" } }}
                    >
                      IMG
                    </Typography>
                  )}
                </Paper>
              </Box>
            ))}
          </Box>
        </Paper>
      ))}
    </>
  );
}

export default Material;
