import React, { useState } from "react";
import Head from "next/head";
import { GetStaticProps, GetStaticPaths } from "next";
import { useRouter } from "next/router";
import { google } from "googleapis";
import { Box, Container, Alert, Snackbar, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";
import { Grid } from "@mui/material";

import ModernHeader from "../../components/ModernHeader";
import FileBrowser from "../../components/FileBrowser";
import SubjectSemesterPrompt from "../../components/SubjectSemesterPrompt";
import SubjectSidebar from "../../components/SubjectSidebar";
import Loading from "@/src/components/Loading";
import { SubjectMaterials } from "../../utils/types";
import { useSmartSubject } from "../../hooks/useSmartSubject";
import coursesData from "../../Data/data.json";

interface Props {
  subject: string;
  initialData: SubjectMaterials;
  semesterIndex: number;
}

// --- SKELETON COMPONENT ---
const SubjectSkeleton = () => {
  const theme = useTheme();
  return (
    <Box sx={{ width: "100%" }}>
      {/* Mimic Header / Controls */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Skeleton
            variant="rectangular"
            width={100}
            height={40}
            sx={{ borderRadius: 2 }}
          />
        </Box>
        <Skeleton
          variant="rectangular"
          width="100%"
          sx={{ maxWidth: { md: 400 }, height: 40, borderRadius: 2 }}
        />
      </Box>

      {/* Mimic Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          display: "flex",
          gap: 3,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="text" width={60} height={40} />
        ))}
      </Box>

      {/* Mimic Grid of Cards */}
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Grid item xs={6} sm={6} md={4} lg={3} key={i}>
            <Box
              sx={{
                p: 0,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                overflow: "hidden",
              }}
            >
              <Skeleton variant="rectangular" height={140} />
              <Box sx={{ p: 2 }}>
                <Skeleton
                  variant="text"
                  width="40%"
                  height={20}
                  sx={{ mb: 1 }}
                />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="70%" />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default function SubjectPage({
  subject,
  initialData,
  semesterIndex,
}: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newItemsMsg, setNewItemsMsg] = useState("");

  const { data, newItems, error } = useSmartSubject(subject, initialData);

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

  // if (!initialData || Object.keys(initialData).length === 0) {
  //   return <SubjectSkeleton />; // Show skeleton when no initial dat
  // }

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
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : !data && !initialData ? (
          <Alert severity="info">No data available.</Alert>
        ) : (
          (initialData && data)?
          <FileBrowser
            data={data}
            subjectName={subject}
            newItems={newItems}
            fetching={false}
          /> : <SubjectSkeleton />
        )}
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
  return {
    paths: [],
    fallback: true,
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
    const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: SCOPES,
    });

    const drive = google.drive({ version: "v3", auth });

    // ===== OPTIMIZED: 3 API CALLS INSTEAD OF 4 =====
    
    // CALL 1: Find ALL subject folders (like old code)
    const { data: SubjectFolders } = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    if (!SubjectFolders.files || SubjectFolders.files.length === 0) {
      return {
        props: { subject, initialData: {}, semesterIndex },
        revalidate: 3600,
      };
    }

    // Process ALL subject folders (like old code)
    const SubjectFolderIds = SubjectFolders.files.map((folder) => folder.id);
    const categoryMap: Record<string, string> = {};
    let parentsQuery = "";

    // CALL 2: Get ALL category folders from ALL subject folders
    for (const SubjectFolderId of SubjectFolderIds) {
      const { data: SubjectSubFolders } = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${SubjectFolderId}' in parents`,
        fields: "files(id, name)",
        pageSize: 1000,
      });

      if (SubjectSubFolders.files) {
        for (const subFolder of SubjectSubFolders.files) {
          categoryMap[subFolder.id!] = subFolder.name!;
          parentsQuery += `'${subFolder.id}' in parents OR `;
        }
      }
    }

    // Remove trailing " OR "
    parentsQuery = parentsQuery.slice(0, -4);

    if (parentsQuery.length === 0) {
      return {
        props: { subject, initialData: {}, semesterIndex },
        revalidate: 3600,
      };
    }

    // CALL 3: Get ALL files in one query
    const { data: Files } = await drive.files.list({
      q: `(${parentsQuery}) and mimeType != 'application/vnd.google-apps.folder'`,
      fields: "files(id, name, mimeType, parents, size)",
      pageSize: 1000,
    });

    // Organize data by category
    const organizedData: SubjectMaterials = {};

    if (Files.files) {
      for (const file of Files.files) {
        const parentName = categoryMap[file.parents?.[0] || ""];
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
      }
    }

    return {
      props: { subject, initialData: organizedData, semesterIndex },
      revalidate: 3600,
    };
  } catch (error: any) {
    console.error("Error fetching subject data:", error.message);
    return {
      props: { subject, initialData: {}, semesterIndex },
      revalidate: 60,
    };
  }
};