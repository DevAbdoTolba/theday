import React, { useState } from "react";
import Head from "next/head";
import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import { google } from "googleapis";
import { Box, Container, CircularProgress, Alert, LinearProgress } from "@mui/material";

import ModernHeader from "../../components/ModernHeader";
import FileBrowser from "../../components/FileBrowser";
import SubjectSemesterPrompt from "../../components/SubjectSemesterPrompt";
import SubjectSidebar from "../../components/SubjectSidebar";
import { SubjectMaterials } from "../../utils/types";
import { useSmartSubject } from "../../hooks/useSmartSubject";

// Import local data to find semester index
import coursesData from '../../Data/data.json';

interface Props {
  subject: string;
  initialData: SubjectMaterials;
  semesterIndex: number;
}

export default function SubjectPage({
  subject,
  initialData,
  semesterIndex, // This is now correctly calculated
}: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data, loading, fetching, newItems, error } = useSmartSubject(
    subject,
    initialData
  );

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

  if (router.isFallback) {
    return (
      <Box height="100vh" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>{subject} | Materials</title>
      </Head>

      {fetching && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress />
        </Box>
      )}

      <SubjectSidebar
        currentSubject={subject}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <ModernHeader title={subject} isSearch={true} data={data || initialData} onMenuClick={handleDrawerToggle} />

      <Container maxWidth="xl" sx={{ py: 4, minHeight: "85vh" }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={10}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !data ? (
          <Alert severity="error">Failed to load data.</Alert>
        ) : (
          <FileBrowser data={data} subjectName={subject} newItems={newItems} fetching={fetching} />
        )}
      </Container>

      <SubjectSemesterPrompt
        subjectAbbr={subject}
        semesterIndex={semesterIndex}
        onAddToCustom={handleAddToCustom}
      />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const subject = context.params?.subject as string;
  
  console.log(`\n🚀 [getStaticProps] START: Fetching data for subject: "${subject}"`);

  if (!subject) {
    console.error("❌ [getStaticProps] ERROR: No subject parameter found in context.");
    return { notFound: true };
  }

  let semesterIndex = 1;
  const foundSemester = coursesData.semesters.find(sem => 
    sem.subjects.some(subj => subj.abbreviation === subject)
  );
  if (foundSemester) {
    semesterIndex = foundSemester.index;
    console.log(`ℹ️ [getStaticProps] Found subject in local coursesData. Semester Index: ${semesterIndex}`);
  }

  try {
    console.log("🔑 [getStaticProps] Authenticating with Google Drive API...");
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Step 1: Find Subject Folder
    console.log(`📂 [Step 1] Searching for folder with name: "${subject}"`);
    const subjectFolderRes = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id)",
    });

    if (!subjectFolderRes.data.files?.length) {
      console.warn(`⚠️ [Step 1] NOT FOUND: No folder matches name "${subject}" on Google Drive.`);
      return { props: { subject, initialData: {}, semesterIndex }, revalidate: 3600 };
    }

    const subjectFolderId = subjectFolderRes.data.files[0].id;
    console.log(`✅ [Step 1] SUCCESS: Found Folder ID: ${subjectFolderId}`);

    // Step 2: Get Categories
    console.log(`🔍 [Step 2] Fetching category folders inside Subject Folder...`);
    const categoriesRes = await drive.files.list({
      q: `'${subjectFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    const categoryMap: Record<string, string> = {};
    const categoryIds = categoriesRes.data.files?.map(f => {
      categoryMap[f.id!] = f.name!;
      return f.id;
    }) || [];

    console.log(`✅ [Step 2] SUCCESS: Found ${categoryIds.length} categories: [${Object.values(categoryMap).join(", ")}]`);

    if (categoryIds.length === 0) {
      console.warn("⚠️ [Step 2] EMPTY: Subject folder exists but contains no category sub-folders.");
      return { props: { subject, initialData: {}, semesterIndex }, revalidate: 3600 };
    }

    // Step 3: Fetch Files
    console.log(`📄 [Step 3] Fetching all files within these categories...`);
    const parentsQuery = categoryIds.map((id) => `'${id}' in parents`).join(" OR ");

    const filesRes = await drive.files.list({
      q: `(${parentsQuery}) and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(id, name, mimeType, parents, size)", 
      pageSize: 1000,
    });

    const fileCount = filesRes.data.files?.length || 0;
    console.log(`✅ [Step 3] SUCCESS: Retrieved ${fileCount} files total.`);

    const organizedData: SubjectMaterials = {};

    filesRes.data.files?.forEach((file) => {
      const parentId = file.parents?.[0];
      if (parentId && categoryMap[parentId]) {
        const categoryName = categoryMap[parentId];
        if (!organizedData[categoryName]) organizedData[categoryName] = [];
        organizedData[categoryName].push({
          id: file.id!,
          name: file.name!,
          mimeType: file.mimeType!,
          parents: file.parents || [],
          size: parseInt(file.size || "0"),
        });
      }
    });

    console.log(`✨ [getStaticProps] COMPLETED: Data organized. Returning props for "${subject}".\n`);
    return {
      props: { subject, initialData: organizedData, semesterIndex },
    };
  } catch (error: any) {
    console.error(`🔥 [getStaticProps] CRITICAL ERROR:`, error.message);
    if (error.code === 403) console.error("🛑 Check your Google Service Account permissions!");
    if (!process.env.CLIENT_EMAIL) console.error("🛑 CLIENT_EMAIL is missing from .env");
    
    return { props: { subject, initialData: {}, semesterIndex }, revalidate: 60 };
  }
};