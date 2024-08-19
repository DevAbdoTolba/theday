import { useEffect, useState, useContext } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Zoom,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

import { DataContext } from "../../../../Data/TranscriptContext";

interface Props {
  currentSemester: number;
  handleClick: () => void;
  setOpen: (value: boolean) => void;
}

export default function CurrentSemester({
  currentSemester,
  handleClick,
  setOpen,
}: Props) {
  const [subjects, setSubjects] = useState<
    {
      name: string;
      abbreviation: string;
    }[]
  >();

  const { transcript, loadingTranscript, error } = useContext(DataContext);

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

  useEffect(() => {
    // @ts-ignore
    setSubjects(transcript.semesters[currentSemester].subjects);
  }, []);

  return (
    <Box
      sx={{
        hegiht: "100%",
        width: "100%",
        maxWidth: { sm: "80%", xs: "100%" },
        p: "2rem  0",
        mb: {
          sm: 1,
          xs: 0,
        },
        borderRadius: "80px 80px 0 0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1e1e1e",
      }}
    >
      <Item
        sx={{
          position: "relative",
          minHeight: "100%",
          transition: "all 0.2s",
          "&:hover": {
            WebkitBoxShadow: "0px 0px 5px 1px rgb(0 0 0 / 50%)",
            MozBoxShadow: "0px 0px 5px 1px rgba(0, 0, 0, 0.5)",
            boxShadow: "0px 0px 5px 1px rgb(0 0 0 / 50%)",
          },
          minWidth: { sm: "60%", xs: "60%" },
          maxWidth: { sm: "60%", xs: "80%" },
          p: "2rem",
        }}
      >
        <Tooltip title="Remove Shortcut Semester" disableInteractive>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{
              position: "absolute",
              top: "2%",
              right: "2%",
              "&:hover *": {
                color: "#900",
              },
            }}
            onClick={() => {
              handleClick();
              localStorage.setItem("semester", "-1");

              // window.location.reload();
            }}
          >
            <RemoveCircleOutlineIcon
              sx={{
                color: "#ddd",
                cursor: "pointer",
              }}
            />
          </IconButton>
        </Tooltip>
        <Typography sx={{ mb: 3, color: "#fff", fontSize: "1.5rem" }}>
          Semester {currentSemester}
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ marginBottom: 3, display: "flex", justifyContent: "center" }}
        >
          {subjects?.map((item, index) => (
            <Grid key={index} item>
              <Tooltip
                title={item?.name}
                disableInteractive
                arrow
                TransitionComponent={Zoom}
                // disableHoverListener={phone}
                // disableFocusListener={phone}
                // disableTouchListener={phone}
              >
                <Chip
                  sx={{
                    padding: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: "800",
                    width: { xs: "auto", sm: "100%" },
                    MozBoxShadow: "0px 1.2px 2px 0.5px rgba(0, 0, 0, 0.5)",
                    boxShadow: "0px 1.2px 2px 0.5px rgb(0 0 0 / 50%)",
                    // "&::after": {
                    //   // content is the value of subject.name
                    //   content: `"${item?.name}"`,

                    //   position: "absolute",
                    //   top: "120%",
                    //   right: "50%",
                    //   transform: "translateX(50%) translateY(-100%)",
                    //   borderRadius: "5px",
                    //   height: "auto",
                    //   width: "auto",
                    //   backgroundColor: "#bbb",
                    //   color: "black",
                    //   marginLeft: "0.5rem",
                    //   padding: "0.5rem",
                    //   pointerEvents: "none",
                    //   whiteSpace: "wrap",
                    //   transition: "all 0.2s",
                    //   WebkitBoxShadow: "0px 0.5px 2px 0.5px rgb(0 0 0 / 50%)",
                    //   MozBoxShadow: "0px 0.5px 2px 0.5px rgba(0, 0, 0, 0.5)",
                    //   boxShadow: "0px 0.5px 2px 0.5px rgb(0 0 0 / 50%)",
                    //   zIndex: "4",

                    //   opacity: "0",
                    //   visibility: "hidden",
                    // },
                    // "&:hover::after": {
                    //   opacity: { sm: "1", xs: "0" },
                    //   visibility: { sm: "visible", xs: "hidden" },
                    //   transform: "translateX(50%) translateY(0%)",
                    // },
                  }}
                  className="subject__chip"
                  label={item?.abbreviation}
                  clickable
                  component={"a"}
                  href={"/subjects/" + item?.abbreviation}
                  // onClick={handleClickOpen}
                />
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Item>

      {/* button with icon to remove short cut and delete the local sotrage */}
    </Box>
  );
}
