import * as React from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { getItem, setItem, hasItem } from "../utils/storage";

interface SubjectSemesterBarProps {
  subject: string;
  semester: number;
  subjectFullName?: string;  // Optional full name of the subject
}

export default function SubjectSemesterBar({ subject, semester, subjectFullName = "" }: SubjectSemesterBarProps) {
  // Only show if semester value is valid
  const [open, setOpen] = React.useState(false); // Changed to false initially, will be controlled by useEffect
  const [askAgain, setAskAgain] = React.useState(false);
  const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null);
  const [currentSemester, setCurrentSemester] = React.useState<number | null>(null);
  
  // Display name is either the full name if provided or just the abbreviation
  const displayName = subjectFullName && subjectFullName.trim() !== "" 
    ? `${subject} (${subjectFullName})` 
    : subject;

  // Function to show the snackbar
  const handleClick = React.useCallback(() => {
    if (semester > 0) {
      setOpen(true);
    }
  }, [semester]);

  const showPromptOnNextInteraction = React.useCallback(() => {
    // Wait for any mouse click, then open after small delay
    document.addEventListener(
      "mousedown",
      () => {
        setTimeout(() => {
          handleClick();
        }, 4000);
      },
      { once: true }
    );
  }, [handleClick]);

  React.useEffect(() => {
    const currentSem = parseInt(getItem("currentSemester") || "-1");
    setCurrentSemester(currentSem);

    // Check if there is a semester in local storage
    const noSemesterSet = 
      parseInt(getItem("semester") || "-1") === -1 || 
      !hasItem("semester");

    console.log(
      "semester : " + noSemesterSet + "\ncurrentSemester : " + currentSem
    );

    // If the semester is not set (-1) or no semester stored, and currentSemester is valid
    if (noSemesterSet && currentSem) {
      showPromptOnNextInteraction();
    }
  }, [semester, showPromptOnNextInteraction]);

  // Handle Yes response to the first prompt
  const handleYes = () => {
    // Set current semester to the passed semester number
  setItem("semester", semester.toString());
    setOpen(false);
  };

  // Handle No response to the first prompt
  const handleNo = () => {    
    setOpen(false);
    console.log("Sad, what about this subject?");
    
    // Set a timer to show the second prompt after 5 seconds
    const timeoutId = setTimeout(() => {
      setAskAgain(true);
    }, 5000); // 5 seconds delay
    
    setTimer(timeoutId);
  };  // Handle Yes response to the second prompt
  const handleSecondYes = () => {
    // Create a custom semester with the subject
    const customSemesterSubjects = JSON.stringify([subject]);
  setItem("customSemesterSubjects", customSemesterSubjects);
  setItem("customSemesterName", "Special for you 🌹");
    
    // Set a custom semester flag so the app knows this is not a standard semester
  setItem("semester", "-2"); // Use -2 to indicate custom special semester
    
    // Close the snackbar
    setAskAgain(false);
  };

  // Handle No response to the second prompt or close
  const handleClose = () => {
    setOpen(false);
    setAskAgain(false);
    if (timer) {
      clearTimeout(timer);
    }
  };  // We're no longer using these predefined action groups
  // Instead, we'll define actions directly in the Snackbar components
  return (
    <>
      <Snackbar
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "#1e293b",
            color: "#fff",
          },
        }}
        open={open}
  onClose={(event: React.SyntheticEvent | Event, reason?: string) => {
          if (reason === 'clickaway') {
            return; // Prevent closing on click away
          }
          handleClose();
        }}
        message={`Are you in semester ${semester}?`}
        action={
          <React.Fragment>
            <Button
              color="success"
              size="small"
              onClick={handleYes}
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
              onClick={handleNo}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transitionDuration={600}
        autoHideDuration={null} // No auto-hide, stay visible until user interaction
        ClickAwayListenerProps={{ onClickAway: () => {} }} // Disable click-away behavior
      />
      
      <Snackbar
        sx={{
          "& .MuiPaper-root": {
            bgcolor: "#1e293b",
            color: "#fff",
          },
        }}
        open={askAgain}
  onClose={(event: React.SyntheticEvent | Event, reason?: string) => {
          if (reason === 'clickaway') {
            return; // Prevent closing on click away
          }
          handleClose();
        }}
        message={`Does subject ${displayName} belong to your current semester?`}
        action={
          <React.Fragment>
            <Button
              color="success"
              size="small"
              onClick={handleSecondYes}
              sx={{
                fontWeight: "bolder",
              }}
            >
              Yes
            </Button>
            <Button
              color="primary"
              size="small"
              onClick={handleClose}
              sx={{
                fontWeight: "bolder",
              }}
            >
              No
            </Button>
          </React.Fragment>
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transitionDuration={600}
        autoHideDuration={null} // No auto-hide, stay visible until user interaction
        ClickAwayListenerProps={{ onClickAway: () => {} }} // Disable click-away behavior
      />
    </>
  );
}
