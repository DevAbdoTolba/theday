import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import ApprovalCard from "./ApprovalCard";
import SkeletonGrid from "./SkeletonGrid";
import type { PendingApproval } from "../../utils/types";

interface ApprovalListProps {
  pending: PendingApproval[];
  count: number;
  loading: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export default function ApprovalList({
  pending,
  count,
  loading,
  onApprove,
  onReject,
}: ApprovalListProps) {
  if (loading) {
    return <SkeletonGrid count={3} cardHeight={160} />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h6">Pending Approvals</Typography>
        {count > 0 && (
          <Chip label={count} color="warning" size="small" />
        )}
      </Box>

      {pending.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">
            No pending approvals
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          <AnimatePresence initial={false}>
            {pending.map((approval) => (
              <motion.div
                key={approval._id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ApprovalCard
                  approval={approval}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>
      )}
    </Box>
  );
}
