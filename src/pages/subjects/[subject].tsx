import React from 'react';
import Head from 'next/head';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { google } from 'googleapis';
import { Box, Container, CircularProgress, Alert } from '@mui/material';

import Header from '../../components/Header';
import FileBrowser from '../../components/FileBrowser';
import { SubjectMaterials } from '../../utils/types';
import { unstable_cache } from 'next/cache';

interface Props {
  subject: string;
  initialData: SubjectMaterials;
}

export default function SubjectPage({ subject, initialData }: Props) {
  const router = useRouter();

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

      <Header title={subject} isSearch={false} />

      <Container maxWidth="xl" sx={{ py: 4, minHeight: '85vh' }}>
        {!initialData ? (
          <Alert severity="error">Failed to load data. Please try again later.</Alert>
        ) : (
          <FileBrowser 
            data={initialData} 
            subjectName={subject} // You might want to map Abbr -> Full Name here via context
          />
        )}
      </Container>
    </>
  );
}

// --- Server Side Data Fetching Logic ---

export const getStaticPaths: GetStaticPaths = async () => {
  // Ideally fetch list of all subjects here
  return {
    paths: [], // Generate on demand for faster builds
    fallback: true,
  };
};

// Fetch data at build time
export const getStaticProps: GetStaticProps = async (context) => {
  const subject = context.params?.subject as string;
  let initialData = null;

  const SCOPES = ["https://www.googleapis.com/auth/drive"];

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.CLIENT_EMAIL,
      private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
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

      // @ts-ignore
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