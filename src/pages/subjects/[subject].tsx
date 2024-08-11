import React, { Suspense, lazy, useState, useEffect } from "react";

import Header from "../../components/Header";
import NoData from "../../components/NoData";
import Search from "./Search";

import CssBaseline from "@mui/material/CssBaseline";
import { Typography, Grid, Box } from "@mui/material";
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
  const [dots, setDots] = useState(".");
  const { getSubjectByName, addOrUpdateSubject, setLoading } =
    useIndexedContext();

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

  useEffect(() => {
    if (router.isReady) {
      const { subject } = router.query;
      loadData(subject as string);
    }
  }, [router.isReady]);

  const loadData = async (subject: string) => {
    setLoading(true);

    const cachedSubject = await getSubjectByName(subject);

    if (cachedSubject) {
      setMaterialLoading(false);
      setData(cachedSubject.folders);
      setLoading(false);
      setNewFetchLoading(true);

      // Fetch the data and update if necessary
      fetch(`/api/subjects/${subject}`)
        .then((res) => res.json())
        .then(async (fetchedData) => {
          const result = await addOrUpdateSubject(subject, fetchedData);
          console.log("changes? ", result);

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
    setTimeout(() => {
      if (materialLoading) {
        // add dots until it reaches dots, then deacrese them until they reach 1 and reapet
        if (dots.length < 3) {
          setDots(dots + ".");
        }
        if (dots.length === 3) {
          setDots("");
        }
      }
    }, 333);
  }, [dots]);

  // event listen if shift + arrow left is pressed log hi
  useEffect(() => {
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
  }, []);

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
  if (subjectLoading) {
    return <Loading />;
  }

  return (
    <Box
      sx={{
        overflowX: "hidden",
      }}
    >
      {newFetchLoading && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1000,
          }}
        />
      )}

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
          {materialLoading ? (
            // <Typography
            //   variant="h5"
            //   sx={{
            //     position: "absolute",
            //     top: "50%",
            //     left: "50%",
            //     transform: "translate(-50%,-50%)",
            //   }}
            // >
            //   Loading{dots}
            // </Typography>
            <Loading />
          ) : (
            <Suspense fallback={<Loading />}>
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
                  />
                  <TabsPhone data={data} />
                </>
              )}
            </Suspense>
          )}
        </>
      )}
    </Box>
  );
}

export default SubjectPage;

// function to get subject data from subject api, using subject abbreviation
