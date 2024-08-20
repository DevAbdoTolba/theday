import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import Fade from "@mui/material/Fade";
import { motion, AnimatePresence } from "framer-motion";

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

// Define motion variants for reusable animations
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
};

export default function AlertDialogSlide({ open, setOpen, data }: Props) {
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [search, setSearch] = React.useState("");

  const filtersArray = Object.keys(data);
  const [folder, setFolder] = React.useState("");

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
    }, 15);
  };

  React.useEffect(() => {
    if (open) {
      searchRef?.current?.focus();
    }
    return () => {
      setFolder("");
    };
  }, [open]);

  // filter logic

  return (
    <>
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
          <Button
            style={buttonStyle}
            disableRipple
            variant="text"
            sx={{
              "&:focus": {
                outline: "1px solid #fff",
              },
            }}
            onClick={handleClose}
          >
            esc
          </Button>
        </Box>
        <Box
          mt={1}
          mx={2}
          display={"flex"}
          justifyContent={"flex-start"}
          flexWrap={"wrap"}
          gap={"1ch"}
        >
          {filtersArray.map((filteredFolder, index) => {
            return (
              <>
                <Chip
                  key={index}
                  label={filteredFolder}
                  variant={filteredFolder === folder ? "filled" : "outlined"}
                  onClick={() => {
                    if (filteredFolder === folder) {
                      setFolder("");
                      return;
                    }
                    setFolder(filteredFolder);
                  }}
                  deleteIcon={
                    filteredFolder === folder ? <ClearIcon /> : <AddIcon />
                  }
                  onDelete={() => {
                    if (filteredFolder === folder) {
                      setFolder("");
                      return;
                    }
                    setFolder(filteredFolder);
                  }}
                />
              </>
            );
          })}
        </Box>
        <DialogContent>
          <AnimatePresence>
            {data &&
              Object?.keys(data)
                ?.filter(
                  (key) =>
                    data[key]?.some((subject) =>
                      subject?.name
                        ?.toLowerCase()
                        ?.includes(search?.toLowerCase())
                    ) && (folder !== "" ? key === folder : true)
                )
                ?.map((key, index) => {
                  return (
                    <motion.div
                      key={index}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <Box
                        key={index}
                        sx={{
                          padding: "1ch 0",
                          "&:not(:last-child)": {
                            borderBottom: "1px solid #727272",
                          },
                        }}
                      >
                        <Box display={"flex"} justifyContent={"flex-start"}>
                          <Typography
                            fontSize={"1.5rem"}
                            fontWeight={"bold"}
                            color={"#fff"}
                            padding={"0.5ch 0"}
                          >
                            {key}
                          </Typography>
                          <Typography
                            fontSize={"1rem"}
                            fontWeight={"bolder"}
                            color={"grey"}
                            padding={"0.5ch .2ch"}
                          >
                            {data[key].length}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            flexWrap: "wrap",
                            overflowX: "auto",
                            // scroll bar x height 4px
                            "&::-webkit-scrollbar": {
                              height: "4px",
                            },
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
                              const displayName = (() => {
                                let name = subject?.name;
                                if (name.includes("%20")) {
                                  name = name.replace(/%20/g, " ");
                                }
                                if (name.includes("http")) {
                                  let url: URL | string = "";
                                  let name_split = name.split(" ");
                                  let urlIndex = name_split.findIndex((name) =>
                                    name.includes("http")
                                  );
                                  const name_split_no_url = name_split.filter(
                                    (name) => !name.includes("http")
                                  );
                                  if (name_split_no_url.length > 0) {
                                    return name_split_no_url.join(" ");
                                  }
                                  try {
                                    url = new URL(name_split[urlIndex]);
                                    if (url.hostname.includes("youtube")) {
                                      url.hostname = "yout-ube.com";
                                    }
                                    return url.hostname;
                                  } catch {
                                    try {
                                      url = new URL(
                                        decodeURIComponent(name_split[urlIndex])
                                      );
                                    } catch {
                                      return subject?.name;
                                    }
                                  }
                                }
                                return subject?.name;
                              })();

                              const validURL = (() => {
                                if (subject?.name.includes("http")) {
                                  let url: URL | string = "";
                                  let name_split = subject.name.split(" ");
                                  let urlIndex = name_split.findIndex((name) =>
                                    name.includes("http")
                                  );
                                  try {
                                    url = new URL(name_split[urlIndex]);
                                    if (url.hostname.includes("youtube")) {
                                      url.hostname = "yout-ube.com";
                                    }
                                    return url.href;
                                  } catch {
                                    try {
                                      url = new URL(
                                        decodeURIComponent(name_split[urlIndex])
                                      );
                                      if (url.hostname.includes("youtube")) {
                                        url.hostname = "yout-ube.com";
                                      }
                                      return url.href;
                                    } catch {
                                      return null;
                                    }
                                  }
                                }
                                return null;
                              })();

                              return (
                                <Button
                                  href={
                                    validURL ||
                                    `https://drive.google.com/file/d/${subject?.id}/preview`
                                  }
                                  target="_blank"
                                  key={index}
                                  sx={{
                                    all: "unset",
                                    backgroundColor: "#292929",
                                    padding: "0.5ch",
                                    cursor: "pointer",
                                    "&:hover": {
                                      backgroundColor: "#333333",
                                    },
                                    borderRadius: "0.5ch",
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      color: "#ddd",
                                      textAlign: "left",
                                    }}
                                  >
                                    {displayName}
                                  </Typography>
                                </Button>
                              );
                            })}
                        </Box>
                      </Box>
                      <Divider />
                    </motion.div>
                  );
                })}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
