import React, { useState } from "react";
import Head from "next/head";
import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import { google } from "googleapis";
import {
  Box,
  Container,
  Alert,
  Snackbar,
  Paper,
} from "@mui/material";

import ModernHeader from "../../components/ModernHeader";
import FileBrowser from "../../components/FileBrowser";
import SubjectSemesterPrompt from "../../components/SubjectSemesterPrompt";
import SubjectSidebar from "../../components/SubjectSidebar";
import Loading from "@/src/components/Loading";
import ProgressiveLoadingUI from "../../components/ProgressiveLoadingUI";
import { SubjectMaterials } from "../../utils/types";
import { useSplitSubject } from "../../hooks/useSplitSubject";
import coursesData from "../../Data/data.json";

interface Props {
  subject: string;
  initialData: SubjectMaterials;
  semesterIndex: number;
}

export default function SubjectPage({
  subject,
  initialData,
  semesterIndex,
}: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newItemsMsg, setNewItemsMsg] = useState("");

  // Use split subject hook for progressive loading
  const {
    data,
    folderStructure,
    loadingFolders,
    loadingFiles,
    newItems,
    error,
  } = useSplitSubject(subject, initialData);

  const handleAddToCustom = (abbr: string) => {
    const current = JSON.parse(
      localStorage.getItem("customSemesterSubjects") || "[]"
    );
    if (!current.includes(abbr)) {
      const updated = [...current, abbr];
      localStorage.setItem("customSemesterSubjects", JSON.stringify(updated));
      localStorage.setItem("semester", "-2");
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Show new items notification
  React.useEffect(() => {
    if (newItems.length > 0) {
      setNewItemsMsg(`${newItems.length} new item(s) found!`);
    }
  }, [newItems]);

  // Fallback state
  if (router.isFallback) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Loading />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{subject} | Materials</title>
      </Head>

      <SubjectSidebar
        currentSubject={subject}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <ModernHeader
        title={subject}
        isSearch={true}
        data={data || initialData}
        onMenuClick={handleDrawerToggle}
      />

      <Container maxWidth="xl" sx={{ py: 4, minHeight: "85vh" }}>
        
        {/* Progressive Loading UI */}
        {process.env.NODE_ENV === "development" && (
          <ProgressiveLoadingUI
            subject={subject}
            folderStructure={folderStructure}
            loadingFolders={loadingFolders}
            loadingFiles={loadingFiles}
            data={data}
          />
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Main Content */}
        {data ? (
          <FileBrowser
            data={data}
            subjectName={subject}
            newItems={newItems}
            fetching={loadingFiles}
          />
        ) : !loadingFolders && !loadingFiles ? (
          <Alert severity="info">No data available for this subject.</Alert>
        ) : null}
      </Container>

      <SubjectSemesterPrompt
        subjectAbbr={subject}
        semesterIndex={semesterIndex}
        onAddToCustom={handleAddToCustom}
      />

      {/* New items notification */}
      {newItemsMsg && (
        <Paper elevation={6}>
          <Snackbar
            open={newItemsMsg !== ""}
            autoHideDuration={6000}
            onClose={() => setNewItemsMsg("")}
            message={newItemsMsg}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity="info" onClose={() => setNewItemsMsg("")}>
              {newItemsMsg}
            </Alert>
          </Snackbar>
        </Paper>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Pre-generate popular subjects for instant loads
  const popularSubjects = ["CSS", "DLD", "DS", "Math101"]; // Your most accessed subjects
  
  const paths = popularSubjects.map((subject) => ({
    params: { subject },
  }));

  return {
    paths,
    fallback: true, // Generate others on demand
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const subject = context.params?.subject as string;

  if (!subject) {
    return { notFound: true };
  }

  // Find semester index
  let semesterIndex = 1;
  const foundSemester = coursesData.semesters.find((sem) =>
    sem.subjects.some((subj) => subj.abbreviation === subject)
  );
  if (foundSemester) {
    semesterIndex = foundSemester.index;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Optimized: Use same logic as API endpoints
    const { data: SubjectFolders } = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    if (!SubjectFolders.files?.length) {
      return {
        props: { subject, initialData: {}, semesterIndex },
        revalidate: 3600,
      };
    }

    const SubjectFolderIds = SubjectFolders.files.map((f) => f.id);
    let dic: Record<string, string> = {};
    let Parents = "";

    for (const folderId of SubjectFolderIds) {
      const { data: SubjectSubFolders } = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents`,
        fields: "files(id, name)",
        pageSize: 1000,
      });

      if (SubjectSubFolders.files) {
        SubjectSubFolders.files.forEach((subFolder) => {
          dic[subFolder.id!] = subFolder.name!;
          Parents += `'${subFolder.id}' in parents OR `;
        });
      }
    }

    Parents = Parents.slice(0, -4);

    if (!Parents) {
      return {
        props: { subject, initialData: {}, semesterIndex },
        revalidate: 3600,
      };
    }

    const { data: Files } = await drive.files.list({
      q: `${Parents} and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(id, name, mimeType, parents, size)",
      pageSize: 1000,
    });

    const organizedData: SubjectMaterials = {};

    Files.files?.forEach((file) => {
      const parentName = dic[file.parents?.[0] || ""];
      if (parentName) {
        if (!organizedData[parentName]) {
          organizedData[parentName] = [];
        }
        organizedData[parentName].push({
          id: file.id!,
          name: file.name!,
          mimeType: file.mimeType!,
          parents: file.parents || [],
          size: parseInt(file.size || "0"),
        });
      }
    });

    return {
      props: { subject, initialData: organizedData, semesterIndex },
      revalidate: 3600, // ISR: Update every hour in background
    };
  } catch (error: any) {
    console.error("Error fetching subject data:", error.message);
    return {
      props: { subject, initialData: {}, semesterIndex },
      revalidate: 60,
    };
  }
};