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
  Pagination,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import CvPaymentsGuard from "../../components/admin/CvPaymentsGuard";
import { createBookingGateToken } from "../../components/cv-review/booking-gate";
import { useAuth } from "../../hooks/useAuth";

interface PaymentSubmission {
  readonly id: string;
  readonly instapayHandle: string | null;
  readonly email: string | null;
  readonly serviceTitle: string;
  readonly priceEgp: number | null;
  readonly status: "pending" | "confirmed";
  readonly createdAt: string;
  readonly confirmedAt: string | null;
}

type PaymentStatusFilter = "all" | "pending" | "confirmed";

interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
}

interface PaymentCounts {
  readonly all: number;
  readonly pending: number;
  readonly confirmed: number;
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
    <CvPaymentsGuard>
      <CvPaymentsContent />
    </CvPaymentsGuard>
  );
}

function CvPaymentsContent() {
  const { getIdToken, isAdmin, isSuperAdmin } = useAuth();
  const [submissions, setSubmissions] = useState<readonly PaymentSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [counts, setCounts] = useState<PaymentCounts>({ all: 0, pending: 0, confirmed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      const query = new URLSearchParams({ page: page.toString(), status: statusFilter });
      const response = await fetch(`/api/admin/cv-payments?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!response.ok) throw new Error("Could not load payment submissions.");
      const body = (await response.json()) as { submissions: PaymentSubmission[]; pagination: PaginationMeta; counts: PaymentCounts };
      setSubmissions(body.submissions);
      setPagination(body.pagination);
      setCounts(body.counts);
      if (page > body.pagination.totalPages) setPage(body.pagination.totalPages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load payment submissions.");
    } finally {
      setIsLoading(false);
    }
  }, [getIdToken, page, statusFilter]);

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
      await response.json();
      setNotice("Payment confirmed. Copy the booking link and email it manually.");
      await loadSubmissions();
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Could not confirm payment.");
    } finally {
      setIsConfirming(null);
    }
  };

  const copyBookingLink = async (submission: PaymentSubmission) => {
    if (!submission.email || !submission.instapayHandle) return;
    try {
      const token = await createBookingGateToken(submission.email, submission.instapayHandle);
      const bookingUrl = new URL("/grad/d/cv/meet/nairah/schedule", window.location.origin);
      bookingUrl.searchParams.set("u", token);
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
        <Button component={Link} href={isAdmin || isSuperAdmin ? "/admin" : "/"} startIcon={<ArrowBackRounded />} sx={{ textTransform: "none", mb: 2 }}>
          {isAdmin || isSuperAdmin ? "Admin dashboard" : "Back to site"}
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

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.25, mb: 2 }}>
          {([
            ["All requests", counts.all, "primary.main"],
            ["Needs review", counts.pending, "warning.main"],
            ["Confirmed", counts.confirmed, "success.main"],
          ] as const).map(([label, value, color]) => (
            <Paper key={label} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography color="text.secondary" variant="body2" fontWeight={750}>{label}</Typography>
              <Typography sx={{ mt: 0.5, color, fontSize: "2rem", fontWeight: 950, lineHeight: 1 }}>{value}</Typography>
            </Paper>
          ))}
        </Box>

        <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 3 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={statusFilter}
              onChange={(_event, value: PaymentStatusFilter | null) => {
                if (!value) return;
                setStatusFilter(value);
                setPage(1);
              }}
              aria-label="Filter payment submissions by status"
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="pending">Pending</ToggleButton>
              <ToggleButton value="confirmed">Confirmed</ToggleButton>
            </ToggleButtonGroup>
            <Typography color="text.secondary" variant="body2">
              {pagination.total === 0 ? "No results" : `${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(pagination.page * pagination.pageSize, pagination.total)} of ${pagination.total}`}
            </Typography>
          </Box>
          {isLoading ? (
            <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
              <CircularProgress aria-label="Loading payment submissions" />
            </Box>
          ) : submissions.length === 0 ? (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <Typography fontWeight={800}>No {statusFilter === "all" ? "payment" : statusFilter} submissions.</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>{statusFilter === "all" ? "New requests will appear here after a visitor confirms their transfer." : "Choose another status to see more requests."}</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 620 }}>
              <Table stickyHeader size="small" aria-label="Nairah CV payment submissions" sx={{ minWidth: 980 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>InstaPay handle</TableCell>
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
                        <TableCell>{submission.instapayHandle ?? "Not collected"}</TableCell>
                        <TableCell>{submission.email ?? "Not collected"}</TableCell>
                        <TableCell>{formatDate(submission.createdAt)}</TableCell>
                        <TableCell>
                          <Chip size="small" label={isPending ? "Pending" : "Confirmed"} color={isPending ? "warning" : "success"} />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button size="small" variant="outlined" disabled={isPending || !submission.instapayHandle || !submission.email} startIcon={<ContentCopyRounded />} onClick={() => void copyBookingLink(submission)} sx={{ textTransform: "none" }}>Copy booking link</Button>
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
          <Box sx={{ minHeight: 68, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5, px: 2, py: 1.25, borderTop: "1px solid", borderColor: "divider" }}>
            <Typography color="text.secondary" variant="body2">Page {pagination.page} of {pagination.totalPages}</Typography>
            <Pagination
              page={page}
              count={pagination.totalPages}
              onChange={(_event, nextPage) => setPage(nextPage)}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
              disabled={isLoading || pagination.totalPages <= 1}
            />
          </Box>
        </Paper>
      </Box>
      <Snackbar open={notice !== null} autoHideDuration={3500} onClose={() => setNotice(null)} message={notice} />
    </>
  );
}
