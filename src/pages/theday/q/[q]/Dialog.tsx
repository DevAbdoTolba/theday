import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import Zoom from "@mui/material/Zoom";
import { Box, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import { setItem } from "../../../../utils/storage";

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
  const router = useRouter();

  const handleClickOpen = (subject: string) => {
    setItem("currentSemester", index.toString());
    router.push("/subjects/" + subject);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <Tooltip
        title={subject?.name}
        arrow
        TransitionComponent={Zoom}
        disableInteractive
        disableHoverListener={phone}
        disableFocusListener={phone}
        disableTouchListener={phone}
      >
        <Chip
          sx={{
            width: "100%",
            MozBoxShadow: "0px 1.2px 2px 0.5px rgba(0, 0, 0, 0.5)",
            boxShadow: "0px 1.2px 2px 0.5px rgb(0 0 0 / 50%)",
          
          }}
          className="subject__chip"
          label={label}
          clickable
          // component={"a"}
          onClick={() => {
            // redirect
            handleClickOpen(subject.abbreviation);
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
                setItem("semester", index.toString());
                router.push("/subjects/" + subject.abbreviation);
              }}
            >
              Yes
            </Button>
            <Button
              sx={{ m: 2 }}
              variant="contained"
              onClick={() => {
                router.push("/subjects/" + subject.abbreviation);
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
