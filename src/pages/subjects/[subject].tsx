const { google } = require("googleapis");

import React, { useState, useEffect, lazy, Suspense, useContext } from "react";
import {
  Box,
  Tooltip,
  LinearProgress,
  Snackbar,
  Paper,
  Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import Head from "next/head";
import { GetStaticProps, GetStaticPaths } from "next";
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";

import Header from "../../components/Header";
import NoData from "../../components/NoData";
import Offline from "../../components/Offline";
import Loading from "../../components/Loading";
import SubjectSemesterBar from "../../components/SubjectSemesterBar";

import { useIndexedContext } from "../../context/IndexedContext";
import { offlineContext } from "../_app";
import { DataContext } from "../../context/TranscriptContext";
import Drawer from "./AllDrawer";

const TabsPC = dynamic(() => import("./TabsPc"));
const TabsPhone = dynamic(() => import("./TabsPhone"));

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

interface SubjectPageProps {
  subject: string;
  initialData: DataMap | null;
}

export default function SubjectPage({
  subject,
  initialData,
}: SubjectPageProps) {
  const [data, setData] = useState<DataMap | null>(initialData);
  // const [subjectLoading, setSubjectLoading] = useState(!initialData);
  // const [materialLoading, setMaterialLoading] = useState(false);
  // const [newFetchLoading, setNewFetchLoading] = useState(false);
  const [newItemsMsg, setNewItemsMsg] = useState("");  const [newItems, setNewItems] = useState([]);  
  const [showSemesterPrompt, setShowSemesterPrompt] = useState(false);
  const [currentSemesterValue, setCurrentSemesterValue] = useState<number>(0);
  const [subjectFullName, setSubjectFullName] = useState<string>("");

  const { getSubjectByName, addOrUpdateSubject, setLoading } =
    useIndexedContext();
  const [offline, setOffline] = React.useContext<boolean[]>(offlineContext);
  const { transcript } = useContext(DataContext);
  const router = useRouter();

  const [showDrawer, setShowDrawer] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("showDrawer") === "true";
    }
    return true;
  });

  const theme = useTheme();  useEffect(() => {
    // Check if the user has already set a semester
    const semesterInStorage = localStorage.getItem("semester");
    const currentSemester = localStorage.getItem("currentSemester");
    
    // If we have a current semester value but the user hasn't chosen if this is their semester yet
    if (currentSemester && (!semesterInStorage || semesterInStorage === "-1" || semesterInStorage === "-2")) {
      setCurrentSemesterValue(parseInt(currentSemester));
      // Show the semester prompt
      setShowSemesterPrompt(true);
    }

    // Find the full subject name from the transcript data
    if (transcript && "semesters" in transcript) {
      // Look through all semesters and find the subject with matching abbreviation
      const allSubjects = transcript.semesters.flatMap(sem => sem.subjects);
      const foundSubject = allSubjects.find(sub => sub.abbreviation === subject);
      
      if (foundSubject && foundSubject.name) {
        setSubjectFullName(foundSubject.name);
      }
    }
    
    // If initialData is not available, fetch it on the client side
    const loadData = async () => {
      // setSubjectLoading(true);
      const cachedSubject = await getSubjectByName(subject);

      if (cachedSubject) {
        // setMaterialLoading(false);
        setData(cachedSubject.folders);

        // Fetch new data
        // setNewFetchLoading(true);

        const result = await addOrUpdateSubject(subject, initialData);

        if (result.msg !== "No changes") {
          setNewItems(result.newItems);
          setNewItemsMsg(result.msg);
        }

        if (result.msg !== "No changes") {
          setData(initialData);
        }
        // setNewFetchLoading(false);
        // setMaterialLoading(false);

        // setNewFetchLoading(false);
        // setMaterialLoading(false);
      } else {
        // If no cached data, fetch from API

        setData(initialData);
        await addOrUpdateSubject(subject, initialData);
        // setMaterialLoading(false);
      }

      // setSubjectLoading(false);
    };

    loadData();
 

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "ArrowLeft") {
        setShowDrawer((prev) => {
          const newState = !prev;
          localStorage.setItem("showDrawer", newState.toString());
          return newState;
        });
      }
    };    addEventListener("keydown", handleKeyDown);

    return () => {
      removeEventListener("keydown", handleKeyDown);
    };
  }, [subject, transcript, initialData, getSubjectByName, addOrUpdateSubject]);

  // if (subjectLoading || materialLoading) {
  //   return <Loading />;
  // }

  // Handle fallback state when the page is being generated
  if (router.isFallback) {
    return <Loading />;
  }

  // If offline or no data, handle it gracefully
  if (offline) {
    return <Offline />;
  }

  // Show NoData component if no data is available after fetching
  if (!data || Object.keys(data).length === 0) {
    return <NoData />;
  }
  return (
    <Box sx={{ overflowX: "hidden", background: theme.palette.mode === "dark" ? "#151a2c" : "#f9fafb" }}>
      <Head>
        <title>{subject.toUpperCase()}</title>
        <link rel="icon" href={"../book.png"} />
      </Head>

      <>
        <Drawer
          subjectLoading={false}
          subject={subject}
          data={data}
          materialLoading={false}
          showDrawer={showDrawer}
        />
        <TabsPC
          showDrawer={showDrawer}
          // subjectLoading={subjectLoading}
          data={data}
          newItems={newItems}
        />
        <TabsPhone data={data} newItems={newItems} />      </>

      {/* Display the semester prompt if needed */}
      {showSemesterPrompt && (
        <SubjectSemesterBar 
          subject={subject} 
          semester={currentSemesterValue} 
          subjectFullName={subjectFullName}
        />
      )}
 

      {newItemsMsg && (
        <Paper elevation={6}>
          <Snackbar
            open={newItemsMsg !== ""}
            autoHideDuration={6000}
            onClose={() => setNewItemsMsg("")}
            message={newItemsMsg}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{
              "& .MuiSnackbarContent-root": {
                backgroundColor: "#e2e2e2",
                borderRadius: "15rem",
                color: "black",
                textAlign: "center",
              },
            }}
          >
            <Alert severity="info">{newItemsMsg}</Alert>
          </Snackbar>
        </Paper>
      )}
    </Box>
  );
}

