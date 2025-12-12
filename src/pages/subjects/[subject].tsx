import React, { useState } from 'react';
import Head from 'next/head';
import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { google } from 'googleapis';
import { Box, Container, CircularProgress, Alert } from '@mui/material';

// Imports
import ModernHeader from '../../components/ModernHeader'; // Use the new header
import FileBrowser from '../../components/FileBrowser';
import SubjectSemesterPrompt from '../../components/SubjectSemesterPrompt'; // Import the logic
import { SubjectMaterials } from '../../utils/types';

interface Props {
  subject: string;
  initialData: SubjectMaterials;
  // In a real app, you'd pass the semester index of this subject from getStaticProps
  // For now, we simulate or fetch it
  semesterIndex?: number; 
}

export default function SubjectPage({ subject, initialData, semesterIndex = 1 }: Props) {
  const router = useRouter();

  // Helper to add to custom list (passed to Prompt)
  const handleAddToCustom = (abbr: string) => {
    const current = JSON.parse(localStorage.getItem('customSemesterSubjects') || '[]');
    if (!current.includes(abbr)) {
      const updated = [...current, abbr];
      localStorage.setItem('customSemesterSubjects', JSON.stringify(updated));
      // Force custom semester mode
      localStorage.setItem('semester', '-2');
    }
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

      {/* 2. APPLIED MODERN HEADER */}
      <ModernHeader 
        title={subject} 
        isSearch={true} 
        data={initialData} // Pass data so search dialog works
      />

      <Container maxWidth="xl" sx={{ py: 4, minHeight: '85vh' }}>
        {!initialData ? (
          <Alert severity="error">Failed to load data.</Alert>
        ) : (
          <FileBrowser 
            data={initialData} 
            subjectName={subject} 
          />
        )}
      </Container>

      {/* 1. APPLIED LOGIC PROMPT */}
      <SubjectSemesterPrompt 
        subjectAbbr={subject} 
        semesterIndex={semesterIndex} // You need to ensure this is passed correctly
        onAddToCustom={handleAddToCustom}
      />
    </>
  );
}

// ... getStaticProps and getStaticPaths remain the same as previous response ...
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