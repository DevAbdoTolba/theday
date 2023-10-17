import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import Zoom from "@mui/material/Zoom";
import { Box, Tooltip } from "@mui/material";

interface Subject {
  name: string;
  abbreviation: string;
}

interface Props {
  phone?: boolean | false;
  label: string;
  subject: Subject;
  index: number;
  currentSemester: number;
}

export default function AlertDialog({
  phone,
  label,
  subject,
  index,
  currentSemester,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = (subject: string) => {
    console.log("currentSemester : " + currentSemester + "\nIndex : " + index);
    if (currentSemester === -1) setOpen(true);
    else window.location.href = "/subjects/" + subject;
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Tooltip
        title={subject?.name}
        arrow
        disableInteractive
        TransitionComponent={Zoom}
        disableHoverListener={phone}
        disableFocusListener={phone}
        disableTouchListener={phone}
      >
        <Chip
          sx={{
            width: "100%",
            MozBoxShadow: "0px 1.2px 2px 0.5px rgba(0, 0, 0, 0.5)",
            boxShadow: "0px 1.2px 2px 0.5px rgb(0 0 0 / 50%)",
            // "&::after": {
            //   // content is the value of subject.name
            //   content: `"${subject?.name}"`,

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
          label={label}
          clickable
          // component={"a"}
          onClick={() => {
            // redirect
            index !== 0
              ? handleClickOpen(subject.abbreviation)
              : (window.location.href = "/subjects/" + subject.abbreviation);
          }}
        />
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ textAlign: "center" }}>
          Are you in semester {index} ?{" "}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" sx={{ m: 1 }}>
            {/* two buttons one says yes other says no */}
            <Button
              sx={{ m: 2 }}
              variant="contained"
              onClick={() => {
                // store in local storage index as and key and index as value
                localStorage.setItem("semester", index.toString());
                // redirect to subject page
                window.location.href = "/subjects/" + subject.abbreviation;
              }}
            >
              Yes
            </Button>
            <Button
              sx={{ m: 2 }}
              variant="contained"
              onClick={() => {
                window.location.href = "/subjects/" + subject.abbreviation;
              }}
            >
              No
            </Button>

            {/* <Chip
                component={"a"}
                href={/subject/ + subject.abbreviation}
                target="_blank"
                sx={{ m: 2 }}
                label={"Materials"}
                onClick={() => {}}
                clickable
              />

              <Chip
                sx={{ m: 2 }}
                label={"Previous Exams"}
                onClick={() => {
                  console.log(subject.PreviousExams);
                }}
                clickable
              />

              <Chip
                sx={{ m: 2 }}
                label={"schedule"}
                onClick={() => {
                  console.log(subject.schedule);
                }}
                clickable
              /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
