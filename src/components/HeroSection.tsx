import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, useTheme, alpha, Chip, Button } from '@mui/material';
import { 
  School, AutoAwesome, WbSunny, NightsStay, WbTwilight, 
  FiberNew, ArrowForward, History, Bookmark
} from '@mui/icons-material';
import { useRouter } from 'next/router';


// Get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: WbSunny };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', icon: WbTwilight };
  if (hour >= 17 && hour < 21) return { text: 'Good evening', icon: WbTwilight };
  return { text: 'Good night', icon: NightsStay };
};

// Motivational taglines
const taglines = [
  "Ready to learn something new?",
  "Your knowledge journey continues!",
  "Every step counts toward success.",
  "Make today count!",
  "Stay curious, stay brilliant.",
  "Small progress is still progress.",
  "You've got this!",
];

export default function HeroSection() {
  const theme = useTheme();
  const router = useRouter();
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  
  // Pick a consistent tagline based on day of week
  const tagline = taglines[new Date().getDay() % taglines.length];
  
  // Get last visited subject from localStorage
  const [lastSubject, setLastSubject] = useState<{ name: string; abbr: string } | null>(null);
  
  useEffect(() => {
    const last = localStorage.getItem('lastVisitedSubject');
    if (last) {
      try {
        setLastSubject(JSON.parse(last));
      } catch {}
    }
  }, []);

  const handleContinue = () => {
    if (lastSubject?.abbr) {
      router.push(`/subjects/${lastSubject.abbr}`);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.background.default, 0.95)} 60%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.25)} 0%, ${alpha(theme.palette.background.default, 0.98)} 60%)`,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.08),
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: '20%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: alpha(theme.palette.secondary.main, 0.06),
          filter: 'blur(30px)',
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            py: { xs: 4, md: 5 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left side - Greeting */}
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <GreetingIcon 
                sx={{ 
                  fontSize: 28, 
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.warning.light 
                    : theme.palette.warning.main 
                }} 
              />
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${theme.palette.common.white} 0%, ${theme.palette.grey[400]} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[700]} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {greeting.text}!
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ 
                maxWidth: 400,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <AutoAwesome sx={{ fontSize: 16, opacity: 0.7 }} />
              {tagline}
            </Typography>
          </Box>

          {/* Right side - Quick actions */}
          <Box 
            display="flex" 
            gap={1.5} 
            flexWrap="wrap"
            alignItems="center"
            sx={{ mt: { xs: 2, md: 0 } }}
          >
            {/* Continue studying button */}
            {lastSubject && (
              <Button
                variant="contained"
                size="medium"
                onClick={handleContinue}
                endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                  boxShadow: theme.shadows[4],
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 0.5 }}>
                  <Typography variant="caption" sx={{ opacity: 0.85, lineHeight: 1, fontSize: '0.65rem' }}>
                    Continue
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {lastSubject.name}
                  </Typography>
                </Box>
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
