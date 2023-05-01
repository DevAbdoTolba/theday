import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export default function ScheduleDialog({ open, setOpen, schedule }) {
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle sx={{ cursor: "move" }} id="draggable-dialog-title">
          <ImageList cols={1}>
            <ImageListItem
              sx={{
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              <img src={schedule} alt="schedule" loading="lazy" />
            </ImageListItem>
          </ImageList>
        </DialogTitle>
      </Dialog>
    </>
  );
}
