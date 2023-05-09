import React, {
  Suspense,
  lazy,
  useState,
  useEffect,
  startTransition,
} from "react";

import Header from "../../components/Header";
import CssBaseline from "@mui/material/CssBaseline";
import { Typography } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";

// import TabsPC from "./TabsPc";
// import TabsPhone from "./TabsPhone";

const TabsPC = lazy(() => import("./TabsPc"));
const TabsPhone = lazy(() => import("./TabsPhone"));

function SubjectPage() {
  const [data, setData] = useState(null);

  const router = useRouter();
  // get parameters from url
  const [subject, setSubject] = useState(null);
  const [subjectLoading, setSubjectLoading] = useState(true);

  useEffect(() => {
    if (router.isReady) {
      const subject = router.query;

      setSubject(subject);

      console.log(
        "%cAbdoTolba was here!! :D",
        "color: red; font-family: sans-serif; font-size: 4.5rem; font-weight: bolder; text-shadow: #000 1px 1px;"
      );

      setSubjectLoading(false);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (subject) {
      fetch(`/api/subjects/${subject.subject}`)
        .then((res) => res?.json())
        .then((data) => {
          setData(data);
          console.log(data);
        });
    }
  }, [subject]);

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
    <>
      <Head>
        <title>
          {subjectLoading ? "Loading..." : subject.subject.toUpperCase()}
        </title>
        <link
          rel="icon"
          href={
            "https://media.discordapp.net/attachments/1008571067398369291/1072747092805701672/9i0uyhiy_centered_book_book_faceing__main_object_is_book_a_book_1c9248e7-67be-4b89-86ac-96c79d314feb-removebg-preview.png?width=372&height=372"
          }
        />
      </Head>
      <CssBaseline />
      <Header
        title={subjectLoading ? "Loading..." : subject.subject.toUpperCase()}
        isSearch={false}
      />
      <Suspense fallback={<div>Loading...</div>}>
        {data && (
          <>
            <TabsPC data={data} />
            <TabsPhone data={data} />
          </>
        )}
      </Suspense>
    </>
  );
}

export default SubjectPage;

// function to get subject data from subject api, using subject abbreviation
