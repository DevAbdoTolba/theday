import React, { useContext, useState, useEffect } from "react";
import {
  Box, Container, Typography, Grid, Fade, Skeleton, Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import { School, AutoAwesome } from "@mui/icons-material";

// Components
import ModernHeader from "../../../../components/ModernHeader";
import Footer from "../../../../components/Footer";
import GoogleDriveSearch from "../../../../components/GoogleDriveSearch";
import DashboardHeader from "../../../../components/dashboard/DashboardHeader";
import SemesterCard from "../../../../components/dashboard/SemesterCard";

// Context
import { SearchProvider } from "../../../../context/SearchContext";
import { DataContext } from "../../../../context/TranscriptContext";
import { offlineContext } from "../../../_app";
import Offline from "../../../../components/Offline";

export default function TheDayPage() {
  const router = useRouter();
  const { transcript, loadingTranscript } = useContext(DataContext);
  const [offline] = useContext(offlineContext);

  const [currentSemesterIndex, setCurrentSemesterIndex] = useState<number>(-1);
  const [isReady, setIsReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNavigate = async (abbreviation: string) => {
    setIsNavigating(true);
    try {
      await router.push(`/subjects/${abbreviation}`);
    } catch (error) {
      console.error("Navigation failed:", error);
      setIsNavigating(false);
    }
  };

  useEffect(() => {
    if (!loadingTranscript && transcript) {
      const savedSem = localStorage.getItem("semester");
      setCurrentSemesterIndex(savedSem ? parseInt(savedSem) : -1);
      setIsReady(true);
    }
  }, [loadingTranscript, transcript]);

  const handleUpdateFocus = (index: number) => {
    setCurrentSemesterIndex(index);
    if (index !== -2) {
      localStorage.setItem("semester", index.toString());
    }
    router.replace(router.asPath);
  };

  // Loading State
  if (loadingTranscript || !isReady) {
    return (
      <Container maxWidth="lg" sx={{ pt: 10 }}>
        <Skeleton variant="text" height={60} width="60%" sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 4 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (offline) return <Offline />;

  const allSemesters = (transcript && 'semesters' in transcript && Array.isArray((transcript as any).semesters))
    ? (transcript as any).semesters
    : [];

  return (
    <SearchProvider>
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 8 }}>
        <ModernHeader title="Dashboard" isSearch={false} isHome={true} />

        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
          {/* Hero Section */}
          <Box textAlign="center" mb={6}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <School color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h3" fontWeight={900} color="primary">
                Your Learning Hub
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" maxWidth={600} mx="auto">
              Access all your subjects, materials, and resources in one centralized platform
            </Typography>
          </Box>

          {/* Global Search */}
          <Box mb={6} sx={{ position: 'relative', zIndex: 2 }}>
            <GoogleDriveSearch
              transcript={transcript as any}
              currentSemester={currentSemesterIndex}
            />
          </Box>

          <Fade in={true} timeout={800}>
            <Box>
              {/* Current Semester Focus */}
              <DashboardHeader
                allSemesters={allSemesters}
                currentSemesterIndex={currentSemesterIndex}
                onUpdateFocus={handleUpdateFocus}
              />

              {/* All Semesters Grid */}
              <Box mt={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Typography variant="h5" fontWeight={800} color="text.primary">
                    All Semesters
                  </Typography>
                  <AutoAwesome color="primary" />
                </Box>

                {allSemesters.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 3 }}>
                    No semester data available. Please contact your administrator.
                  </Alert>
                ) : (
                  <Grid container spacing={3}>
                    {allSemesters.map((semester: any) => {
                      if (semester.index === currentSemesterIndex) return null;
                      return (
                        <Grid item xs={12} sm={6} md={4} key={semester.index}>
                          <SemesterCard
                            semesterIndex={semester.index}
                            subjects={semester.subjects}
                            isNavigating={isNavigating}
                            onNavigate={handleNavigate}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
      <Footer />
    </SearchProvider>
  );
}