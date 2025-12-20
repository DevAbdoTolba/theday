import React from "react";
import {
  Box,
  Container,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Grid,
  Chip,
  alpha,
} from "@mui/material";
import {
  Folder as FolderIcon,
  CheckCircle as CheckIcon,
  Downloading as DownloadIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

interface ProgressiveLoadingUIProps {
  subject: string;
  folderStructure: Record<string, any> | null;
  loadingFolders: boolean;
  loadingFiles: boolean;
  data: any;
}

export default function ProgressiveLoadingUI({
  subject,
  folderStructure,
  loadingFolders,
  loadingFiles,
  data,
}: ProgressiveLoadingUIProps) {
  // Calculate loading progress
  const getProgress = () => {
    if (data && !loadingFiles) return 0;
    if (folderStructure && loadingFiles) return 35;
    if (loadingFolders) return 75;
    return 100;
  };

  const progress = getProgress();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Progress Bar */}
      {(loadingFolders || loadingFiles) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {loadingFolders && "Loading folder structure..."}
                {!loadingFolders && loadingFiles && "Loading files..."}
              </Typography>
              <Typography variant="body2" color="primary" fontWeight={600}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.1),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 3,
                  background: (theme) =>
                    `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                },
              }}
            />
          </Box>
        </motion.div>
      )}

      {/* Loading Stages Indicator */}
      {(loadingFolders || loadingFiles || folderStructure) && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          {/* Stage 1: Folders */}
          <Chip
            icon={
              loadingFolders ? (
                <DownloadIcon />
              ) : folderStructure ? (
                <CheckIcon />
              ) : (
                <FolderIcon />
              )
            }
            label="Folder Structure"
            color={folderStructure ? "success" : loadingFolders ? "primary" : "default"}
            variant={folderStructure ? "filled" : "outlined"}
            size="small"
          />

          {/* Stage 2: Files */}
          <Chip
            icon={
              loadingFiles ? (
                <DownloadIcon />
              ) : data ? (
                <CheckIcon />
              ) : (
                <FolderIcon />
              )
            }
            label="Files & Content"
            color={data && !loadingFiles ? "success" : loadingFiles ? "primary" : "default"}
            variant={data && !loadingFiles ? "filled" : "outlined"}
            size="small"
          />
        </Box>
      )}

      {/* Folder Structure Preview (Show immediately when folders load) */}
      {folderStructure && !data && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Categories Found ({Object.keys(folderStructure).length})
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(folderStructure).map(([id, folder]: [string, any]) => (
                  <Grid item xs={6} sm={4} md={3} key={id}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.05),
                        border: (theme) =>
                          `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FolderIcon fontSize="small" color="primary" />
                        <Typography variant="body2" noWrap>
                          {folder.name}
                        </Typography>
                      </Box>
                      {loadingFiles && (
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={16}
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
}