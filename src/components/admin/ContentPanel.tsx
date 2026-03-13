import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { AnimatePresence, motion } from "framer-motion";
import ContentList from "./ContentList";
import AddContent from "./AddContent";

interface ContentPanelProps {
  classId: string;
  subject: string; // abbreviation
  categoryName: string;
  folderId: string;
}

export default function ContentPanel({
  classId,
  subject,
  categoryName,
  folderId,
}: ContentPanelProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((n) => n + 1);

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

          {/* Content list */}
          <ContentList
            classId={classId}
            category={categoryName}
            subject={subject}
            refreshTrigger={refreshTrigger}
          />

          {/* Unified add content (file upload + link in one section) */}
          <Box sx={{ mt: 3 }}>
            <AddContent
              classId={classId}
              folderId={folderId}
              category={categoryName}
              subject={subject}
              onContentAdded={triggerRefresh}
            />
          </Box>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
