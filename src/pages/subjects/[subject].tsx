import React, { Suspense, lazy, useState, useEffect } from "react";

import Header from "../../components/Header";
import NoData from "../../components/NoData";
import Search from "./Search";

import CssBaseline from "@mui/material/CssBaseline";
import { Typography, Grid, Box, Tooltip, Snackbar, Paper } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";

import Offline from "../../components/Offline";
import { offlineContext } from "../_app";
import NavTabs from "./Tabs";
import Drawer from "./AllDrawer";

import LinearProgress from "@mui/material/LinearProgress";

// import TabsPC from "./TabsPc";
// import TabsPhone from "./TabsPhone";

import { useIndexedContext } from "../../Data/IndexedContext";

import Loading from "../../components/Loading";
const TabsPC = lazy(() => import("./TabsPc"));
const TabsPhone = lazy(() => import("./TabsPhone"));

interface Data {
  id: string;
  mimeType: string;
  name: string;
  parents: string[];
  size: number;
}

interface DataMap {
  [key: string]: Data[];
}

function SubjectPage() {
  const [data, setData] = useState<DataMap>();

  const router = useRouter();
  // get parameters from url
  const [subject, setSubject] = useState("");
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [newFetchLoading, setNewFetchLoading] = useState(false);
  const [newItemsMsg, setNewItemsMsg] = useState("");
  const { getSubjectByName, addOrUpdateSubject, setLoading } =
    useIndexedContext();
  const [newItems, setNewItems] = useState([]);

  let showDrawerFromLocalStorage;

  if (typeof window !== "undefined") {
    showDrawerFromLocalStorage = localStorage.getItem("showDrawer");
  }

  const [showDrawer, setShowDrawer] = useState(
    showDrawerFromLocalStorage === "true"
      ? true
      : showDrawerFromLocalStorage === "false"
      ? false
      : true
  );

  const [offline, setOffline] = React.useContext<boolean[]>(offlineContext);

  const loadData = async (subject: string) => {
    setLoading(true);

    const cachedSubject = await getSubjectByName(subject);

    if (cachedSubject) {
      setMaterialLoading(false);
      setData(cachedSubject.folders);
      setLoading(false);

      setTimeout(() => {
        setNewFetchLoading(true);
        // Fetch the data and update if necessary
        fetch(`/api/subjects/${subject}`)
          .then((res) => res.json())
          .then(async (fetchedData) => {
            const result = await addOrUpdateSubject(subject, fetchedData);

            setNewItems(result.newItems);
            setNewItemsMsg(result.msg);

            if (result.msg !== "No changes") {
              setData(fetchedData);
            }
            setNewFetchLoading(false);
            setMaterialLoading(false);
          })
          .catch((error) => {
            console.error(error);
            setNewFetchLoading(false);
            setMaterialLoading(false);
          });
      }, 1000);
    } else {
      setMaterialLoading(true);
      // Fetch data as the subject is not in the DB
      fetch(`/api/subjects/${subject}`)
        .then((res) => res.json())
        .then(async (fetchedData) => {
          setData(fetchedData);
          await addOrUpdateSubject(subject, fetchedData);
          setMaterialLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setMaterialLoading(false);
        });
    }

    setSubjectLoading(false);
    setLoading(false);
  };

  useEffect(() => {
    if (router.isReady) {
      const { subject } = router.query;
      loadData(subject as string);
      setSubject(subject as string);

      // event listen if shift + arrow left is pressed log hi

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.shiftKey && e.key === "ArrowLeft") {
          setShowDrawer((prev) => {
            localStorage.setItem("showDrawer", (!prev).toString());
            return !prev;
          });
        }
      };

      addEventListener("keydown", handleKeyDown);

      return () => {
        removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [router.isReady]);

  // fetch data from api

  // if data is not fetched yet

  // const router = useRouter();
  // const [subjectAbbreviation, setSubjectAbbreviation] = React.useState("s");
  // useEffect(() => {
  //   const subject = router.query.subject;
  //   console.log("useEffect before fun " + subject);
  //   setSubjectAbbreviation(
  //     fetch(`/api/subjects/${subject}`)
  //       .then((res) => res.json())
  //       .then((data) => {
  //         return data;
  //       })
  //   );
  //   console.log("useEffect after fun " + subjectAbbreviation);
  // }, []);
  //   const { subjectID } = useParams();

  // get the subjcet from data that matches the subject param
  //   const subjects = data.semesters.map((semester) =>
  //     semester.subjects.filter((subject) => subject.abbreviation === subjectID)
  //   );
  //   const subject = subjects
  //     .filter((subject) => subject.length > 0)
  //     .map((subject) => subject[0]);
  if (subjectLoading || materialLoading) {
    return <Loading />;
  }

  return (
    <Box
      sx={{
        overflowX: "hidden",
      }}
    >
      <Head>
        <title>
          {(() => {
            // check if there is a localstorage named "first-visited-subject" if not set it to the current date

            if (!localStorage.getItem("first-visited-subject")) {
              localStorage.setItem(
                "first-visited-subject",
                subject.toUpperCase()
              );
            }
            // update localstorage "last-visited-subject" to the current subjcet name
            localStorage.setItem("last-visited-subject", subject.toUpperCase());
            return subject.toUpperCase();
          })()}
        </title>
        <link rel="icon" href={"../book.png"} />
        <style>
          {`
              *{
                scroll-behavior: smooth;
              }
            `}
        </style>
      </Head>

      {offline && materialLoading ? (
        <Offline />
      ) : (
        <>
          {!data ? (
            <NoData />
          ) : !Object?.keys(data)?.length ? (
            <NoData />
          ) : (
            <>
              <Drawer
                subjectLoading={subjectLoading}
                subject={subject}
                data={data}
                materialLoading={materialLoading}
                showDrawer={showDrawer}
              />

              <TabsPC
                showDrawer={showDrawer}
                subjectLoading={subjectLoading}
                data={data}
                newItems={newItems}
              />
              <TabsPhone data={data} newItems={newItems} />
            </>
          )}
        </>
      )}
      {newFetchLoading && (
        <Tooltip title="Fetching new data..." placement="top">
          <LinearProgress
            sx={{
              position: "fixed",

              top: 0,
              left: 0,
              width: "100%",
              zIndex: 1000,
              "&.MuiLinearProgress-root": {
                backgroundColor: "#272727",
              },

              "& .MuiLinearProgress-bar ": {
                height: "1px",
                borderRadius: "50px",
              },
            }}
          />
        </Tooltip>
      )}
      {/* simple notification alert showing result.msg  */}
      {newItemsMsg && (
        <Paper elevation={6}>
          <Snackbar
            open={
              newItemsMsg !== ""
                ? newItemsMsg === "No changes"
                  ? false
                  : true
                : false
            }
            autoHideDuration={6000}
            onClose={() => setNewItemsMsg("")}
            message={newItemsMsg}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{
              "& .MuiSnackbarContent-root": {
                backgroundColor: "#e2e2e2",
                borderRadius: "15rem",
                color: "#fff",
                textAlign: "center",
                "& .MuiSnackbarContent-message": {
                  width: "100%",
                  fontSize: "1rem",
                  "&::after": {
                    content: "'since last visit'",
                    fontSize: "1ch",
                    position: "absolute",
                    right: "10%",
                    bottom: "10%",
                    color: "#black",
                  },
                },
              },
            }}
          />
        </Paper>
      )}
    </Box>
  );
}

export default SubjectPage;

// function to get subject data from subject api, using subject abbreviation
