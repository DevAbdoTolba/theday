import React from "react";
import {
  Paper,
  Typography,
  Box,
  Chip,
  Grid,
  IconButton,
  Collapse,
  useTheme,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  School,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

interface Subject {
  name: string;
  abbreviation: string;
}

interface SemesterCardProps {
  semesterIndex: number;
  subjects: Subject[];
  isCurrent?: boolean;
  customTitle?: string;
  isNavigating: boolean;
  onNavigate: (abbreviation: string) => void;
}

export default function SemesterCard({
  semesterIndex,
  subjects,
  isCurrent = false,
  customTitle,
  isNavigating,
  onNavigate,
}: SemesterCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = React.useState(true);
  const isDark = theme.palette.mode === "dark";

  // Track which subject is being loaded (from URL)
  const loadingSubject = isNavigating ? router.query.subject : null;

  // --- Dynamic Color Logic ---
  const cardBorder = isCurrent
    ? `2px solid ${
        isDark ? theme.palette.primary.dark : theme.palette.primary.main
      }`
    : `1px solid ${theme.palette.divider}`;

  const headerBg = isCurrent
    ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)
    : alpha(theme.palette.background.paper, 1);

  const iconBg = isCurrent
    ? isDark
      ? theme.palette.primary.dark
      : theme.palette.primary.main
    : theme.palette.action.selected;

  const iconColor = isCurrent ? "#fff" : theme.palette.text.secondary;

  // Handle subject click
  const handleSubjectClick = (abbreviation: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return; // Prevent clicks during navigation
    onNavigate(abbreviation);
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={isCurrent ? 0 : 0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          height: "100%",
          border: cardBorder,
          bgcolor: theme.palette.background.paper,
          transition: "all 0.2s",
          opacity: isNavigating ? 0.5 : 1, // Dim entire card during navigation
          "&:hover": {
            transform: isNavigating ? "none" : "translateY(-2px)",
            boxShadow: isNavigating
              ? "none"
              : `0 8px 24px ${alpha(
                  theme.palette.common.black,
                  isDark ? 0.3 : 0.08
                )}`,
            borderColor: isCurrent ? undefined : theme.palette.primary.light,
          },
        }}
      >
        {/* Header */}
        <Box
          onClick={() => !isNavigating && setExpanded(!expanded)}
          sx={{
            p: 2,
            bgcolor: headerBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: isNavigating ? "wait" : "pointer",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                p: 1,
                borderRadius: "50%",
                bgcolor: iconBg,
                color: iconColor,
                display: "flex",
                boxShadow: isCurrent
                  ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                  : "none",
              }}
            >
              <School fontSize="small" />
            </Box>
            <Typography
              variant="h6"
              fontWeight={700}
              fontSize="1.1rem"
              color={isCurrent ? "primary" : "text.primary"}
            >
              {customTitle
                ? customTitle
                : semesterIndex === -2
                ? "Shortcuts"
                : `Semester ${semesterIndex}`}
            </Typography>
            {isCurrent && (
              <Chip
                label="Active"
                size="small"
                color="primary"
                variant={isDark ? "outlined" : "filled"}
                sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }}
              />
            )}
          </Box>
          <IconButton size="small" disabled={isNavigating}>
            {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Box>

        {/* Subjects Grid */}
        <Collapse in={expanded}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={1}>
              {subjects.map((subj) => {
                const isThisSubjectLoading = loadingSubject === subj.abbreviation;
                
                return (
                  <Grid item xs={6} sm={12} md={6} key={subj.abbreviation}>
                    <Box
                      onClick={(e) => handleSubjectClick(subj.abbreviation, e)}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.text.primary, 0.03),
                        border: "1px solid transparent",
                        cursor: isNavigating ? "wait" : "pointer",
                        transition: "all 0.2s",
                        position: "relative",
                        opacity: isThisSubjectLoading ? 1 : 1,
                        pointerEvents: isNavigating ? "none" : "auto",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                          transform: isNavigating ? "none" : "scale(1.02)",
                        },
                      }}
                    >
                      {/* Loading Spinner - Only show on the clicked subject */}
                      {isThisSubjectLoading && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 2,
                          }}
                        >
                          <CircularProgress size={20} thickness={4} />
                        </Box>
                      )}

                      <Typography
                        variant="subtitle2"
                        fontWeight={800}
                        color={isDark ? "primary.light" : "primary.main"}
                        noWrap
                        sx={{ opacity: isThisSubjectLoading ? 0.3 : 1 }}
                      >
                        {subj.abbreviation}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          overflow: "hidden",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 1,
                          lineHeight: 1.2,
                          opacity: isThisSubjectLoading ? 0.3 : 1,
                        }}
                      >
                        {subj.name}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Collapse>
      </Paper>
    </motion.div>
  );
}