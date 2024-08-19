import * as React from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export default function SimpleSnackbar() {
  const [open, setOpen] = React.useState(false);
  const [currentSemester, setCurrentSemester] = React.useState(0);

  React.useEffect(() => {
    const currentSemester = parseInt(localStorage.getItem("currentSemester")!);
    setCurrentSemester(currentSemester);
    // only setTimeout if currentSemester is not -1 or null

    // check if there is a semester in local storage
    const semester =
      parseInt(localStorage.getItem("semester")!) == -1 ||
      !localStorage.hasOwnProperty("semester");

    console.log(
      "semester : " + semester + "\ncurrentSemester : " + currentSemester
    );

    // if the semester that is in the main page is not set (-1) or there is no error so the currentSemester was set correctly
    if (semester && currentSemester)
      // wait for any mouse click or keyboard press
      document.addEventListener("mousedown", () => {
        setTimeout(() => {
          handleClick();
        }, 4000);
      });
  }, []);

  const handleClick = () => {
    setOpen(true);
  };

  const handelYes = (event: React.SyntheticEvent | Event, reason?: string) => {
    // set current semester to currentSemester
    localStorage.setItem("semester", currentSemester.toString());
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // set current semester to -1
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <Button
        color="success"
        size="small"
        onClick={handelYes}
        sx={{
          fontWeight: "bolder",
        }}
      >
        Yes
      </Button>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );
  //   after 4 seconds, show the snackbar

  return (
    <>
      <Snackbar
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "#1f1f1f",
            color: "#fff",
          },
        }}
        open={open}
        onClose={handleClose}
        message={"Are you in semester " + currentSemester + " ?"}
        action={action}
        transitionDuration={600}
        autoHideDuration={10000}
      />
    </>
  );
}
