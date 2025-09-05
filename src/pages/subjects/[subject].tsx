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
import { getItem, setItem } from "../../utils/storage";

import Header from "../../components/Header";
import NoData from "../../components/NoData";
import Offline from "../../components/Offline";
import Loading from "../../components/Loading";
import SubjectSemesterBar from "../../components/SubjectSemesterBar";

import { useIndexedContext } from "../../context/IndexedContext";
import { offlineContext } from "../../context/AppContext";
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

  const [showDrawer, setShowDrawer] = useState<boolean>(true);

  const theme = useTheme();
  useEffect(() => {
    // Initialize showDrawer from storage on mount
    const storedShow = getItem("showDrawer");
    if (storedShow !== null) setShowDrawer(storedShow === "true");
    // Check if the user has already set a semester
    const semesterInStorage = getItem("semester");
    const currentSemester = getItem("currentSemester");
    
    // If we have a current semester value but the user hasn't chosen if this is their semester yet
    if (currentSemester && (!semesterInStorage || semesterInStorage === "-1" || semesterInStorage === "-2")) {
      setCurrentSemesterValue(parseInt(currentSemester));
      // Show the semester prompt
      setShowSemesterPrompt(true);
    }

    // Find the full subject name from the transcript data
    if (transcript && "semesters" in transcript) {
      // Look through all semesters and find the subject with matching abbreviation
      const allSubjects = transcript.semesters.flatMap((sem: any) => sem.subjects);
      const foundSubject = allSubjects.find((sub: any) => sub.abbreviation === subject);
      
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
//     setData(
// {
//   "Online Lectures Dr.Mostafa": [
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1-54-s2O_lr-P1GHmLXudnVXoted4ia-P",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DCBN2MWGTaoI Lecture5 Part3",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1-CRJBBf6KKrx1mFvqIaJl8U28hkKh3UP",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DfJEATx4aO30 Lecture5 Part2",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1a9J4Rc_otra_e8eegJcDUjsxtfm7sTnT",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D9qK2kktfKV4 Lecture5 Part1",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1FUHpQ9uny12g_BGj4DKpKOngo3-r9G3u",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DVLrUq2NM_k4 Lecture2 Part2",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1YekytWv4TxHMKQw4P3zYwL-ceVBr7-5E",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DFum4WZy9fkg Lecture2 Part1",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1we0VJRyC-CFqDCj4fuydFrK8dxRXvwUP",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D2NNuqzlHQbw Lecture3 Part2",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1mhKlYw2a9iVjGcqAqAJ33donj1fHQ8ZI",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D2sLym0urj80 Lecture3 Part1",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1-7yykkfXcYVR5dMdbAuQZivM8lcEyNd1",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dtz7GmTJvKoY Lecture4 Part2",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1jgrrBL3rCW_GlCXlDFHyCfswxzjDziDu",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DDqSM9N9ld6o Lecture4 Part1",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1HD9b-m03I2X7RKeL6Wy9-Re30DqB2LDI",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D0uD5y4V5n-0 Lecture1 Part2",
//       "mimeType": "application/octet-stream",
//     },
//     {
//       "parents": [
//         "1tlYMAfsFZiWAGeKGNIWCL4VWwH4gGXgP"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1NgNZnLct8iXQ2wJinG0Gm4zYZYV2Zjel",
//       "name": "https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D-cT6lD1ceRM Lecture1 Part1",
//       "mimeType": "application/octet-stream",
//     }
//   ],
//   "Ex exams": [
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1X53TZK62hZTkP1dJfBhLPhBQNp5S3zf6",
//       "name": "Final Dr.Abdallah 2022.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1tqLit-pOUxaQsbanQa2-T7CEEb6bQVnS",
//       "name": "Final Dr.Shady 2021.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1gBF-fAQ3pWpmzX5CQpgArdPURrtSHWo0",
//       "name": "12th Dr.Mostafa p2.jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "11x-KhJBtSr7dciS9Nb8bzkGvgEDk8H0m",
//       "name": "Final Dr.Mostafa 2022 p2 .jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1qijmP7O8h9bP-VJ9_yoXnQ3UgbO-hKB9",
//       "name": "Final Dr.Mostafa 2022 p3 .jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1hLaQ2_sVFnCJHz5OuAxwe84Ttvip3gOr",
//       "name": "Final Dr.Mostafa 2022 p1 .jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1SuONlFOgCavXECZrkVgfPLi9po2dJQa4",
//       "name": "12th Dr.Mostafa p1.jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1ANqb_kT6XnewDyuhGVoXk4446EIVq3zK",
//       "name": "Final Dr.Mostafa p2.jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1lAOfs9uafYSidxbEqppUWN3f0uZ0Ue_e",
//       "name": "Final Dr.Mostafa p3.jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1aZiZcYil3PrwIO93CMUgT1Aua9VNKsSf",
//       "name": "7Th Dr.Mostafa p1.jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1PI19W2VoXwlRvp_RjSjtdYp22sWqUi0A",
//       "name": "7Th Dr.Mostafa p2.jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1hLUl5mXBn76QL7dvrUDeWcV1s7RIPdTG",
//       "name": "Final Dr.Mostafa p1.jpg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1SWRL3WwUU8ODYtRgQfHfIV3p9kUcLTHR",
//       "name": "midterm 1.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "17I1xD7gRKFIF24fDfXg-HbT6WIMJ-lCY",
//       "name": "midterm 2.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2210@gmail.com"
//         }
//       ],
//       "id": "1dk93x1YWKU1YK-7J4Ese0gnnY4ac1MpJ",
//       "name": "simulation final solution 2021.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2210@gmail.com"
//         }
//       ],
//       "id": "1-zvtbwcGV6UrPu5XF53Z7m9CCh2_0t72",
//       "name": "Final.jpeg",
//       "mimeType": "image/jpeg",
//     },
//     {
//       "parents": [
//         "1R4WCsdJH2XwRcHzpW668pf-Tz9FRcEiK"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2210@gmail.com"
//         }
//       ],
//       "id": "1513ANb_3c1QSd0tOtHsfiCG4DOa3Pw7h",
//       "name": "Final 2.jpeg",
//       "mimeType": "image/jpeg",
//     }
//   ],
//   "Sections": [
//     {
//       "parents": [
//         "1fr-FWVk7ZfkhiYidFMQmYgHLVelYj0Vt"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "10xkZUotyS_VutdpRMaMYSURaSs01gWUH",
//       "name": "sec15.pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     },
//     {
//       "parents": [
//         "1fr-FWVk7ZfkhiYidFMQmYgHLVelYj0Vt"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1i7_-Pj31pkGgk4dtNJem9dG1Xg5VC-Hv",
//       "name": "sec 6.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1fr-FWVk7ZfkhiYidFMQmYgHLVelYj0Vt"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1ia0caiG45x-jGowoPp6fdZH5r8ZbMba7",
//       "name": "sec7.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1fr-FWVk7ZfkhiYidFMQmYgHLVelYj0Vt"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1UNqq37O-HvInN59x8eRgfPs_OEi5GInG",
//       "name": "sec9.pdf",
//       "mimeType": "application/pdf",
//     }
//   ],
//   "Lectures": [
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1ljymYq-mlZwTeJHXYa-1vdRIitwAK0tC",
//       "name": "Lecturer 13.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1TiUK0MT6Y2PobbcOgv5JeCcn5FG2k7By",
//       "name": "Lecturer 11.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1-JVaRxvDEobaN6hydf53GbNu3CsQdgmK",
//       "name": "Lecturer 10.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1wISvgU7sU9lEnQ4Im-xk2ePd4wjDOqIt",
//       "name": "Lecturer 9.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1637rw39T49RTzR5a5j9wak_tNZ7xZTnz",
//       "name": "Lecturer 8.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2210@gmail.com"
//         }
//       ],
//       "id": "1HYlwVfCvObM-p-s1OHWwnzdElOMPLyDr",
//       "name": "Discrete Event System Simulation (Fifth Edition) .pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2210@gmail.com"
//         }
//       ],
//       "id": "1WlvxFXkg7MThS_3kvJy3m6atZWPRUC9_",
//       "name": "Lecture 3.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2210@gmail.com"
//         }
//       ],
//       "id": "1zrakZa4K46fvs4_77VhAHPyxDtcYeKyw",
//       "name": "Lecturer 1.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2210@gmail.com"
//         }
//       ],
//       "id": "13q-GowJxiZtg2Wr-8KiU4XfPQ0zddOkd",
//       "name": "Lecturer 2.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2210@gmail.com"
//         }
//       ],
//       "id": "1yN-b4wm_8RBdaCPiH1jxtgqla3fSH89d",
//       "name": "Lecturer 4.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "19krSy7wnJkolE_OAaUPWvgQ0Q-YdvsaL",
//       "name": "Lecturer 6.pdf",
//       "mimeType": "application/pdf",
//     },
//     {
//       "parents": [
//         "1HPgEYhKwBsIYxitINBJblkYxTEx5kNjy"
//       ],
//       "owners": [
//         {
//           "emailAddress": "backteamcs2110@gmail.com"
//         }
//       ],
//       "id": "1TRomAALGh7JCLkiR7ltrAKIuNpOXwIH9",
//       "name": "Lecturer 5.pdf",
//       "mimeType": "application/pdf",
//     }
//   ],
//   "Lectures Dr. Abdallah Hassan": [
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "11xJbg29CfgOwE2TmC4dH5p83KNm0AhR5",
//       "name": "Assigments",
//       "mimeType": "application/vnd.google-apps.folder"
//     },
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1KRqwREIikggQHHtiUMPn8mvfiIWzm-se",
//       "name": "sim_lecture7.pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     },
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1MIE8jl5qz7ZHFER57Z8JeIvLhk1knrp6",
//       "name": "sim_lecture5 (2).pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     },
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1Gm7LKCaS7CY8RPTeUv0qgTVLQy9j2QDu",
//       "name": "sim_lecture6.pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     },
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "15SjqNwR195fyiIhQL_lwcWqHdICGer8y",
//       "name": "sim_lecture3 (2).pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     },
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1C39bq_P6iPXN5ixlp6juYN8DVI7Iq3tb",
//       "name": "sim_lecture4 (1).pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     },
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1suP-ItQu-lM5Ov_FI8ne_QrdlUP35zTs",
//       "name": "sim_lecture1 (2).pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     },
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1_a-gws1_cfD6GZT32f6MnPvDm2nNj0Ys",
//       "name": "sim_lecture2 (2).pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     },
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1dD2NAZl77CtEJlGrLSqetBiTKKcPGA6-",
//       "name": "sim_lecture8 (2).pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     },
//     {
//       "parents": [
//         "1j26nSllPJgcqmIEwwbdN_L-oP1i-gDuS"
//       ],
//       "owners": [
//         {
//           "emailAddress": "ftaf00271@gmail.com"
//         }
//       ],
//       "id": "1ZyVXoBIVnviM11VP2BW304UjP8Cyc04P",
//       "name": "sim_lecture9 (1).pptx",
//       "mimeType": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//     }
//   ]
// }
// );

  const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "ArrowLeft") {
    setShowDrawer((prev: boolean) => {
          const newState = !prev;
      setItem("showDrawer", newState.toString());
          return newState;
        });
      }
    };
    addEventListener("keydown", handleKeyDown);

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

      {/* {
        <Tooltip title="Fetching new data..." placement="top">
          <LinearProgress
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              zIndex: 1000,
              "&.MuiLinearProgress-root": { backgroundColor: "#272727" },
              "& .MuiLinearProgress-bar ": {
                height: "1px",
                borderRadius: "50px",
              },
            }}
          />
        </Tooltip>
      } */}

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

  const SCOPES = ["https://www.googleapis.com/auth/drive"];

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
    scopes: SCOPES,
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
