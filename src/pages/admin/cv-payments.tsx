import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  ClickAwayListener,
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
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ContentCopyRounded from "@mui/icons-material/ContentCopyRounded";
import EditRounded from "@mui/icons-material/EditRounded";
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
  readonly status: "pending" | "confirmed" | "declined";
  readonly createdAt: string;
  readonly confirmedAt: string | null;
  readonly declineReason: string | null;
  readonly declinedAt: string | null;
}

type PaymentStatusFilter = "all" | "pending" | "confirmed" | "declined";
type PaymentReviewAction = "confirm" | "decline";

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
  readonly declined: number;
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

interface PaymentStatusControlProps {
  readonly submission: PaymentSubmission;
  readonly isUpdating: boolean;
  readonly onUpdate: (
    submissionId: string,
    action: PaymentReviewAction,
    reason?: string,
  ) => Promise<boolean>;
}

function PaymentStatusControl({ submission, isUpdating, onUpdate }: PaymentStatusControlProps) {
  const [mode, setMode] = useState<"idle" | "choose" | "decline">("idle");
  const [reason, setReason] = useState(submission.declineReason ?? "");
  const normalizedReason = reason.trim();
  const reasonIsValid = normalizedReason.length >= 3 && normalizedReason.length <= 280;

  useEffect(() => {
    setMode("idle");
    setReason(submission.declineReason ?? "");
  }, [submission.declineReason, submission.id, submission.status]);

  const complete = async () => {
    if (await onUpdate(submission.id, "confirm")) setMode("idle");
  };

  const decline = async () => {
    if (!reasonIsValid) return;
    if (await onUpdate(submission.id, "decline", normalizedReason)) setMode("idle");
  };

  const openDeclineEditor = () => {
    setReason(submission.declineReason ?? "");
    setMode("decline");
  };

  const choiceControl = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "3fr minmax(42px, 1fr)",
        gap: 0.5,
        width: "100%",
      }}
    >
      <Button
        size="small"
        variant="contained"
        color="success"
        startIcon={<CheckRounded />}
        disabled={isUpdating}
        onClick={() => void complete()}
        sx={{ minWidth: 0, textTransform: "none", borderRadius: 2 }}
      >
        Complete
      </Button>
      <Tooltip title="Decline with a reason">
        <span>
          <IconButton
            color="error"
            disabled={isUpdating}
            onClick={openDeclineEditor}
            aria-label="Decline payment request"
            sx={{ width: "100%", height: 38, borderRadius: 2, border: "1px solid", borderColor: "error.main" }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );

  return (
    <ClickAwayListener onClickAway={() => { if (!isUpdating) setMode("idle"); }}>
      <Box sx={{ width: 268, maxWidth: "100%" }}>
        {mode === "decline" ? (
          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault();
              void decline();
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isUpdating) setMode("idle");
            }}
            sx={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 42px",
              gap: 0.5,
              transformOrigin: "right center",
              animation: "declineEditorIn 260ms cubic-bezier(0.22, 1, 0.36, 1)",
              "@keyframes declineEditorIn": {
                from: { opacity: 0.35, transform: "scaleX(0.35)" },
                to: { opacity: 1, transform: "scaleX(1)" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            <TextField
              autoFocus
              size="small"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Decline reason"
              inputProps={{ maxLength: 280, "aria-label": "Reason for declining payment request" }}
              error={reason.length > 0 && !reasonIsValid}
              disabled={isUpdating}
              sx={{ "& .MuiOutlinedInput-root": { height: 38, borderRadius: 2 } }}
            />
            <Tooltip title={reasonIsValid ? "Save decline" : "Enter at least 3 characters"}>
              <span>
                <IconButton
                  type="submit"
                  color="success"
                  disabled={isUpdating || !reasonIsValid}
                  aria-label="Save decline reason"
                  sx={{ width: 42, height: 38, borderRadius: 2, bgcolor: "success.main", color: "success.contrastText", "&:hover": { bgcolor: "success.dark" } }}
                >
                  {isUpdating ? <CircularProgress size={18} color="inherit" /> : <CheckRounded fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ) : mode === "choose" || submission.status === "pending" ? (
          choiceControl
        ) : (
          <Button
            fullWidth
            size="small"
            variant="outlined"
            color={submission.status === "confirmed" ? "success" : "error"}
            endIcon={<EditRounded fontSize="small" />}
            disabled={isUpdating}
            onClick={() => setMode("choose")}
            sx={{ height: 38, justifyContent: "space-between", textTransform: "none", borderRadius: 2 }}
          >
            {submission.status === "confirmed" ? "Completed" : "Declined"}
          </Button>
        )}
      </Box>
    </ClickAwayListener>
  );
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
  const [counts, setCounts] = useState<PaymentCounts>({ all: 0, pending: 0, confirmed: 0, declined: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [updatingSubmissionId, setUpdatingSubmissionId] = useState<string | null>(null);
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

  const updatePaymentStatus = async (
    submissionId: string,
    action: PaymentReviewAction,
    reason?: string,
  ): Promise<boolean> => {
    setUpdatingSubmissionId(submissionId);
    setError(null);
    try {
      const token = await getIdToken();
      const response = await fetch("/api/admin/cv-payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ submissionId, action, reason }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not update payment status.");
      }
      await response.json();
      setNotice(action === "confirm" ? "Payment completed. The booking link is ready." : "Request declined with its reason saved.");
      await loadSubmissions();
      return true;
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Could not update payment status.");
      return false;
    } finally {
      setUpdatingSubmissionId(null);
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
              Complete verified transfers, or decline suspicious requests with a clear reason. Booking links are available only after completion.
            </Typography>
          </Box>
          <Tooltip title="Refresh submissions">
            <IconButton onClick={() => void loadSubmissions()} disabled={isLoading} aria-label="Refresh payment submissions">
              <RefreshRounded />
            </IconButton>
          </Tooltip>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.25, mb: 2 }}>
          {([
            ["All requests", counts.all, "primary.main"],
            ["Needs review", counts.pending, "warning.main"],
            ["Completed", counts.confirmed, "success.main"],
            ["Declined", counts.declined, "error.main"],
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
              <ToggleButton value="confirmed">Completed</ToggleButton>
              <ToggleButton value="declined">Declined</ToggleButton>
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
              <Table stickyHeader size="small" aria-label="Nairah CV payment submissions" sx={{ minWidth: 1180 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>InstaPay handle</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Review</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => {
                    const isPending = submission.status === "pending";
                    const isCompleted = submission.status === "confirmed";
                    return (
                      <TableRow key={submission.id} hover>
                        <TableCell>{submission.serviceTitle}</TableCell>
                        <TableCell>{formatPrice(submission.priceEgp)}</TableCell>
                        <TableCell>{submission.instapayHandle ?? "Not collected"}</TableCell>
                        <TableCell>{submission.email ?? "Not collected"}</TableCell>
                        <TableCell>{formatDate(submission.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={isPending ? "Pending" : isCompleted ? "Completed" : "Declined"}
                            color={isPending ? "warning" : isCompleted ? "success" : "error"}
                          />
                          {submission.status === "declined" && submission.declineReason && (
                            <Typography sx={{ mt: 0.75, maxWidth: 230, color: "error.main", fontSize: "0.76rem", fontWeight: 700, lineHeight: 1.35 }}>
                              {submission.declineReason}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
                            {isCompleted && submission.instapayHandle && submission.email && (
                              <Button size="small" variant="outlined" startIcon={<ContentCopyRounded />} onClick={() => void copyBookingLink(submission)} sx={{ whiteSpace: "nowrap", textTransform: "none" }}>
                                Copy link
                              </Button>
                            )}
                            <PaymentStatusControl
                              submission={submission}
                              isUpdating={updatingSubmissionId === submission.id}
                              onUpdate={updatePaymentStatus}
                            />
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
