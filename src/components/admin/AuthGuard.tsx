import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Button, CircularProgress } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  check: (auth: { isAdmin: boolean; isSuperAdmin: boolean }) => boolean;
}

export default function AuthGuard({ children, check }: AuthGuardProps) {
  const { user, isAdmin, isSuperAdmin, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const hasAccess = check({ isAdmin, isSuperAdmin });

  useEffect(() => {
    if (!loading && user && !hasAccess) {
      void router.push("/");
    }
  }, [loading, user, hasAccess, router]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress aria-label="Loading" />
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

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
