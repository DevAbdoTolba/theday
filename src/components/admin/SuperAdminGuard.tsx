import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Button, CircularProgress } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

interface SuperAdminGuardProps {
  children: React.ReactNode;
}

export default function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const { user, isSuperAdmin, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !isSuperAdmin) {
      void router.push("/");
    }
  }, [loading, user, isSuperAdmin, router]);

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

  if (!isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
