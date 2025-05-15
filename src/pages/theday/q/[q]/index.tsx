import React, {
  Suspense,
  lazy,
  useState,
  useEffect,
  forwardRef,
  useContext,
} from "react";

import Header from "../../../../components/Header";
import Footer from "../../../../components/Footer";

import CurrentSemester from "./CurrentSemester";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

import { Paper, Box } from "@mui/material";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import Offline from "../../../../components/Offline";
import { offlineContext } from "../../../_app";
import { DataContext } from "../../../../context/TranscriptContext";
import { useTheme } from "@mui/material/styles";

const Main = lazy(() => import("./Main"));

const Alert = forwardRef(function Alert(props: any, ref: any) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function App() {
  const { transcript, loadingTranscript, error } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const [currentSemester, setCurrentSemester] = useState(-1);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [upTo, setUpTo] = useState(0);
  const [isMaxSemester, setIsMaxSemester] = useState(0);

  const [offline, setOffline] = useContext(offlineContext);

  const theme = useTheme();

  const handleClick = () => {
    setOpen(true);

    setCurrentSemester(-1);
  };

  const handleClose = (
    event: React.SyntheticEvent<any, Event>,
    reason: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    const semester = JSON.parse(localStorage.getItem("semester") as string);
    console.log(transcript);

    if (transcript && 'semesters' in transcript && transcript.semesters.length > 0) {
      if (semester == transcript.semesters[transcript.semesters.length - 1].index) {
        setIsMaxSemester(1);
      } else {
        setIsMaxSemester(0);
      }
    }
  }, [transcript]);

  useEffect(() => {
    const semester = JSON.parse(localStorage.getItem("semester") as string);

    if (semester) {
      setCurrentSemester(semester);
      setUpTo(semester);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log("offline", offline);
    console.log("loading", loading);
  }, [offline, loading]);

  return (
    <>
      <Header title="TheDay" setSearch={setSearch} isSearch={true} />
      {loadingTranscript && offline && <Offline />}
      {!loadingTranscript && (
        <Box
          sx={{
            pt: { sm: "2%", xs: "10%" },
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            background: theme.palette.mode === "dark" ? "#151a2c" : "#fff",
            borderRadius: 0,
            p: 3,
          }}
        >
          {currentSemester !== -1 && (
            <>
              <CurrentSemester
                currentSemester={currentSemester}
                handleClick={handleClick}
                setOpen={setOpen}
              />
            </>
          )}
          <Paper
            sx={{
              width: "100%",
              minHeight: "100dvh",
              maxWidth: { sm: "80%", xs: "100%" },
              position: "relative",
              // background: "#181f33",
              background: theme.palette.mode === "dark" ? "#181f33" : "#fff",

            }}
          >
            <Suspense
              fallback={
                <Stack spacing={1}>
                  {/* For variant="text", adjust the height via font-size */}
                  <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                  {/* For other variants, adjust the size with `width` and `height` */}
                  <Skeleton variant="rectangular" width={210} height={60} />
                  <Skeleton variant="rounded" width={210} height={60} />
                </Stack>
              }
            >
              <Main search={search} currentSemester={currentSemester} />
            </Suspense>
          </Paper>
        </Box>
      )}

      <Snackbar open={open} autoHideDuration={6000}>
        {!isMaxSemester ? (
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Up to semester{" "}
            {<span style={{ fontWeight: "800" }}>{upTo + 1}</span>} 🌟🤠
          </Alert>
        ) : (
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Congratulations on graduating 🥳🎉
          </Alert>
        )}
      </Snackbar>
      <Footer />
    </>
  );
}

export default App;
