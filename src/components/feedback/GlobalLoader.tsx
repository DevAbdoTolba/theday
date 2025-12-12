import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { LinearProgress, Box } from '@mui/material';

export default function GlobalLoader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (!loading) return null;

  return (
    <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}>
      <LinearProgress color="primary" sx={{ height: 3 }} />
    </Box>
  );
}