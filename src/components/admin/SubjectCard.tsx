import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { motion } from "framer-motion";
import PendingBadge from "./PendingBadge";
import type { ISubjectChangeRequest } from "../../utils/types";

interface SubjectCardProps {
  name: string;
  abbreviation: string;
  shared: boolean;
  semesterIndex: number;
  pendingChange?: ISubjectChangeRequest;
  onRequestEdit: () => void;
  onRequestDelete: () => void;
  onEditPending: () => void;
  onCancelPending: () => void;
  onDismissRejection?: () => void;
  onClick?: () => void;
  disabled?: boolean;
}

function getPendingBadgeStatus(
  change: ISubjectChangeRequest
): "pending" | "rejected" | "pending_edit" | "pending_delete" {
  if (change.status === "rejected") {
    return "rejected";
  }
  if (change.changeType === "edit" && change.status === "pending") {
    return "pending_edit";
  }
  if (change.changeType === "delete" && change.status === "pending") {
    return "pending_delete";
  }
  return "pending";
}

export default function SubjectCard({
  name,
  abbreviation,
  shared,
  semesterIndex,
  pendingChange,
  onRequestEdit,
  onRequestDelete,
  onEditPending,
  onCancelPending,
  onDismissRejection,
  onClick,
  disabled = false,
}: SubjectCardProps) {
  const [hovered, setHovered] = useState(false);

  const isClickable = !disabled && !pendingChange && !!onClick;
  const hasPending = !!pendingChange;

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      elevation={hovered && isClickable ? 4 : 2}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={isClickable ? onClick : undefined}
      sx={{
        cursor: isClickable ? "pointer" : "default",
        opacity: disabled ? 0.7 : 1,
        transition: "box-shadow 0.2s ease-in-out",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 700,
              fontSize: "0.75rem",
              flexShrink: 0,
            }}
          >
            {abbreviation}
          </Box>
          <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
            {name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Semester {semesterIndex}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
          {shared && (
            <Chip label="Shared" size="small" variant="outlined" />
          )}
          {pendingChange && (
            <PendingBadge
              status={getPendingBadgeStatus(pendingChange)}
              onDismiss={
                pendingChange.status === "rejected" ? onDismissRejection : undefined
              }
            />
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
        {!hasPending && (
          <>
            <Tooltip title="Edit subject">
              <IconButton
                size="small"
                aria-label={`Edit subject ${name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestEdit();
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete subject">
              <IconButton
                size="small"
                aria-label={`Delete subject ${name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete();
                }}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
        {hasPending && (
          <>
            <Tooltip title="Edit pending change">
              <IconButton
                size="small"
                aria-label={`Edit pending change for ${name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPending();
                }}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel pending change">
              <IconButton
                size="small"
                aria-label={`Cancel pending change for ${name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelPending();
                }}
              >
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </CardActions>
    </Card>
  );
}
