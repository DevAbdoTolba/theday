import React from "react";
import { useRouter } from "next/router";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../../hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  check: (auth: { isAdmin: boolean; isSuperAdmin: boolean }) => boolean;
}

export default function AuthGuard({ children, check }: AuthGuardProps) {
  const { user, isAdmin, isSuperAdmin, loading, signInWithGoogle, signOut } =
    useAuth();
  const router = useRouter();
  const hasAccess = check({ isAdmin, isSuperAdmin });

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
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ bgcolor: "background.default", p: 2 }}
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 440,
            width: "100%",
            p: 4,
            textAlign: "center",
            borderRadius: 3,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: "error.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <LockOutlinedIcon sx={{ color: "error.contrastText", fontSize: 28 }} />
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Access Denied
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your account has not been verified as an admin yet. Please contact the
            main administrator to request access.
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{
              bgcolor: "action.hover",
              borderRadius: 2,
              p: 1.5,
              mb: 3,
            }}
          >
            <Avatar
              src={user.photoURL ?? undefined}
              alt={user.displayName}
              sx={{ width: 36, height: 36 }}
            />
            <Box textAlign="left">
              <Typography variant="body2" fontWeight={600}>
                {user.displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => {
                void signOut();
              }}
            >
              Sign Out
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                void router.push("/");
              }}
            >
              Go Home
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
}