// Fetch data at build time
export const getStaticProps: GetStaticProps = async (context) => {
  const subject = context.params?.subject as string;
  let initialData = null;

  // const SCOPES = ["https://www.googleapis.com/auth/drive"];

  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: process?.env?.TYPE,
      project_id: process?.env?.PROJECT_ID,
      private_key_id: process?.env?.PRIVATE_KEY_ID,
      private_key: process?.env?.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process?.env?.CLIENT_EMAIL,
      client_id: process?.env?.CLIENT_ID,
      auth_uri: process?.env?.AUTH_URI,
      token_uri: process?.env?.TOKEN_URI,
      auth_provider_x509_cert_url: process?.env?.AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process?.env?.CLIENT_X509_CERT_URL,
    },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  // @ts-ignore
  const GetDataOfSubject = async (subject, auth) => {
    let FilesData = {};
    const drive = google.drive({ version: "v3", auth });

    const { data: SubjectFolders } = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    if (!SubjectFolders.files || SubjectFolders.files.length === 0) {
      return FilesData;
    }
    // @ts-ignore
    const SubjectFolderIds = SubjectFolders.files.map((folder) => folder.id);
    let Parents = "";
    let dic = {};

    for (const SubjectFolderId of SubjectFolderIds) {
      const { data: SubjectSubFolders } = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${SubjectFolderId}' in parents`,
        fields: "files(id, name)",
      });

      for (const subFolder of SubjectSubFolders.files) {
        // @ts-ignore
        dic[subFolder.id] = subFolder.name;
        Parents += `'${subFolder.id}' in parents OR `;
      }
    }

    Parents = Parents.slice(0, -4); // Remove the trailing " OR "

    if (Parents.length <= 0) return FilesData;

    const { data: Files } = await drive.files.list({
      q: `${Parents} and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(mimeType,name,size,id,parents,owners(emailAddress))",
      pageSize: 1000,
    });

    // @ts-ignore
    for (const file of Files.files) {
      // @ts-ignore

      const parentName = dic[file.parents[0]];
      // @ts-ignore

      if (!FilesData[parentName]) {
        // @ts-ignore

        FilesData[parentName] = [];
      }
      // @ts-ignore

      FilesData[parentName].push(file);
    }

    return FilesData;
  };

  try {
    const res = await GetDataOfSubject(subject, auth);

    // @ts-ignore
    initialData = res;
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
  }

  return {
    props: {
      subject,
      initialData,
    },
  };
};

// Define static paths if necessary
export const getStaticPaths: GetStaticPaths = async () => {
  // Pre-generate some subject paths at build time

  const subjects = ["CSS", "DLD"]; // Example subjects // TODO code to fetch all materials

  const paths = subjects.map((subject) => ({
    params: { subject },
  }));

  return { paths, fallback: "blocking" }; // Fallback blocking to generate at request time, TODO we need to be true in the feature
};