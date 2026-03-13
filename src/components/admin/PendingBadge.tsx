import { Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface PendingBadgeProps {
  status: "pending" | "rejected" | "pending_edit" | "pending_delete";
  onDismiss?: () => void;
}

const statusConfig: Record<
  PendingBadgeProps["status"],
  { label: string; color: "warning" | "info" | "error" }
> = {
  pending: { label: "Pending Approval", color: "warning" },
  pending_edit: { label: "Pending Edit", color: "info" },
  pending_delete: { label: "Pending Deletion", color: "error" },
  rejected: { label: "Rejected", color: "error" },
};

export default function PendingBadge({ status, onDismiss }: PendingBadgeProps) {
  const { label, color } = statusConfig[status];

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      {...(status === "rejected" && onDismiss
        ? { onDelete: onDismiss, deleteIcon: <CloseIcon /> }
        : {})}
    />
  );
}
