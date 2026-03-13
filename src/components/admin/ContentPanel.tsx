import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { AnimatePresence, motion } from "framer-motion";
import AddContent from "./AddContent";
import ContentList from "./ContentList";

interface ContentPanelProps {
  classId: string;
  subject: string; // abbreviation
  categoryName: string;
  folderId: string;
  onSubjectMutated?: () => void;
}

export default function ContentPanel({
  classId,
  subject,
  categoryName,
  folderId,
  onSubjectMutated,
}: ContentPanelProps) {
  // AddContent updates the cache directly; refreshTrigger signals
  // ContentList to re-read from cache (not re-fetch from API).
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerCacheReRead = () => {
    setRefreshTrigger((n) => n + 1);
    onSubjectMutated?.();
  };

  const driveFolderUrl = `https://drive.google.com/drive/folders/${folderId}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={folderId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Box sx={{ pt: 2 }}>
          {/* Drive folder link for manual management */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              size="small"
              variant="text"
              endIcon={<OpenInNewIcon fontSize="small" />}
              href={driveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${categoryName} folder in Google Drive`}
              sx={{ textTransform: "none" }}
            >
              Open in Drive
            </Button>
          </Box>

          {/* Add content at the top — easier for admins to find */}
          <Box sx={{ mb: 3 }}>
            <AddContent
              classId={classId}
              folderId={folderId}
              category={categoryName}
              subject={subject}
              onContentAdded={triggerCacheReRead}
            />
          </Box>

          {/* Content list */}
          <ContentList
            classId={classId}
            category={categoryName}
            subject={subject}
            refreshTrigger={refreshTrigger}
            onContentDeleted={onSubjectMutated}
          />
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
