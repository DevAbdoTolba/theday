import React, { useEffect, useMemo, useState } from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import LaunchRounded from "@mui/icons-material/LaunchRounded";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
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

interface ReviewerAvatarProps {
  readonly reviewer: ReviewerProfile;
  readonly isPremium: boolean;
}

const REVIEWER_ORDER: readonly ReviewerId[] = [
  "nairah",
  "abdo-tolba",
  "omar-shawky",
];

function ReviewerAvatar({
  reviewer,
  isPremium,
}: ReviewerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [reviewer.portraitSrc]);

  const portraitSrc =
    reviewer.portraitSrc && !imageFailed ? reviewer.portraitSrc : undefined;

  return (
    <Avatar
      className="cv-fighter-avatar"
      src={portraitSrc}
      alt={portraitSrc ? `${reviewer.displayName} portrait` : undefined}
      imgProps={{ onError: () => setImageFailed(true) }}
      variant="rounded"
      sx={{
        width: { xs: 92, sm: "clamp(7rem, 13vw, 9.5rem)" },
        height: { xs: 92, sm: "clamp(9rem, 18vw, 12.5rem)" },
        flexShrink: 0,
        border: `1px solid ${
          isPremium ? "rgba(231,190,82,0.85)" : "rgba(255,255,255,0.72)"
        }`,
        borderRadius: "6px 10px 7px 9px",
        bgcolor: "#080808",
        backgroundImage: isPremium
          ? "radial-gradient(circle at 50% 32%, rgba(231,190,82,0.22), transparent 58%)"
          : "radial-gradient(circle at 50% 32%, rgba(255,255,255,0.15), transparent 58%)",
        color: isPremium ? "#f1cf74" : "#fff",
        fontSize: { xs: "1.1rem", sm: "1.4rem" },
        fontWeight: 950,
        letterSpacing: "0.08em",
        filter: "brightness(0.46) saturate(0.72)",
        transform: "scale(0.96)",
        transition:
          "filter 220ms ease, transform 260ms cubic-bezier(0.2, 0.82, 0.2, 1), box-shadow 220ms ease",
      }}
    >
      {reviewer.initials}
    </Avatar>
  );
}

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

  const selectedReviewer = useMemo(
    () =>
      orderedReviewers.find(
        (reviewer) =>
          reviewer.id === selectedReviewerId &&
          reviewer.booking.status === "available",
      ) ?? null,
    [orderedReviewers, selectedReviewerId],
  );

  const handleSelection = (reviewer: ReviewerProfile) => {
    if (reviewer.booking.status === "available") {
      onSelect(reviewer.id);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="cv-reviewer-dialog-title"
      maxWidth={false}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(8px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          position: "relative",
          width: {
            xs: "calc(100vw - 0.75rem)",
            sm: "min(56rem, calc(100vw - 2rem))",
          },
          height: {
            xs: "calc(100dvh - 0.75rem)",
            sm: "min(31rem, calc(100dvh - 2rem))",
          },
          maxWidth: "none",
          maxHeight: "none",
          m: { xs: 0.375, sm: 1 },
          overflow: "hidden",
          color: "#fff",
          bgcolor: "#000",
          backgroundImage:
            "radial-gradient(circle at 50% -18%, rgba(255,255,255,0.15), transparent 40%)",
          border: "1px solid #fff",
          borderRadius: { xs: "18px", sm: "28px 31px 26px 30px" },
          boxShadow:
            "0 36px 100px rgba(0,0,0,0.82), 0 0 46px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.16)",
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
      <DialogTitle
        id="cv-reviewer-dialog-title"
        sx={{
          position: "relative",
          zIndex: 4,
          flex: "0 0 auto",
          px: { xs: 6, sm: 3 },
          py: { xs: 1.5, sm: 2.1 },
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.24)",
        }}
      >
        <Typography
          component="span"
          sx={{
            display: "block",
            color: "#fff",
            fontSize: { xs: "1.25rem", sm: "1.75rem" },
            fontWeight: 950,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            textShadow: "0 0 18px rgba(255,255,255,0.22)",
          }}
        >
          Choose your fighter
        </Typography>

        <IconButton
          onClick={onClose}
          aria-label="Close reviewer selection"
          sx={{
            display: { xs: "inline-flex", sm: "none" },
            position: "absolute",
            insetBlockStart: "50%",
            insetInlineEnd: 10,
            transform: "translateY(-50%)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.55)",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.12)",
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
      </DialogTitle>

      <Box
        sx={{
          position: "relative",
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <RadioGroup
          aria-label="CV reviewer"
          name="cv-reviewer"
          value={selectedReviewerId ?? ""}
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
            gridTemplateRows: { xs: "repeat(3, minmax(0, 1fr))", sm: "1fr" },
          }}
        >
          {orderedReviewers.map((reviewer, index) => {
            const isAvailable = reviewer.booking.status === "available";
            const isPremium = reviewer.visualTier === "premium-gold";
            const isSelected = reviewer.id === selectedReviewerId;

            return (
              <Box
                component="label"
                key={reviewer.id}
                data-selected={isSelected ? "true" : "false"}
                data-available={isAvailable ? "true" : "false"}
                sx={{
                  position: "relative",
                  isolation: "isolate",
                  minWidth: 0,
                  minHeight: 0,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isAvailable ? "pointer" : "not-allowed",
                  color: "#fff",
                  opacity: isAvailable ? 1 : 0.58,
                  backgroundColor: "#030303",
                  backgroundImage: isPremium
                    ? "radial-gradient(circle at 50% 42%, rgba(173,119,11,0.20), transparent 58%)"
                    : "radial-gradient(circle at 50% 42%, rgba(255,255,255,0.075), transparent 60%)",
                  transition:
                    "background-color 180ms ease, box-shadow 220ms ease, opacity 180ms ease",
                  "&::after": {
                    content: index === orderedReviewers.length - 1 ? "none" : '""',
                    position: "absolute",
                    zIndex: 3,
                    pointerEvents: "none",
                    bgcolor: isPremium
                      ? "rgba(231,190,82,0.82)"
                      : "rgba(255,255,255,0.72)",
                    insetBlockStart: { xs: "auto", sm: "-10%" },
                    insetInlineEnd: { xs: "-5%", sm: -1 },
                    insetBlockEnd: { xs: -1, sm: "auto" },
                    width: { xs: "110%", sm: "1px" },
                    height: { xs: "1px", sm: "120%" },
                    transform: { xs: "rotate(-2.5deg)", sm: "rotate(7deg)" },
                    transformOrigin: "center",
                    boxShadow: "0 0 10px rgba(255,255,255,0.14)",
                  },
                  "&:hover": isAvailable
                    ? {
                        bgcolor: isPremium
                          ? "rgba(72,49,5,0.34)"
                          : "rgba(255,255,255,0.055)",
                        boxShadow: isPremium
                          ? "inset 0 0 54px rgba(231,190,82,0.12)"
                          : "inset 0 0 54px rgba(255,255,255,0.07)",
                      }
                    : undefined,
                  "&:hover .cv-fighter-avatar, &:focus-within .cv-fighter-avatar, &[data-selected='true'] .cv-fighter-avatar":
                    {
                      filter: "brightness(1) saturate(1)",
                      transform: "scale(1)",
                      boxShadow: isPremium
                        ? "0 0 0 1px rgba(231,190,82,0.45), 0 18px 42px rgba(231,190,82,0.18)"
                        : "0 18px 42px rgba(255,255,255,0.12)",
                    },
                  "&:hover .cv-fighter-name, &:focus-within .cv-fighter-name, &[data-selected='true'] .cv-fighter-name":
                    {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  "&:focus-within": {
                    outline: `3px solid ${isPremium ? "#e7be52" : "#fff"}`,
                    outlineOffset: -4,
                  },
                  "&[data-selected='true']": {
                    bgcolor: isPremium
                      ? "rgba(85,58,8,0.40)"
                      : "rgba(255,255,255,0.075)",
                    boxShadow: isPremium
                      ? "inset 0 0 0 1px rgba(231,190,82,0.58), inset 0 0 62px rgba(231,190,82,0.13)"
                      : "inset 0 0 0 1px rgba(255,255,255,0.72), inset 0 0 62px rgba(255,255,255,0.08)",
                  },
                  "@media (prefers-reduced-motion: reduce)": {
                    transitionDuration: "100ms",
                    "& .cv-fighter-avatar, & .cv-fighter-name": {
                      transitionDuration: "100ms",
                    },
                  },
                  "@media (forced-colors: active)": {
                    backgroundImage: "none",
                    "&:focus-within": {
                      outlineColor: "Highlight",
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
                  disabled={!isAvailable}
                  onChange={() => handleSelection(reviewer)}
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

                <Box
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: { xs: "row", sm: "column" },
                    alignItems: "center",
                    justifyContent: "center",
                    gap: { xs: 2, sm: 1.5 },
                    px: { xs: 2, sm: 1 },
                    pb: { xs: 0, sm: 4 },
                  }}
                >
                  <Box>
                    <ReviewerAvatar
                      reviewer={reviewer}
                      isPremium={isPremium}
                    />
                  </Box>

                  <Box
                    className="cv-fighter-name"
                    sx={{
                      minWidth: 0,
                      textAlign: { xs: "left", sm: "center" },
                      opacity: 0,
                      transform: { xs: "translateX(-8px)", sm: "translateY(8px)" },
                      transition:
                        "opacity 180ms ease, transform 220ms cubic-bezier(0.2, 0.82, 0.2, 1)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: isPremium ? "#f1cf74" : "#fff",
                        fontSize: { xs: "1rem", sm: "1.08rem" },
                        fontWeight: 950,
                        lineHeight: 1.1,
                        letterSpacing: "-0.025em",
                        textShadow: "0 2px 12px #000",
                      }}
                    >
                      {reviewer.displayName}
                    </Typography>
                    {!isAvailable && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 0.45,
                          color: "rgba(255,255,255,0.68)",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Coming soon
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </RadioGroup>

        <Button
          component="a"
          href={
            selectedReviewer?.booking.status === "available"
              ? selectedReviewer.booking.url
              : undefined
          }
          target={selectedReviewer ? "_blank" : undefined}
          rel={selectedReviewer ? "noopener noreferrer" : undefined}
          aria-label={
            selectedReviewer
              ? `Select ${selectedReviewer.displayName} on Calendly — opens in a new tab`
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
          endIcon={<LaunchRounded />}
          sx={{
            position: "absolute",
            zIndex: 8,
            insetInlineStart: "50%",
            insetBlockEnd: { xs: "3.5%", sm: "7%" },
            minWidth: { xs: 150, sm: 190 },
            minHeight: 46,
            px: 3,
            color: "#000",
            bgcolor: "#fff",
            borderRadius: "13px 16px 12px 15px",
            fontWeight: 950,
            textTransform: "none",
            opacity: selectedReviewer ? 1 : 0,
            pointerEvents: selectedReviewer ? "auto" : "none",
            transform: selectedReviewer
              ? "translate(-50%, 0)"
              : "translate(-50%, 220%)",
            transition:
              "transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease",
            boxShadow:
              "0 14px 38px rgba(0,0,0,0.72), 0 0 22px rgba(255,255,255,0.18)",
            "&:hover": {
              color: "#000",
              bgcolor: "#f1f1f1",
              transform: "translate(-50%, -2px)",
            },
            "&:focus-visible": {
              outline: "3px solid #fff",
              outlineOffset: 3,
            },
            "@media (prefers-reduced-motion: reduce)": {
              transitionDuration: "100ms",
            },
          }}
        >
          Select
        </Button>
      </Box>
    </Dialog>
  );
}
