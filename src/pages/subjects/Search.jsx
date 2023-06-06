import React, { useEffect } from "react";
import { Box, Paper, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function Search({ data }) {
  const [search, setSearch] = React.useState("");
  const buttonStyle = {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    fontSize: "1.5ch",
    cursor: "pointer",
    letterSpacing: "0.3ch",
    borderRadius: "7px",
    padding: ".5ch 1ch",
    border: "2px solid #3f3f3f",
  };

  // data = {
  //   Assignment: [
  //     {
  //       mimeType: "application/zip",
  //       size: "25364235",
  //       id: "1h9ok3ZR8azQ_3HKfVJFURXKkGCaPjsmF",
  //       name: "sheetNumberBases.zip",
  //     },

  //     {
  //       mimeType:
  //         "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  //       size: "1782346",
  //       id: "1DVqf8HHUjmOY5xPOD4pTKLl-OwYqblju",
  //       name: "رجلك والمعزة.pptx",
  //     },

  //     {
  //       mimeType:
  //         "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  //       size: "1781911",
  //       id: "1Jr_KpRjs2mHrZKsiZ8lqTkgXT2Mr7Ila",
  //       name: "رجلك والفرخة.pptx",
  //     },

  //     {
  //       mimeType: "application/pdf",
  //       size: "812202",
  //       id: "1Ck9XYQC5uWVYgv9K-QOH-eoNvbg4ImpW",
  //       name: "حل شييت 2.pdf",
  //     },

  //     {
  //       mimeType: "application/pdf",
  //       size: "158110",
  //       id: "1hzjysdrToWi2sCgECfEDIM56C8mqMzM-",
  //       name: "حل شييت 3.pdf",
  //     },

  //     {
  //       mimeType: "application/pdf",
  //       size: "39402",
  //       id: "1XX01PDRHISxKZNMqlJTtn3E5ANJ-BdX7",
  //       name: "Sheet3.pdf",
  //     },

  //     {
  //       mimeType: "application/pdf",
  //       size: "63237",
  //       id: "1xPj6x4gc6YbHaIcetrGgHiRPHSnHex4p",
  //       name: "Sheet2-intro (1).pdf",
  //     },
  //   ],
  //   "EX exam": [
  //     {
  //       mimeType: "image/jpeg",
  //       size: "2441753",
  //       id: "1yFbyNfHZ1O61JYPby00pcGRzKrmiGOVF",
  //       name: "Mid.jpg",
  //     },

  //     {
  //       mimeType: "image/jpeg",
  //       size: "3342767",
  //       id: "1yKm2iwqkuD-7TYjCh-9hSUCIIl117UB6",
  //       name: "Quiz.jpg",
  //     },
  //   ],
  // };

  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(3);

  const searchRef = React.useRef(null);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => {
      searchRef.current.focus();
    }, 100); // wait for the modal to open
  };

  const handleClose = () => {
    setOpen(false);
    // empty the search input
    setTimeout(() => {
      setSearch("");
      searchRef.current.value = "";
    }, 320); // wait for the modal to close so don't show blunt search results
  };

  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e?.key === "Escape" && open) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  React.useEffect(() => {
    const handleCtrlK = (e) => {
      if (e.ctrlKey && (e.keyCode === 75 || e.code === "KeyK")) {
        e.preventDefault();
        handleOpen();
      }
    };

    window.addEventListener("keydown", handleCtrlK);

    return () => {
      window.removeEventListener("keydown", handleCtrlK);
    };
  }, [open]);

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  return (
    <>
      {/* black background for whole screen  */}

      <Box
        sx={{
          position: "relative",
          backgroundColor: "rgba(0,0,0,0.5)",

          marginLeft: "0",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",

          width: "auto",
          fontSize: "1.6ch",
          padding: ".7ch",

          borderRadius: "1ch",
          border: "2px solid #3f3f3f",

          "&:hover": {
            cursor: "pointer",
            backgroundColor: "rgba(50,50,50,0.7)",
          },
          "& > *": {
            margin: "0 1ch",
          },
        }}
        onClick={handleOpen}
      >
        <SearchIcon />
        <Typography
          sx={{
            display: {
              sm: "block",
              xs: "none",
            },
          }}
        >
          Search...
        </Typography>
        <Box
          sx={{
            ...buttonStyle,
            display: {
              sm: "block",
              xs: "none",
            },
          }}
        >
          ctr+k
        </Box>
      </Box>

      {
        <Paper
          sx={{
            backgroundColor: "#1e1e1e",
            position: "fixed",
            top: {
              sm: open ? "10%" : "15%",
              xs: "0",
            },

            left: "50%",
            transform: "translateX(-50%)",

            width: {
              sm: "50vw",
              xs: "100vw",
            },

            maxHeight: {
              sm: "90vh",
              xs: "100vh",
            },
            maxWidth: {
              sm: "50vw",
              xs: "100vw",
            },
            padding: "1.5ch",
            borderRadius: {
              sm: "20px ",
              xs: "0",
            },
            border: ".5px solid #727272",
            boxShadow: "0px 0px 10px 0px rgba(0,0,0,1)",

            zIndex: 4,

            overflowY: "hidden",
            overflowX: "hidden",

            opacity: open ? 1 : 0,
            visibility: open ? "visible" : "hidden",

            transition: "all .3s ",
          }}
        >
          <Box
            // align in row
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "1ch",
              position: "relative",
              "&::after": {
                content: '""',
                display: "block",
                width: "200%",
                height: "1px",
                backgroundColor: "#727272",
                position: "absolute",
                bottom: 0,
                left: 0,

                transform: "translateX(-10%)",
              },
            }}
          >
            {/* Search Icon */}

            <SearchIcon
              sx={{
                color: "#fff",
                fontSize: "2rem",
              }}
            />

            {/* Search Input */}
            <input
              ref={searchRef}
              tabIndex={1}
              type="text"
              placeholder="Search..."
              style={{
                width: "100%",
                padding: "1ch 2.5ch",
                border: "2px solid #292929",
                borderRadius: "20px",
                backgroundColor: "#292929",
                color: "#fff",
                fontSize: "1.3rem",
                outline: "none",
              }}
              onChange={handleChange}
            />

            {/* esc button */}
            <button
              tabIndex={2}
              style={buttonStyle}
              // close the search box
              onClick={handleClose}
            >
              esc
            </button>
          </Box>
          <Box
            sx={{
              height: "100%",
              maxHeight: {
                sm: "70vh",
                xs: "90vh",
              },

              padding: " 1ch 2.5ch",
              overflowY: "scroll",

              minHeight: {
                sm: "50vh",
                xs: "100vh",
              },
            }}
          >
            {/* Search Result */}
            {Object?.keys(data)
              ?.filter((key) =>
                data[key]?.some((subject) =>
                  subject?.name?.toLowerCase()?.includes(search?.toLowerCase())
                )
              )
              ?.map((key, index) => {
                return (
                  <Box
                    key={index}
                    sx={{
                      padding: "1ch 0",
                      "&:not(:last-child)": {
                        borderBottom: "1px solid #727272",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#fff",
                        padding: "0.5ch 0",
                      }}
                    >
                      {key}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        flexWrap: "wrap",
                        gap: "1ch",
                      }}
                    >
                      {data[key]
                        ?.filter((subject) =>
                          subject?.name
                            ?.toLowerCase()
                            ?.includes(search?.toLowerCase())
                        )
                        ?.map((subject, index) => {
                          return (
                            <Box
                              tabIndex={index + 3}
                              key={index}
                              sx={{
                                backgroundColor: "#292929",
                                padding: "0.5ch 1ch 0.5ch 3ch",
                                // word break
                                wordBreak: "break-all",
                                lineHeight: "1.5rem",
                                borderRadius: "10px",
                                color: "#fff",
                                fontSize: "1.2rem",
                                cursor: "pointer",

                                "&:hover": {
                                  backgroundColor: "#1e1e1e",
                                },
                              }}
                              onClick={() => {
                                window.open(
                                  `https://drive.google.com/uc?id=${subject?.id}`,
                                  "_blank"
                                );
                              }}
                            >
                              {subject?.name}
                            </Box>
                          );
                        })}
                    </Box>
                  </Box>
                );
              })}
          </Box>
        </Paper>
      }

      {/* Shadow Box */}
      {open && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#000",
            opacity: open ? 0.8 : 0,
            zIndex: 3,

            transition: "all .3s ",
          }}
          onClick={handleClose}
        />
      )}
    </>
  );
}
