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
  hello
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
  const subject = context.params?.subject as string;
  const startTime = Date.now();
  
  console.log(`🔨 [getStaticProps] Building: ${subject}`);

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

    // STEP 1: Find subject folders
    console.log(`  [${Date.now() - startTime}ms] Finding folders...`);
    const { data: SubjectFolders } = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });
    console.log(`  [${Date.now() - startTime}ms] Found ${SubjectFolders.files?.length || 0} folders`);

    if (!SubjectFolders.files?.length) {
      console.log(`  [${Date.now() - startTime}ms] No folders - returning empty`);
      return {
        props: { subject, initialData: {}, semesterIndex },
      };
    }

    const SubjectFolderIds = SubjectFolders.files.map((f) => f.id);
    
    // STEP 2: Get subfolders IN PARALLEL (KEY FIX!)
    console.log(`  [${Date.now() - startTime}ms] Fetching ${SubjectFolderIds.length} parent folders IN PARALLEL...`);
    
    const subfolderPromises = SubjectFolderIds.map((folderId) =>
      drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${folderId}' in parents`,
        fields: "files(id, name)",
        pageSize: 1000,
      })
    );

    const subfolderResults = await Promise.all(subfolderPromises);
    console.log(`  [${Date.now() - startTime}ms] Parallel fetch complete!`);

    let dic: Record<string, string> = {};
    let Parents = "";

    subfolderResults.forEach(({ data }) => {
      if (data.files) {
        data.files.forEach((subFolder) => {
          if (subFolder.id && subFolder.name) {
            dic[subFolder.id] = subFolder.name;
            Parents += `'${subFolder.id}' in parents OR `;
          }
        });
      }
    });

    Parents = Parents.slice(0, -4);
    console.log(`  [${Date.now() - startTime}ms] Found ${Object.keys(dic).length} categories`);

    if (!Parents) {
      console.log(`  [${Date.now() - startTime}ms] No categories - returning empty`);
      return {
        props: { subject, initialData: {}, semesterIndex },
      };
    }

    // STEP 3: Get all files
    console.log(`  [${Date.now() - startTime}ms] Fetching files...`);
    const { data: Files } = await drive.files.list({
      q: `${Parents} and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(id, name, mimeType, parents, size)",
      pageSize: 1000,
    });
    console.log(`  [${Date.now() - startTime}ms] Found ${Files.files?.length || 0} files`);

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

    const duration = Date.now() - startTime;
    console.log(`✅ [getStaticProps] Built ${subject} in ${duration}ms`);

    return {
      props: { 
        subject, 
        initialData: organizedData, 
        semesterIndex,
        buildTime: duration,
      },
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [getStaticProps] Error after ${duration}ms:`, error.message);
    return {
      props: { 
        subject, 
        initialData: {}, 
        semesterIndex,
        error: true,
      },
    };
  }
};