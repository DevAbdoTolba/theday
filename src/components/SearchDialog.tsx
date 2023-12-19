import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import SearchIcon from "@mui/icons-material/Search";
import { Box, TextField, Typography } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

interface Data {
  id: string;
  mimeType: string;
  name: string;
  parents: string[];
  size: number;
}

interface DataMap {
  [key: string]: Data[];
}

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: DataMap;
}

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

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide({ open, setOpen, data }: Props) {
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e?.target?.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSearch("");
    }, 15); // Must be 15 or it will be lagging if the user opened and closed it very fast it will not reset the search value in time
  };

  React.useEffect(() => {
    if (open) {
      searchRef?.current?.focus();
    }
  }, [open]);



  return (
    <div>
      <Button
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
          padding: ".7ch 2ch",
          color: "#fff",

          borderRadius: "1ch",
          border: "2px solid #3f3f3f",

          "&:hover": {
            cursor: "pointer",
            backgroundColor: "rgba(50,50,50,0.7)",
          },
          "&:focus": {
            outline: "1px solid #fff",
          },
          "& > *:not(:first-of-type, :last-child)": {
            margin: "0 2ch",
          },
        }}
        disableRipple
        variant="text"
        onClick={handleClickOpen}
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
          Search &nbsp; &nbsp;
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
      </Button>

      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        // change width to 100vw

        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#292929",
            backgroundImage: "none",
            borderRadius: {
              sm: "20px ",
              xs: "0",
            },

            position: "absolute",
            top: {
              sm: "10%",
              xs: "0",
            },

            margin: "0 !important",
            padding: "0 !important",
            border: ".5px solid #727272",
            boxShadow: "0px 0px 10px 0px rgba(0,0,0,1)",
          },
          "& .MuiDialog-paperWidthSm": {
            minHeight: {
              sm: "50vh",
              xs: "100vh",
            },

            height: {
              sm: "fit-content",
              xs: "100vh",
            },
            width: {
              sm: "50vw",
              xs: "100vw",
            },

            maxHeight: {
              sm: "80vh",
              xs: "100vh",
            },
            maxWidth: {
              sm: "50vw",
              xs: "100vw",
            },
          },
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
            backgroundColor: "#292929",
            p: "2ch",
            margin: 0,

            "&::after": {
              content: "''",
              position: "absolute",
              bottom: "0",
              left: "0",
              width: "100%",
              height: "1px",

              backgroundColor: "#727272",
            },
          }}
        >
          <SearchIcon
            sx={{
              color: "#fff",
              fontSize: "2rem",
            }}
          />
          {/* Search Input */}
          <TextField
            inputRef={searchRef}
            type="text"
            value={search}
            placeholder="Search..."
            style={{
              width: "100%",
              backgroundColor: "#292929",
              color: "#fff",
            }}
            onChange={handleChange}
            variant="standard"
            InputProps={{
              disableUnderline: true,
              autoComplete: "off",
              style: {
                fontSize: "1.3rem",
                color: "#fff",
                padding: ".5ch 2.5ch",
              },
            }}
          />
          {/* esc button */}
          <Button
            style={buttonStyle}
            disableRipple
            variant="text"
            sx={{
              "&:focus": {
                outline: "1px solid #fff",
              },
            }}
            // close the search box
            onClick={handleClose}
          >
            esc
          </Button>
        </Box>
        <DialogContent>
          {/* Search Result */}
          {data &&
            Object?.keys(data)
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
                            <Button
                              key={index}
                              sx={{
                                all: "unset",
                                backgroundColor: "#292929",
                                padding: "0.5ch 1ch 0.5ch 3ch",
                                // word break
                                wordBreak: "break-all",
                                lineHeight: "1.5rem",
                                borderRadius: "10px",
                                color: "#fff",
                                fontSize: "1.2rem",
                                cursor: "pointer",

                                "&:hover, &:focus": {
                                  backgroundColor: "#1e1e1e",
                                },
                                "&:focus": {
                                  outline: "1px solid #fff",
                                },
                              }}
                              disableRipple
                              onClick={() => {
                                window.open(
                                  `https://drive.google.com/file/d/${subject?.id}/preview`,
                                  "_blank"
                                );
                              }}
                            >
                              {subject?.name}
                            </Button>
                          );
                        })}
                    </Box>
                  </Box>
                );
              })}
        </DialogContent>
      </Dialog>
    </div>
  );
}
