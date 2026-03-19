import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

interface ClassCardProps {
  classId: string;
  className: string;
  subjectCount: number;
  adminName?: string;
  adminEmail?: string;
  onEdit: () => void;
  onDelete: () => void;
  onAssignAdmin: () => void;
}

export default function ClassCard({
  className,
  subjectCount,
  adminName,
  adminEmail,
  onEdit,
  onDelete,
  onAssignAdmin,
}: ClassCardProps) {
  const isAssigned = !!adminName;

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {className}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {subjectCount} {subjectCount === 1 ? "subject" : "subjects"}
        </Typography>

        {isAssigned ? (
          <Tooltip title="Change admin">
            <Box
              onClick={onAssignAdmin}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                cursor: "pointer",
                borderRadius: 1,
                px: 1,
                py: 0.5,
                mx: -1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <PersonOutlinedIcon
                fontSize="small"
                sx={{ color: "text.secondary" }}
              />
              <Box>
                <Typography variant="body2">{adminName}</Typography>
                {adminEmail && (
                  <Typography variant="body2" color="text.secondary">
                    {adminEmail}
                  </Typography>
                )}
              </Box>
            </Box>
          </Tooltip>
        ) : (
          <Tooltip title="Assign admin">
            <Box
              onClick={onAssignAdmin}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                cursor: "pointer",
                borderRadius: 1,
                px: 1,
                py: 0.5,
                mx: -1,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <WarningAmberOutlinedIcon
                fontSize="small"
                sx={{ color: "warning.main" }}
              />
              <Typography variant="body2" sx={{ color: "warning.main" }}>
                Unassigned
              </Typography>
            </Box>
          </Tooltip>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
        <Tooltip title="Edit class">
          <IconButton size="small" aria-label={`Edit class ${className}`} onClick={onEdit}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete class">
          <IconButton size="small" aria-label={`Delete class ${className}`} onClick={onDelete}>
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
