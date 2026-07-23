import React, { useEffect, useMemo, useState } from "react";
import CloseRounded from "@mui/icons-material/CloseRounded";
import LaunchRounded from "@mui/icons-material/LaunchRounded";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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
}

function ReviewerAvatar({ reviewer }: ReviewerAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [reviewer.portraitSrc]);

  const portraitSrc =
    reviewer.portraitSrc && !imageFailed ? reviewer.portraitSrc : undefined;

  return (
    <Avatar
      src={portraitSrc}
      alt={portraitSrc ? `${reviewer.displayName} portrait` : undefined}
      imgProps={{ onError: () => setImageFailed(true) }}
      sx={{
        width: 50,
        height: 50,
        flexShrink: 0,
        border: "1px solid rgba(255,255,255,0.72)",
        bgcolor: "#111",
        color: "#fff",
        fontSize: "0.82rem",
        fontWeight: 900,
        letterSpacing: "0.06em",
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
  const selectedReviewer = useMemo(
    () =>
      reviewers.find(
        (reviewer) =>
          reviewer.id === selectedReviewerId &&
          reviewer.booking.status === "available",
      ) ?? null,
    [reviewers, selectedReviewerId],
  );

  const firstAvailableId =
    reviewers.find((reviewer) => reviewer.booking.status === "available")?.id ??
    null;

  const handleSelection = (
    _event: React.ChangeEvent<HTMLInputElement>,
    value: string,
  ) => {
    const reviewer = reviewers.find(
      (candidate) =>
        candidate.id === value && candidate.booking.status === "available",
    );

    if (reviewer) {
      onSelect(reviewer.id);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="cv-reviewer-dialog-title"
      aria-describedby="cv-reviewer-dialog-description"
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: "rgba(0,0,0,0.74)",
            backdropFilter: "blur(7px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          width: "min(34rem, calc(100vw - 1rem))",
          maxHeight: "min(42rem, calc(100dvh - 1rem))",
          m: 0.5,
          overflow: "hidden",
          color: "#fff",
          bgcolor: "#000",
          backgroundImage:
            "radial-gradient(circle at 50% -20%, rgba(255,255,255,0.15), transparent 42%)",
          border: "1px solid #fff",
          borderRadius: { xs: "24px 24px 29px 22px", sm: "30px 27px 34px 25px" },
          boxShadow:
            "0 32px 90px rgba(0,0,0,0.72), 0 0 42px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.16)",
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
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
          pb: 1,
        }}
      >
        <Box>
          <Typography
            component="span"
            variant="h5"
            sx={{ display: "block", fontWeight: 950, letterSpacing: "-0.04em" }}
          >
            Pick your CV person
          </Typography>
          <Typography
            id="cv-reviewer-dialog-description"
            component="span"
            variant="body2"
            sx={{ display: "block", mt: 0.5, color: "rgba(255,255,255,0.68)" }}
          >
            One human, one live review, significantly fewer suspicious bullet
            points.
          </Typography>
        </Box>

        <IconButton
          autoFocus={!firstAvailableId}
          onClick={onClose}
          aria-label="Close reviewer selection"
          sx={{
            mt: -0.5,
            mr: -0.75,
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.48)",
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

      <DialogContent
        dividers
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          py: 2,
          borderColor: "rgba(255,255,255,0.16)",
          overflowY: "auto",
        }}
      >
        <FormControl component="fieldset" fullWidth>
          <FormLabel
            component="legend"
            sx={{
              mb: 1.25,
              color: "rgba(255,255,255,0.76)",
              fontSize: "0.78rem",
              fontWeight: 800,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              "&.Mui-focused": { color: "#fff" },
            }}
          >
            Choose one reviewer
          </FormLabel>

          <RadioGroup
            aria-label="CV reviewer"
            name="cv-reviewer"
            value={selectedReviewerId ?? ""}
            onChange={handleSelection}
            sx={{ gap: 1.25 }}
          >
            {reviewers.map((reviewer) => {
              const isAvailable = reviewer.booking.status === "available";
              const isPremium = reviewer.visualTier === "premium-gold";
              const isSelected = reviewer.id === selectedReviewerId;

              return (
                <FormControlLabel
                  key={reviewer.id}
                  value={reviewer.id}
                  disabled={!isAvailable}
                  control={
                    <Radio
                      autoFocus={reviewer.id === firstAvailableId}
                      inputProps={{
                        "aria-describedby": `cv-reviewer-${reviewer.id}-description`,
                      }}
                    />
                  }
                  label={
                    <Box
                      sx={{
                        minWidth: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.4,
                        py: 0.2,
                      }}
                    >
                      <ReviewerAvatar reviewer={reviewer} />

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 0.75,
                          }}
                        >
                          <Typography
                            component="span"
                            sx={{
                              color: "#fff",
                              fontWeight: 900,
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {reviewer.displayName}
                          </Typography>
                          {isPremium && (
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{
                                px: 0.7,
                                py: 0.1,
                                color: "#ffe08a",
                                border: "1px solid rgba(231,190,82,0.72)",
                                borderRadius: 999,
                                fontWeight: 850,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                              }}
                            >
                              Premium touch
                            </Typography>
                          )}
                        </Box>

                        <Typography
                          id={`cv-reviewer-${reviewer.id}-description`}
                          variant="body2"
                          sx={{
                            mt: 0.35,
                            color: isAvailable
                              ? "rgba(255,255,255,0.68)"
                              : "rgba(255,255,255,0.48)",
                            lineHeight: 1.45,
                          }}
                        >
                          {reviewer.reviewFocus}
                        </Typography>

                        {!isAvailable && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{
                              display: "inline-block",
                              mt: 0.6,
                              color: "#fff",
                              fontWeight: 850,
                              letterSpacing: "0.04em",
                            }}
                          >
                            Coming soon
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  }
                  sx={{
                    position: "relative",
                    isolation: "isolate",
                    overflow: "hidden",
                    width: "100%",
                    minHeight: 86,
                    m: 0,
                    px: { xs: 1, sm: 1.3 },
                    py: 0.9,
                    alignItems: "center",
                    color: "#fff",
                    bgcolor: isPremium
                      ? "rgba(119,82,10,0.13)"
                      : "rgba(255,255,255,0.035)",
                    backgroundImage: isPremium
                      ? "radial-gradient(circle at 88% 12%, rgba(231,190,82,0.19), transparent 38%)"
                      : "none",
                    border: `1px solid ${
                      isPremium ? "rgba(231,190,82,0.78)" : "rgba(255,255,255,0.30)"
                    }`,
                    borderRadius: isPremium
                      ? "18px 22px 19px 25px"
                      : "20px 17px 23px 18px",
                    opacity: isAvailable ? 1 : 0.62,
                    transition:
                      "border-color 180ms ease, background-color 180ms ease, box-shadow 220ms ease, transform 180ms ease",
                    "& .MuiRadio-root": {
                      flexShrink: 0,
                      color: isPremium
                        ? "rgba(231,190,82,0.78)"
                        : "rgba(255,255,255,0.58)",
                    },
                    "& .MuiRadio-root.Mui-checked": {
                      color: isPremium ? "#e7be52" : "#fff",
                    },
                    "& .MuiFormControlLabel-label": {
                      minWidth: 0,
                      flex: 1,
                    },
                    "&:hover": isAvailable
                      ? {
                          transform: "translateY(-1px)",
                          borderColor: isPremium ? "#e7be52" : "#fff",
                          bgcolor: isPremium
                            ? "rgba(119,82,10,0.22)"
                            : "rgba(255,255,255,0.08)",
                          boxShadow: isPremium
                            ? "0 12px 34px rgba(231,190,82,0.17)"
                            : "0 12px 30px rgba(255,255,255,0.08)",
                        }
                      : undefined,
                    "&:focus-within": {
                      outline: `3px solid ${isPremium ? "#e7be52" : "#fff"}`,
                      outlineOffset: 2,
                    },
                    ...(isSelected && {
                      borderColor: isPremium ? "#f4cf6d" : "#fff",
                      bgcolor: isPremium
                        ? "rgba(119,82,10,0.27)"
                        : "rgba(255,255,255,0.11)",
                      boxShadow: isPremium
                        ? "0 0 0 1px rgba(244,207,109,0.38), 0 16px 38px rgba(231,190,82,0.21)"
                        : "0 0 0 1px rgba(255,255,255,0.26), 0 16px 36px rgba(255,255,255,0.09)",
                    }),
                    ...(isPremium && {
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        inset: "-45% auto -45% -28%",
                        width: "20%",
                        zIndex: -1,
                        pointerEvents: "none",
                        background:
                          "linear-gradient(100deg, transparent, rgba(255,238,170,0.28), transparent)",
                        transform: "translateX(-180%) rotate(12deg)",
                      },
                      "&:hover::after, &:focus-within::after": {
                        animation:
                          "cvPremiumSweep 620ms cubic-bezier(0.2, 0.75, 0.25, 1) 1",
                      },
                      "@keyframes cvPremiumSweep": {
                        from: { transform: "translateX(-180%) rotate(12deg)" },
                        to: { transform: "translateX(760%) rotate(12deg)" },
                      },
                    }),
                    "@media (prefers-reduced-motion: reduce)": {
                      transitionDuration: "100ms",
                      transform: "none",
                      "&:hover": { transform: "none" },
                      "&::after": { animation: "none !important" },
                    },
                    "@media (forced-colors: active)": {
                      borderColor: "CanvasText",
                      backgroundImage: "none",
                      boxShadow: "none",
                      "&:focus-within": {
                        outlineColor: "Highlight",
                      },
                    },
                  }}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      </DialogContent>

      <DialogActions
        sx={{
          display: "block",
          px: { xs: 1.5, sm: 2.5 },
          py: 2,
          borderTop: "1px solid rgba(255,255,255,0.16)",
        }}
      >
        {selectedReviewer?.booking.status === "available" ? (
          <Button
            component="a"
            href={selectedReviewer.booking.url}
            target="_blank"
            rel="noopener noreferrer"
            fullWidth
            variant="contained"
            endIcon={<LaunchRounded />}
            aria-label={`Book with ${selectedReviewer.displayName} on Calendly — opens in a new tab`}
            sx={{
              minHeight: 48,
              color: "#000",
              bgcolor: "#fff",
              borderRadius: "15px 17px 14px 18px",
              fontWeight: 950,
              textTransform: "none",
              boxShadow: "0 9px 24px rgba(255,255,255,0.14)",
              "&:hover": {
                color: "#000",
                bgcolor: "#f2f2f2",
                boxShadow: "0 12px 30px rgba(255,255,255,0.20)",
              },
              "&:focus-visible": {
                outline: "3px solid #fff",
                outlineOffset: 3,
              },
            }}
          >
            Book with {selectedReviewer.displayName}
          </Button>
        ) : (
          <Button
            fullWidth
            disabled
            variant="contained"
            sx={{
              minHeight: 48,
              borderRadius: "15px 17px 14px 18px",
              bgcolor: `${alpha("#fff", 0.14)} !important`,
              color: "rgba(255,255,255,0.52) !important",
              fontWeight: 850,
              textTransform: "none",
            }}
          >
            Choose an available reviewer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
