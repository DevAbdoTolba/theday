import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Button, CircularProgress } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAdmin, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      void router.push("/");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Button variant="contained" onClick={() => void signInWithGoogle()}>
          Sign in with Google
        </Button>
      </Box>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
