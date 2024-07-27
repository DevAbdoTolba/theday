"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import KeyIcon from "@mui/icons-material/VpnKey";
import { CircularProgress, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/router";

type FormDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function FormDialog({ open, setOpen }: FormDialogProps) {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [storedDialogOpen, setStoredDialogOpen] = React.useState(false);
  const [className, setClassName] = React.useState({ _id: "", class: "" });
  const [key, setKey] = React.useState("");
  const router = useRouter();

  const setCloseKeyDialog = () => {
    setOpen(false);
    setLoading(false);
    setError("");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  const handleStoredDialogClose = () => {
    setStoredDialogOpen(false);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());

    const key = formJson.key;
    setKey(key);

    // check if the data is valid and not empty
    if (!key) {
      setError("Key is required");
      return;
    }
    // the data is in the format of mongo ObjectId
    if (!key.match(/^[0-9a-fA-F]{24}$/)) {
      setError("Key is invalid");
      return;
    }
    setError("");
    setLoading(true);

    const storedClasses =
      JSON.parse(localStorage.getItem("classes") as string) || [];
    const isStored = storedClasses.some(
      (storedClass: any) => storedClass.id === key
    );

    if (isStored) {
      setStoredDialogOpen(true);
      setLoading(false);
    } else {
      fetch(`/api/getTranscriptName?className=${key}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.transcriptName) {
            setClassName(data.transcriptName);
            setConfirmDialogOpen(true);
          } else {
            throw new Error("Transcript not found");
          }
        })
        .catch((error) => {
          setSnackbarMessage(error.message);
          setSnackbarOpen(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleConfirm = () => {
    setConfirmDialogOpen(false);
    router.push(`/theday/q/${className._id}`).then(() => {
      router.reload();
    });
  };

  const handleStoredConfirm = () => {
    setStoredDialogOpen(false);
    setCloseKeyDialog();
    router.push(`/theday/q/${key}`);
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={() => setCloseKeyDialog()}
        PaperProps={{
          component: "form",
          onSubmit: handleFormSubmit,
        }}
      >
        <DialogTitle>
          Key <KeyIcon />
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            To get access to your class materials, please enter the secret key
            given to you by your class admin or the site ambassador. If you do
            not have a key, please contact your classmates to make sure they
            have one.
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="key"
            name="key"
            label="Transcript Key"
            type="text"
            fullWidth
            variant="standard"
            helperText={error || " "}
            error={Boolean(error)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseKeyDialog()}>Cancel</Button>
          <Button
            disabled={loading}
            type={loading ? "button" : "submit"}
            sx={{
              maxWidth: "20ch",
              minWidth: "20ch",
            }}
          >
            {loading ? <CircularProgress /> : "Submit Key"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
        <DialogTitle>Confirm Class</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Is {className.class} your class?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Reject</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={storedDialogOpen} onClose={handleStoredDialogClose}>
        <DialogTitle>Class Already Stored</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This class is already stored on your device. Do you want to switch
            to it?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStoredDialogClose}>Reject</Button>
          <Button onClick={handleStoredConfirm}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
}
