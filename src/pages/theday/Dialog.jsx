import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import { Box } from "@mui/material";

export default function AlertDialog({
  label,
  subject,
  index,
  currentSemester,
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      {index !== 0 ? (
        <Chip
          sx={{
            width: "100%",
            MozBoxShadow: "0px 1.2px 2px 0.5px rgba(0, 0, 0, 0.5)",
            boxShadow: "0px 1.2px 2px 0.5px rgb(0 0 0 / 50%)",
            "&::after": {
              // content is the value of subject.name
              content: `"${subject?.name}"`,

              position: "absolute",
              top: "120%",
              right: "50%",
              transform: "translateX(50%) translateY(-100%)",
              borderRadius: "5px",
              height: "auto",
              width: "auto",
              backgroundColor: "#bbb",
              color: "black",
              marginLeft: "0.5rem",
              padding: "0.5rem",
              pointerEvents: "none",
              whiteSpace: "wrap",
              transition: "all 0.2s",
              WebkitBoxShadow: "0px 0.5px 2px 0.5px rgb(0 0 0 / 50%)",
              MozBoxShadow: "0px 0.5px 2px 0.5px rgba(0, 0, 0, 0.5)",
              boxShadow: "0px 0.5px 2px 0.5px rgb(0 0 0 / 50%)",
              zIndex: "4",

              opacity: "0",
              visibility: "hidden",
            },
            "&:hover::after": {
              opacity: "1",
              visibility: "visible",
              transform: "translateX(50%) translateY(0%)",
            },
          }}
          className="subject__chip"
          label={label}
          clickable
          // component={"a"}
          onClick={handleClickOpen}
        />
      ) : (
        <Chip
          sx={{
            width: "100%",
            MozBoxShadow: "0px 1.2px 2px 0.5px rgba(0, 0, 0, 0.5)",
            boxShadow: "0px 1.2px 2px 0.5px rgb(0 0 0 / 50%)",
            "&::after": {
              // content is the value of subject.name
              content: `"${subject?.name}"`,

              position: "absolute",
              top: "120%",
              right: "50%",
              transform: "translateX(50%) translateY(-100%)",
              borderRadius: "5px",
              height: "auto",
              width: "auto",
              backgroundColor: "#bbb",
              color: "black",
              marginLeft: "0.5rem",
              padding: "0.5rem",
              pointerEvents: "none",
              whiteSpace: "wrap",
              transition: "all 0.2s",
              WebkitBoxShadow: "0px 0.5px 2px 0.5px rgb(0 0 0 / 50%)",
              MozBoxShadow: "0px 0.5px 2px 0.5px rgba(0, 0, 0, 0.5)",
              boxShadow: "0px 0.5px 2px 0.5px rgb(0 0 0 / 50%)",
              zIndex: "4",

              opacity: "0",
              visibility: "hidden",
            },
            "&:hover::after": {
              opacity: "1",
              visibility: "visible",
              transform: "translateX(50%) translateY(0%)",
            },
          }}
          className="subject__chip"
          label={label}
          clickable
          // component={"a"}
          onClick={() => {
            // redirect
            window.location.href = "/subjects/" + subject.abbreviation;
          }}
        />
      )}
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
          <DialogContentText id="alert-dialog-description">
            <Box display="flex" sx={{ m: 1 }}>
              {/* two buttons one says yes other says no */}
              <Button
                sx={{ m: 2 }}
                variant="contained"
                onClick={() => {
                  // store in local storage index as and key and index as value
                  localStorage.setItem("semester", index);
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
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
