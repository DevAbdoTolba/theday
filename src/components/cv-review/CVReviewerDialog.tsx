import React, { useMemo } from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  RadioGroup,
  Typography,
} from "@mui/material";
import type { ReviewerId, ReviewerProfile } from "./reviewers";

export interface CVReviewerDialogProps {
  readonly open: boolean;
  readonly reviewers: readonly ReviewerProfile[];
  readonly selectedReviewerId: ReviewerId | null;
  readonly onSelect: (reviewerId: ReviewerId) => void;
  readonly onClose: () => void;
}

const REVIEWER_ORDER: readonly ReviewerId[] = [
  "nairah",
  "abdo-tolba",
  "omar-shawky",
];

const DESKTOP_CLIPS = [
  "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
  "polygon(25% 0, 100% 0, 75% 100%, 0 100%)",
  "polygon(25% 0, 100% 0, 100% 100%, 0 100%)",
] as const;

const MOBILE_CLIPS = [
  "polygon(0 0, 100% 0, 100% 75%, 0 100%)",
  "polygon(0 25%, 100% 0, 100% 75%, 0 100%)",
  "polygon(0 25%, 100% 0, 100% 100%, 0 100%)",
] as const;

export default function CVReviewerDialog({
  open,
  reviewers,
  selectedReviewerId,
  onSelect,
  onClose,
}: CVReviewerDialogProps) {
  const orderedReviewers = useMemo(
    () =>
      REVIEWER_ORDER.map((id) =>
        reviewers.find((reviewer) => reviewer.id === id),
      ).filter((reviewer): reviewer is ReviewerProfile => Boolean(reviewer)),
    [reviewers],
  );

  const selectedReviewer =
    orderedReviewers.find(
      (reviewer) => reviewer.id === selectedReviewerId,
    ) ?? null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-label="Choose a CV reviewer"
      maxWidth={false}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(0,0,0,0.86)",
            backdropFilter: "blur(8px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          position: "relative",
          width: {
            xs: "calc(100vw - 0.75rem)",
            sm: "min(58rem, calc(100vw - 2rem))",
          },
          height: {
            xs: "calc(100dvh - 0.75rem)",
            sm: "min(32rem, calc(100dvh - 2rem))",
          },
          maxWidth: "none",
          maxHeight: "none",
          m: { xs: 0.375, sm: 1 },
          overflow: "hidden",
          bgcolor: "#000",
          border: "1px solid #fff",
          borderRadius: { xs: "18px", sm: "28px 31px 26px 30px" },
          boxShadow:
            "0 36px 100px rgba(0,0,0,0.84), 0 0 46px rgba(255,255,255,0.09)",
          "@media (prefers-reduced-motion: reduce)": {
            transitionDuration: "100ms !important",
          },
          "@media (forced-colors: active)": {
            borderColor: "CanvasText",
            boxShadow: "none",
          },
        },
      }}
    >
      <RadioGroup
        aria-label="CV reviewer"
        name="cv-reviewer"
        value={selectedReviewerId ?? ""}
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        {orderedReviewers.map((reviewer, index) => {
          const isSelected = reviewer.id === selectedReviewerId;
          const isPremium = reviewer.visualTier === "premium-gold";

          return (
            <Box
              component="label"
              key={reviewer.id}
              data-selected={isSelected ? "true" : "false"}
              sx={{
                position: "absolute",
                isolation: "isolate",
                overflow: "hidden",
                cursor: "pointer",
                insetInlineStart: {
                  xs: 0,
                  sm: `${index * 30}%`,
                },
                insetBlockStart: {
                  xs: `${index * 30}%`,
                  sm: 0,
                },
                width: {
                  xs: "100%",
                  sm: "40%",
                },
                height: {
                  xs: "40%",
                  sm: "100%",
                },
                clipPath: {
                  xs: MOBILE_CLIPS[index],
                  sm: DESKTOP_CLIPS[index],
                },
                zIndex: index + 1,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  zIndex: -1,
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.34), rgba(0,0,0,0.34)), url("${reviewer.portraitSrc}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: isSelected
                    ? "brightness(0.92) saturate(1)"
                    : "brightness(0.48) saturate(0.76)",
                  transform: isSelected ? "scale(1.025)" : "scale(1.01)",
                  transition:
                    "filter 240ms ease, transform 340ms cubic-bezier(0.2, 0.82, 0.2, 1)",
                },
                "&:hover::before, &:focus-within::before": {
                  filter: isSelected
                    ? "brightness(0.96) saturate(1.04)"
                    : "brightness(0.68) saturate(0.9)",
                  transform: "scale(1.025)",
                },
                "&::after": {
                  content: isPremium ? '""' : "none",
                  position: "absolute",
                  inset: 0,
                  zIndex: 0,
                  pointerEvents: "none",
                  background:
                    "radial-gradient(circle at 38% 34%, rgba(255,224,122,0.20), transparent 38%), linear-gradient(135deg, rgba(231,190,82,0.10), transparent 48%)",
                  opacity: isSelected ? 0.72 : 0.34,
                  transition: "opacity 220ms ease",
                },
                "&:hover::after, &:focus-within::after": {
                  opacity: isSelected ? 0.78 : 0.5,
                },
                "@media (prefers-reduced-motion: reduce)": {
                  "&::before": {
                    transitionDuration: "100ms",
                    transform: "none",
                  },
                },
                "@media (forced-colors: active)": {
                  clipPath: "none",
                  outline: "1px solid CanvasText",
                  "&::before": {
                    backgroundImage: "none",
                    backgroundColor: "Canvas",
                    filter: "none",
                  },
                  "&:focus-within": {
                    outlineColor: "Highlight",
                    outlineStyle: "solid",
                    outlineWidth: 2,
                  },
                },
              }}
            >
              <Box
                component="input"
                type="radio"
                name="cv-reviewer"
                value={reviewer.id}
                checked={isSelected}
                onChange={() => onSelect(reviewer.id)}
                aria-label={reviewer.displayName}
                sx={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  p: 0,
                  m: -1,
                  overflow: "hidden",
                  clip: "rect(0 0 0 0)",
                  whiteSpace: "nowrap",
                  border: 0,
                }}
              />

              <Typography
                aria-hidden={!isSelected}
                sx={{
                  position: "absolute",
                  zIndex: 2,
                  insetInlineStart: "50%",
                  insetBlockStart: { xs: "48%", sm: "54%" },
                  width: "max-content",
                  maxWidth: "82%",
                  color: "#fff",
                  fontSize: {
                    xs: "clamp(1.45rem, 8vw, 2.2rem)",
                    sm: "clamp(2rem, 4.4vw, 4rem)",
                  },
                  fontWeight: 1000,
                  lineHeight: 0.92,
                  letterSpacing: "-0.07em",
                  textAlign: "center",
                  textTransform: "uppercase",
                  textShadow:
                    "0 2px 7px rgba(0,0,0,0.98), 0 0 22px rgba(0,0,0,0.86)",
                  opacity: isSelected ? 1 : 0,
                  transform: isSelected
                    ? "translate(-50%, -50%)"
                    : "translate(-50%, calc(-50% + 14px))",
                  transition:
                    "opacity 180ms ease, transform 260ms cubic-bezier(0.2, 0.82, 0.2, 1)",
                  pointerEvents: "none",
                  "@media (prefers-reduced-motion: reduce)": {
                    transitionDuration: "100ms",
                  },
                  "@media (forced-colors: active)": {
                    color: "CanvasText",
                  },
                }}
              >
                {reviewer.displayName}
              </Typography>
            </Box>
          );
        })}
      </RadioGroup>

      <IconButton
        onClick={onClose}
        aria-label="Close reviewer selection"
        sx={{
          display: { xs: "inline-flex", sm: "none" },
          position: "absolute",
          zIndex: 20,
          insetBlockStart: 12,
          insetInlineEnd: 12,
          color: "#fff",
          bgcolor: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.62)",
          "&:hover": {
            bgcolor: "rgba(0,0,0,0.72)",
            borderColor: "#fff",
          },
          "&:focus-visible": {
            outline: "3px solid #fff",
            outlineOffset: 2,
          },
        }}
      >
        <CloseRounded />
      </IconButton>

      <Button
        component="a"
        href={selectedReviewer?.booking.url}
        target={selectedReviewer ? "_blank" : undefined}
        rel={selectedReviewer ? "noopener noreferrer" : undefined}
        aria-label={
          selectedReviewer
            ? `Meet ${selectedReviewer.displayName} — opens example.com in a new tab`
            : "Select a reviewer first"
        }
        aria-disabled={!selectedReviewer}
        aria-hidden={!selectedReviewer}
        tabIndex={selectedReviewer ? 0 : -1}
        onClick={(event) => {
          if (!selectedReviewer) {
            event.preventDefault();
          }
        }}
        variant="contained"
        sx={{
          position: "absolute",
          zIndex: 30,
          insetInlineStart: "50%",
          insetBlockEnd: { xs: "4%", sm: "8%" },
          minWidth: { xs: 150, sm: 210 },
          minHeight: { xs: 48, sm: 58 },
          px: 3.5,
          color: "#000",
          bgcolor: "#ffe600",
          border: 0,
          borderRadius: "8px 13px 7px 11px",
          fontSize: { xs: "1.2rem", sm: "1.5rem" },
          fontStyle: "italic",
          fontWeight: 1000,
          letterSpacing: "-0.04em",
          textTransform: "none",
          opacity: selectedReviewer ? 1 : 0,
          pointerEvents: selectedReviewer ? "auto" : "none",
          transform: selectedReviewer
            ? "translate(-50%, 0)"
            : "translate(-50%, calc(100% + 9rem))",
          transition:
            "transform 380ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease",
          boxShadow:
            "0 16px 42px rgba(0,0,0,0.78), 0 0 26px rgba(255,230,0,0.30)",
          "&:hover": {
            color: "#000",
            bgcolor: "#ffef4d",
            transform: "translate(-50%, -2px)",
          },
          "&:focus-visible": {
            outline: "3px solid #fff",
            outlineOffset: 3,
          },
          "@media (prefers-reduced-motion: reduce)": {
            transitionDuration: "100ms",
          },
          "@media (forced-colors: active)": {
            color: "ButtonText",
            bgcolor: "ButtonFace",
          },
        }}
      >
        Meet
      </Button>
    </Dialog>
  );
}
