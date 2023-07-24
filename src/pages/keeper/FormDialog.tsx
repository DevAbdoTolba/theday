import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";

export default function FormDialog(props) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setName("");
    setNote("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [name, setName] = useState("qrs");
  const [note, setNote] = useState("");

  const handleChangeName = (event) => {
    setName(event.target.value);
  };

  const handleChangeNote = (event) => {
    setNote(event.target.value);
  };

  const handelOnClick = () => {
    props.setNotes((prevNotes) => [...prevNotes, { title: name, body: note }]);
    handleClose();
  };

  return (
    <div>
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleClickOpen}
        sx={{ position: "fixed", right: "10px", bottom: "10px" }}
      >
        <Tooltip title="Add">
          <AddIcon />
        </Tooltip>
      </Fab>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Keeper</DialogTitle>
        <DialogContent>
          <DialogContentText>Add your new toKeep</DialogContentText>
          <TextField
            autoFocus={true}
            label="Name"
            value={name}
            onChange={handleChangeName}
          />

          <TextField label="Note" value={note} onChange={handleChangeNote} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handelOnClick}>Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
