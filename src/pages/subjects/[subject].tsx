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

  // Track last visited subject for "Continue studying" feature
  React.useEffect(() => {
    if (subject) {
      // Find full name from data
      let fullName = subject;
      
      for (const semester of coursesData.semesters) {
        const found = semester.subjects.find(s => s.abbreviation === subject);
        if (found) {
          fullName = found.name;
          break;
        }
      }

      localStorage.setItem('lastVisitedSubject', JSON.stringify({ 
        name: fullName, 
        abbr: subject,
        timestamp: Date.now()
      }));
    }
  }, [subject]);

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

export const getStaticPaths = async () => {
  // Get ALL subjects from your data
  interface Semester {
    index: number;
    subjects: Subject[];
  }

  interface Subject {
    abbreviation: string;
    [key: string]: any;
  }

  const allSubjects: string[] = [];
  coursesData.semesters.forEach((semester) => {
    semester.subjects.forEach((subject) => {
      allSubjects.push(subject.abbreviation);
    });
  });

  return {
    paths: allSubjects.map(s => ({ params: { subject: s } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
 
    return {
      props: { 
        subject: "", 
        initialData: {}, 
        semesterIndex: 1,
        buildTime: 0,
      },
    };

};