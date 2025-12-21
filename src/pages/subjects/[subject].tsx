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
          <Alert severity="error">Failed to load data. Please try again later.</Alert>

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

export const getStaticProps: GetStaticProps = async (context) => {
  const subject = context.params?.subject as string;
  
  if (!subject) return { notFound: true };

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });
    
    // 1. Find the Subject Folder
    const subjectFolderRes = await drive.files.list({
      q: `name = '${subject}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
    });

    if (!subjectFolderRes.data.files?.length) {
      return { props: { subject, initialData: {} }, revalidate: 3600 };
    }

    const subjectFolderId = subjectFolderRes.data.files[0].id;

    // 2. Find Category Folders (Lectures, Exams, etc.)
    const categoriesRes = await drive.files.list({
      q: `'${subjectFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name)",
    });

    const categoryMap: Record<string, string> = {}; // ID -> Name
    const categoryIds: string[] = [];

    categoriesRes.data.files?.forEach(file => {
      if(file.id && file.name) {
        categoryMap[file.id] = file.name;
        categoryIds.push(file.id);
      }
    });

    if (categoryIds.length === 0) {
       return { props: { subject, initialData: {} }, revalidate: 3600 };
    }

    // 3. Fetch Files inside Categories
    // Batch query for efficiency
    const parentsQuery = categoryIds.map(id => `'${id}' in parents`).join(' OR ');
    
    const filesRes = await drive.files.list({
      q: `(${parentsQuery}) and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id, name, mimeType, parents, size, webViewLink)",
      pageSize: 1000,
    });

    // 4. Organize Data
    const organizedData: SubjectMaterials = {};

    filesRes.data.files?.forEach(file => {
      const parentId = file.parents?.[0];
      if (parentId && categoryMap[parentId]) {
        const categoryName = categoryMap[parentId];
        if (!organizedData[categoryName]) organizedData[categoryName] = [];
        
        // @ts-ignore - Google Types are slightly loose, we cast strictly
        organizedData[categoryName].push({
          id: file.id!,
          name: file.name!,
          mimeType: file.mimeType!,
          parents: file.parents || [],
          size: parseInt(file.size || '0'),
        });
      }
    });

    return {
      props: {
        subject,
        initialData: organizedData,
      },
      revalidate: 3600, // Revalidate every hour
    };

  } catch (error) {
    console.error("Drive API Error:", error);
    return { 
      props: { subject, initialData: {} }, 
      revalidate: 60 // Retry sooner if error
    };
  }
};