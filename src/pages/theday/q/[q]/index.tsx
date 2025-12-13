import React, { useContext, useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Fade, Skeleton } from '@mui/material';
import { useRouter } from 'next/router';

// Components
import Header from '../../../../components/Header';
import Footer from '../../../../components/Footer';
import GoogleDriveSearch from '../../../../components/GoogleDriveSearch';
import DashboardHeader from '../../../../components/dashboard/DashboardHeader';
import SemesterCard from '../../../../components/dashboard/SemesterCard';
import ModernHeader from '../../../../components/ModernHeader';

// Context
import { SearchProvider } from '../../../../context/SearchContext';
import { DataContext } from '../../../../context/TranscriptContext';
import { offlineContext } from '../../../_app';
import Offline from '../../../../components/Offline';

export default function TheDayPage() {
  const router = useRouter();
  const { transcript, loadingTranscript } = useContext(DataContext);
  const [offline] = useContext(offlineContext);
  
  // State for layout
  const [currentSemesterIndex, setCurrentSemesterIndex] = useState<number>(-1);
  const [isReady, setIsReady] = useState(false);

  // Initialize Semester State from LocalStorage
  useEffect(() => {
    if (!loadingTranscript && transcript) {
      const savedSem = localStorage.getItem('semester');
      const savedCustom = localStorage.getItem('customSemesterSubjects');
      
      if (savedSem) {
        setCurrentSemesterIndex(parseInt(savedSem));
      } else {
        // Default to not selected, or maybe semester 1
        setCurrentSemesterIndex(-1);
      }
      setIsReady(true);
    }
  }, [loadingTranscript, transcript]);

  const handleUpdateFocus = (index: number, customSubjects?: string[]) => {
    setCurrentSemesterIndex(index);
    if(index !== -2) {
       localStorage.setItem('semester', index.toString());
    }
    // Force re-render/update
    router.replace(router.asPath);
  };

  if (loadingTranscript || !isReady) {
    return (
      <Container maxWidth="lg" sx={{ pt: 10 }}>
        <Skeleton variant="text" height={60} width="60%" />
        <Skeleton variant="rectangular" height={200} sx={{ my: 2, borderRadius: 4 }} />
        <Grid container spacing={3}>
          {[1,2,3].map(i => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (offline) return <Offline />;

  // @ts-ignore - Transcript types need to be strict (see previous prompt)
  const allSemesters = transcript?.semesters || [];

  return (
    <SearchProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
       <ModernHeader 
          title="Dashboard" 
          isSearch={false} 
          isHome={true} 
        />
        
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
          
          {/* Global Search Bar - Always visible and centered */}
          <Box mb={6} sx={{ position: 'relative', zIndex: 2 }}>
            <GoogleDriveSearch 
              transcript={transcript as any} 
              currentSemester={currentSemesterIndex} 
            />
          </Box>

          <Fade in={true} timeout={800}>
            <Box>
              {/* 1. Hero / Current Focus Section */}
              <DashboardHeader 
                allSemesters={allSemesters}
                currentSemesterIndex={currentSemesterIndex}
                onUpdateFocus={handleUpdateFocus}
              />

              {/* 2. All Semesters Grid */}
              <Box mt={8}>
                <Typography variant="h5" fontWeight={800} mb={3} color="text.secondary">
                  Explore Curriculum
                </Typography>
                
                <Grid container spacing={3}>
                  {allSemesters.map((semester: any) => {
                    // Don't show the current semester again in the grid if it's a standard semester
                    if (semester.index === currentSemesterIndex) return null;

                    return (
                      <Grid item xs={12} sm={6} md={4} key={semester.index}>
                        <SemesterCard 
                          semesterIndex={semester.index} 
                          subjects={semester.subjects} 
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
      <Footer />
    </SearchProvider>
  );
}