import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  Button,
} from "@mui/material";
import type { PendingApproval } from "../../utils/types";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const changeTypeConfig: Record<
  PendingApproval["changeType"],
  { label: string; color: "success" | "info" | "error" }
> = {
  create: { label: "New Subject", color: "success" },
  edit: { label: "Edit Subject", color: "info" },
  delete: { label: "Delete Subject", color: "error" },
};

interface ApprovalCardProps {
  approval: PendingApproval;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export default function ApprovalCard({
  approval,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const { label, color } = changeTypeConfig[approval.changeType];
  const isEdit = approval.changeType === "edit";
  const busy = approving || rejecting;

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove(approval._id);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await onReject(approval._id);
    } finally {
      setRejecting(false);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Chip label={label} color={color} size="small" />
          <Typography variant="caption" color="text.secondary">
            {timeAgo(approval.createdAt)}
          </Typography>
        </Box>

        <Box sx={{ mb: 1 }}>
          {isEdit ? (
            <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
              {approval.originalSubjectName ?? approval.subjectName}{" "}
              <Typography
                component="span"
                variant="h6"
                color="text.secondary"
              >
                ({approval.originalSubjectAbbreviation ?? approval.subjectAbbreviation})
              </Typography>
              {" → "}
              {approval.subjectName}{" "}
              <Typography
                component="span"
                variant="h6"
                color="text.secondary"
              >
                ({approval.subjectAbbreviation})
              </Typography>
            </Typography>
          ) : (
            <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
              {approval.subjectName}{" "}
              <Typography
                component="span"
                variant="h6"
                color="text.secondary"
              >
                ({approval.subjectAbbreviation})
              </Typography>
            </Typography>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Class: {approval.className} &middot; Semester {approval.semesterIndex}
          {approval.shared && " \u00b7 Shared"}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Requested by {approval.requestedByName} ({approval.requestedByEmail})
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 1.5 }}>
        <Button
          variant="outlined"
          color="error"
          size="small"
          disabled={busy}
          onClick={handleReject}
        >
          {rejecting ? "..." : "Reject"}
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          disabled={busy}
          onClick={handleApprove}
        >
          {approving ? "..." : "Approve"}
        </Button>
      </CardActions>
    </Card>
  );
}
