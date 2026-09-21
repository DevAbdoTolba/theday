import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import AdminGuard from "../../components/admin/AdminGuard";
import { useAuth } from "../../hooks/useAuth";

interface PaymentSubmission {
  readonly id: string;
  readonly fullName: string | null;
  readonly email: string | null;
  readonly serviceTitle: string;
  readonly priceEgp: number | null;
  readonly status: "pending" | "confirmed";
  readonly createdAt: string;
  readonly confirmedAt: string | null;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(priceEgp: number | null): string {
  return priceEgp === null ? "Price not set" : `${priceEgp} EGP`;
}

export default function CvPaymentsAdminPage() {
  return (
    <AdminGuard>
      <CvPaymentsContent />
    </AdminGuard>
  );
}

function CvPaymentsContent() {
  const { getIdToken } = useAuth();
  const [submissions, setSubmissions] = useState<readonly PaymentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      const response = await fetch("/api/admin/cv-payments", {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!response.ok) throw new Error("Could not load payment submissions.");
      const body = (await response.json()) as { submissions: PaymentSubmission[] };
      setSubmissions(body.submissions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load payment submissions.");
    } finally {
      setIsLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const confirmPayment = async (submissionId: string) => {
    setIsConfirming(submissionId);
    setError(null);
    try {
      const token = await getIdToken();
      const response = await fetch("/api/admin/cv-payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ submissionId, action: "confirm" }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not confirm payment.");
      }
      const body = (await response.json()) as { submission: PaymentSubmission };
      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === body.submission.id ? body.submission : submission,
        ),
      );
      setNotice("Payment confirmed. Copy the booking link and email it manually.");
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Could not confirm payment.");
    } finally {
      setIsConfirming(null);
    }
  };

  const copyBookingLink = async (submissionId: string) => {
    try {
      const bookingUrl = new URL("/grad/d/cv/meet/nairah/schedule", window.location.origin);
      bookingUrl.searchParams.set("request", submissionId);
      await navigator.clipboard.writeText(bookingUrl.toString());
      setNotice("Nairah booking link copied.");
    } catch {
      setError("Could not copy the booking link. Please copy it manually.");
    }
  };

  return (
    <>
      <Head>
        <title>Nairah CV payments | TheDay Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Box sx={{ maxWidth: 1240, mx: "auto", p: { xs: 1.5, sm: 3 } }}>
        <Button component={Link} href="/admin" startIcon={<ArrowBackRounded />} sx={{ textTransform: "none", mb: 2 }}>
          Admin dashboard
        </Button>

        <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 2, mb: 3 }}>
          <Box>
            <Typography component="h1" variant="h4" fontWeight={950} letterSpacing="-0.04em">
              Nairah CV payments
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: "47rem" }}>
              Confirm only after checking the InstaPay transfer. Then copy the private booking link and send it to the email written in the transfer note.
            </Typography>
          </Box>
          <Tooltip title="Refresh submissions">
            <IconButton onClick={() => void loadSubmissions()} disabled={isLoading} aria-label="Refresh payment submissions">
              <RefreshRounded />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          {isLoading ? (
            <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
              <CircularProgress aria-label="Loading payment submissions" />
            </Box>
          ) : submissions.length === 0 ? (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <Typography fontWeight={800}>No payment submissions yet.</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>New requests will appear here after a visitor confirms their transfer.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small" aria-label="Nairah CV payment submissions">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>InstaPay name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Manual action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => {
                    const isPending = submission.status === "pending";
                    return (
                      <TableRow key={submission.id} hover>
                        <TableCell>{submission.serviceTitle}</TableCell>
                        <TableCell>{formatPrice(submission.priceEgp)}</TableCell>
                        <TableCell>{submission.fullName ?? "Not collected"}</TableCell>
                        <TableCell>{submission.email ?? "Not collected"}</TableCell>
                        <TableCell>{formatDate(submission.createdAt)}</TableCell>
                        <TableCell>
                          <Chip size="small" label={isPending ? "Pending" : "Confirmed"} color={isPending ? "warning" : "success"} />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button size="small" variant="outlined" disabled={isPending || !submission.fullName || !submission.email} startIcon={<ContentCopyRounded />} onClick={() => void copyBookingLink(submission.id)} sx={{ textTransform: "none" }}>Copy booking link</Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={!isPending || isConfirming === submission.id}
                              startIcon={<CheckRounded />}
                              onClick={() => void confirmPayment(submission.id)}
                              sx={{ textTransform: "none" }}
                            >
                              {isConfirming === submission.id ? "Confirming…" : "Confirm"}
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
      <Snackbar open={notice !== null} autoHideDuration={3500} onClose={() => setNotice(null)} message={notice} />
    </>
  );
}
