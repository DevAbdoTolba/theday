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

// import TabsPC from "./TabsPc";
// import TabsPhone from "./TabsPhone";

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
  const [materialLoading, setMaterialLoading] = useState(true);
  const [dots, setDots] = useState(".");

  const [offline, setOffline] = React.useContext(offlineContext);

  useEffect(() => {
    if (router.isReady) {
      const { subject } = router.query;
      console.log("it is", subject);

      setSubject(subject as string);

      console.log(
        "%cAbdoTolba was here!! :D",
        "color: red; font-family: sans-serif; font-size: 4.5rem; font-weight: bolder; text-shadow: #000 1px 1px;"
      );

      setSubjectLoading(false);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (subject) {
      fetch(`/api/subjects/${subject}`)
        .then((res) => {
          if (res.ok) {
            return res.json(); // If response is ok, parse JSON data
          } else {
            throw new Error("Network response was not ok"); // Throw an error if response is not ok
          }
        })
        .then((data) => {
          // if data is null set data to {}
          setData(data);

          console.log(data);
          setMaterialLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setMaterialLoading(false);
        });
    }
  }, [subject]);

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

  return (
    <Box
      sx={{
        overflowX: "hidden",
      }}
    >
      <Head>
        <title>{subjectLoading ? "Loading..." : subject.toUpperCase()}</title>
        <link
          rel="icon"
          href={
            "https://media.discordapp.net/attachments/1008571067398369291/1072747092805701672/9i0uyhiy_centered_book_book_faceing__main_object_is_book_a_book_1c9248e7-67be-4b89-86ac-96c79d314feb-removebg-preview.png?width=372&height=372"
          }
        />
        <style>
          {`
              *{
                scroll-behavior: smooth;
              }
            `}
        </style>
      </Head>
      {subjectLoading ? (
        <Header title={"Loading..."} isSearch={false} isSubjectSearch={false} />
      ) : (
        <Header
          title={subject.toUpperCase()}
          isSearch={false}
          data={data}
          isSubjectSearch={
            (materialLoading as boolean)
              ? false
              : data
              ? ((Object?.keys(data)?.length > 0) as boolean)
              : false
          }
        />
      )}

      {offline && materialLoading ? (
        <Offline />
      ) : (
        <>
          {materialLoading ? (
            <Typography
              variant="h5"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
              }}
            >
              Loading{dots}
            </Typography>
          ) : (
            <Suspense fallback={<div>Loading...</div>}>
              {!data ? (
                <NoData />
              ) : !Object?.keys(data)?.length ? (
                <NoData />
              ) : (
                <>
                  <TabsPC data={data} />
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
