"use client";
import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { CircularProgress, Snackbar, Alert, Typography } from "@mui/material";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import { useRouter } from "next/router";

type FormDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const translations = {
  en: {
    dialogTitle: "Key",
    dialogContent:
      "To get access to your class materials, please enter the secret key given to you by your class admin or the site ambassador. If you do not have a key, please contact your classmates to make sure they have one.",
    transcriptKeyLabel: "Transcript Key",
    cancelButton: "Cancel",
    submitKeyButton: "Submit Key",
    confirmClassTitle: "Confirm Class",
    confirmClassContent: (className: string) => `Is ${className} your class?`,
    rejectButton: "Reject",
    confirmButton: "Confirm",
    storedClassTitle: "Class Already Stored",
    storedClassContent:
      "This class is already stored on your device. Do you want to switch to it?",
  },
  ar: {
    dialogTitle: "مفتاح",
    dialogContent:
      "لتحصل على أذن الولوج إلى بيانات الدفعة الجامعية الخاصة بك. يرجى إدخال المفتاح السري الذي أعطاه لك مسؤول الدفعة أو المطور لهذا الموقع في دفعتكم الجامعية. إن لم يكن معك مفتاح يرجى التواصل مع زملائك للتأكد من حصولهم على واحد أو التكلم مع أحد المطورين المذكور أسمهم في الأسفل",
    transcriptKeyLabel: "مفتاج المنهج",
    cancelButton: "إلغاء",
    submitKeyButton: "إرسال المفتاح",
    confirmClassTitle: "تأكيد الدفعة",
    confirmClassContent: (className: string): string =>
      `هل ${className} دفعتك؟`,
    rejectButton: "رفض",
    confirmButton: "تأكيد",
    storedClassTitle: "الدفعة مخزنة بالفعل",
    storedClassContent:
      "هذه الدفعة مخزنة بالفعل على جهازك. هل تريد التبديل إليها؟",
  },
};

export default function FormDialog({ open, setOpen }: FormDialogProps) {
  const [language, setLanguage] = React.useState<"en" | "ar">("en");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [storedDialogOpen, setStoredDialogOpen] = React.useState(false);
  const [className, setClassName] = React.useState({ _id: "", class: "" });
  const [key, setKey] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    // @ts-ignore
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.includes("ar")) {
      setLanguage("ar");
    }
  }, []);

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

    if (!key) {
      setError("Key is required");
      return;
    }

    if (!key.match(/^[0-9a-fA-F]{24}$/)) {
      setError(
        language === "en" ? "Key is invalid" : "يرجى إدخال المفتاح بشكل صحيح"
      );
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

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"));
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
        <DialogTitle
          sx={{
            textAlign: language === "en" ? "left" : "right",
            display: "flex",
            flexDirection: language === "en" ? "row" : "row-reverse",
            alignItems: "center",
          }}
        >
          <Typography>{translations[language].dialogTitle}</Typography>
          <Button
            onClick={toggleLanguage}
            startIcon={<TranslateRoundedIcon />}
            sx={{ marginLeft: "auto", fontWeight: "bold" }}
          >
            {language === "en" ? "ع" : "E"}
          </Button>
        </DialogTitle>
        <DialogContent dir={language === "en" ? "ltr" : "rtl"}>
          <DialogContentText>
            {translations[language].dialogContent}
          </DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            id="key"
            name="key"
            sx={{
              "& .MuiInputLabel-root":
                language === "ar"
                  ? {
                      right: "0px",
                      transformOrigin: "top right",
                      "& .MuiFormHelperText-root": {
                        textAlign: "right",
                      },
                    }
                  : {
                      textAlign: "left",
                    },
            }}
            label={translations[language].transcriptKeyLabel}
            type="text"
            fullWidth
            variant="standard"
            helperText={error || " "}
            error={Boolean(error)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseKeyDialog()}>
            {translations[language].cancelButton}
          </Button>
          <Button
            disabled={loading}
            type={loading ? "button" : "submit"}
            sx={{
              maxWidth: "20ch",
              minWidth: "20ch",
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : (
              translations[language].submitKeyButton
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
        <DialogTitle>{translations[language].confirmClassTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translations[language].confirmClassContent(className.class)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>
            {translations[language].rejectButton}
          </Button>
          <Button onClick={handleConfirm}>
            {translations[language].confirmButton}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={storedDialogOpen} onClose={handleStoredDialogClose}>
        <DialogTitle>{translations[language].storedClassTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translations[language].storedClassContent}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStoredDialogClose}>
            {translations[language].rejectButton}
          </Button>
          <Button onClick={handleStoredConfirm}>
            {translations[language].confirmButton}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
        <DialogTitle>
          {language === "en" ? "Confirm Class" : "تأكيد الدفعة"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {language === "en"
              ? `Is ${className.class} your class?`
              : `هل ${className.class} دفعتك؟`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>
            {language === "en" ? "Reject" : "رفض"}
          </Button>
          <Button onClick={handleConfirm}>
            {language === "en" ? "Confirm" : "تأكيد"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={storedDialogOpen} onClose={handleStoredDialogClose}>
        <DialogTitle>
          {language === "en" ? "Class Already Stored" : "الدفعة مخزنة بالفعل"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {language === "en"
              ? "This class is already stored on your device. Do you want to switch to it?"
              : "هذه الدفعة مخزنة بالفعل على جهازك. هل تريد التبديل إليها؟"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStoredDialogClose}>
            {language === "en" ? "Reject" : "رفض"}
          </Button>
          <Button onClick={handleStoredConfirm}>
            {language === "en" ? "Confirm" : "تأكيد"}
          </Button>
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
