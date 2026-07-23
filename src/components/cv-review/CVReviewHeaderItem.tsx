import React, { useRef, useState } from "react";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import {
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CVReviewerDialog from "./CVReviewerDialog";
import type { ReviewerId, ReviewerProfile } from "./reviewers";

export type InvitationState = "closed" | "preview" | "pinned";

export interface CVReviewHeaderItemProps {
  readonly reviewers: readonly ReviewerProfile[];
}

const SLOT_SIZE = 44;
const PANEL_ID = "cv-review-invitation-panel";

const HeaderSlot = styled(Box)({
  position: "relative",
  isolation: "isolate",
  width: SLOT_SIZE,
  height: SLOT_SIZE,
  flex: `0 0 ${SLOT_SIZE}px`,
  overflow: "visible",
  zIndex: 2,
});

const OrganicSurface = styled(Box)({
  position: "absolute",
  insetBlockStart: 0,
  insetInlineEnd: 0,
  width: SLOT_SIZE,
  height: SLOT_SIZE,
  maxWidth: "calc(100vw - 2rem)",
  maxHeight: "calc(100dvh - 5rem)",
  overflow: "visible",
  color: "#fff",
  backgroundColor: "#000",
  backgroundImage:
    "radial-gradient(circle at 82% 4%, rgba(255,255,255,0.15), transparent 31%)",
  border: "1px solid #fff",
  borderRadius: "49% 51% 46% 54% / 45% 48% 52% 55%",
  boxShadow:
    "0 8px 24px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.14)",
  transformOrigin: "top right",
  transition:
    "width 460ms cubic-bezier(0.22, 0.8, 0.22, 1), height 460ms cubic-bezier(0.22, 0.8, 0.22, 1), border-radius 440ms cubic-bezier(0.22, 0.8, 0.22, 1), box-shadow 300ms ease",
  willChange: "width, height, border-radius",
  zIndex: 0,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: -22,
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 44%, transparent 70%)",
    opacity: 0,
    transform: "scale(0.72)",
    transition: "opacity 220ms ease, transform 420ms cubic-bezier(0.22, 0.8, 0.22, 1)",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    insetBlockStart: -8,
    insetInlineEnd: -7,
    width: 66,
    height: 58,
    zIndex: 0,
    pointerEvents: "none",
    border: "1px solid rgba(255,255,255,0.88)",
    borderRadius: "48% 52% 44% 56% / 54% 46% 54% 46%",
    background: "#000",
    opacity: 0,
    transform: "scale(0.72)",
    transition: "opacity 160ms ease, transform 420ms cubic-bezier(0.22, 0.8, 0.22, 1)",
  },
  '&[data-state="preview"], &[data-state="pinned"]': {
    width: "min(22rem, calc(100vw - 2rem))",
    height: "min(18.5rem, calc(100dvh - 5rem))",
    borderRadius: "24px 31px 34px 27px / 28px 23px 37px 31px",
    boxShadow:
      "0 28px 72px rgba(0,0,0,0.64), 0 0 34px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.18)",
    "&::before": {
      opacity: 1,
      transform: "scale(1)",
    },
    "&::after": {
      opacity: 1,
      transform: "scale(1)",
    },
  },
  "@media (max-width: 420px)": {
    '&[data-state="preview"], &[data-state="pinned"]': {
      width: "calc(100vw - 2rem)",
      height: "min(19rem, calc(100dvh - 4.5rem))",
      borderRadius: "22px 27px 31px 24px / 25px 21px 34px 29px",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    willChange: "auto",
    transition:
      "opacity 110ms ease, width 110ms ease, height 110ms ease, border-radius 110ms ease",
    "&::before, &::after": {
      transition: "opacity 100ms ease",
      transform: "none !important",
    },
  },
  "@media (forced-colors: active)": {
    borderColor: "CanvasText",
    background: "Canvas",
    color: "CanvasText",
    boxShadow: "none",
    "&::before, &::after": {
      background: "Canvas",
      borderColor: "CanvasText",
    },
  },
});

const CVTrigger = styled(Button)({
  position: "absolute",
  insetBlockStart: 0,
  insetInlineEnd: 0,
  zIndex: 3,
  width: SLOT_SIZE,
  minWidth: SLOT_SIZE,
  height: SLOT_SIZE,
  padding: 0,
  color: "#fff",
  background: "transparent",
  border: 0,
  borderRadius: "50%",
  fontFamily: "Inter, ui-rounded, system-ui, sans-serif",
  fontSize: "0.88rem",
  fontWeight: 950,
  lineHeight: 1,
  letterSpacing: "-0.055em",
  textTransform: "none",
  textShadow: "0 1px 10px rgba(255,255,255,0.25)",
  transition: "letter-spacing 180ms ease, text-shadow 180ms ease, transform 180ms ease",
  "&:hover": {
    color: "#fff",
    background: "transparent",
    letterSpacing: "-0.015em",
    textShadow: "0 0 15px rgba(255,255,255,0.55)",
    transform: "translateY(-1px)",
  },
  "&:focus-visible": {
    outline: "3px solid #fff",
    outlineOffset: 3,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transitionDuration: "100ms",
    transform: "none !important",
  },
  "@media (forced-colors: active)": {
    color: "ButtonText",
    "&:focus-visible": { outlineColor: "Highlight" },
  },
});

const InvitationContent = styled(Box)({
  position: "absolute",
  zIndex: 1,
  insetBlockStart: 54,
  insetInline: 0,
  insetBlockEnd: 0,
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  padding: "4px 20px 20px",
  opacity: 0,
  visibility: "hidden",
  pointerEvents: "none",
  transform: "translateY(-9px)",
  transition:
    "opacity 170ms ease, transform 240ms cubic-bezier(0.22, 0.8, 0.22, 1), visibility 0s linear 240ms",
  '&[data-visible="true"]': {
    opacity: 1,
    visibility: "visible",
    pointerEvents: "auto",
    transform: "translateY(0)",
    transitionDelay: "170ms, 150ms, 0s",
  },
  "@media (max-width: 420px)": {
    paddingInline: 17,
    paddingBlockEnd: 17,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transform: "none",
    transition: "opacity 110ms ease, visibility 0s linear 110ms",
    '&[data-visible="true"]': {
      transitionDelay: "0s",
    },
  },
});

function hasFinePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

export default function CVReviewHeaderItem({
  reviewers,
}: CVReviewHeaderItemProps) {
  const [invitationState, setInvitationState] =
    useState<InvitationState>("closed");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReviewerId, setSelectedReviewerId] =
    useState<ReviewerId | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const invitationStateRef = useRef<InvitationState>("closed");
  const dialogOpenRef = useRef(false);
  const suppressFocusPreviewRef = useRef(false);

  const isOpen = invitationState !== "closed";

  const updateInvitationState = (nextState: InvitationState) => {
    invitationStateRef.current = nextState;
    setInvitationState(nextState);
  };

  const closeInvitation = (restoreTriggerFocus = false) => {
    if (dialogOpenRef.current) {
      return;
    }

    updateInvitationState("closed");
    if (restoreTriggerFocus) {
      suppressFocusPreviewRef.current = true;
      triggerRef.current?.focus();
    }
  };

  const handlePointerEnter = () => {
    if (
      hasFinePointer() &&
      invitationStateRef.current === "closed" &&
      !dialogOpenRef.current
    ) {
      updateInvitationState("preview");
    }
  };

  const handlePointerLeave = () => {
    if (
      invitationStateRef.current === "preview" &&
      !slotRef.current?.contains(document.activeElement)
    ) {
      updateInvitationState("closed");
    }
  };

  const handleFocusCapture = () => {
    if (suppressFocusPreviewRef.current) {
      suppressFocusPreviewRef.current = false;
      return;
    }

    if (
      invitationStateRef.current === "closed" &&
      !dialogOpenRef.current
    ) {
      updateInvitationState("preview");
    }
  };

  const handleBlurCapture = (event: React.FocusEvent<HTMLDivElement>) => {
    if (
      invitationStateRef.current === "preview" &&
      !slotRef.current?.contains(event.relatedTarget as Node | null) &&
      !dialogOpenRef.current
    ) {
      updateInvitationState("closed");
    }
  };

  const handleTriggerActivation = () => {
    updateInvitationState(
      invitationStateRef.current === "pinned" ? "closed" : "pinned",
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && !dialogOpenRef.current && isOpen) {
      event.preventDefault();
      closeInvitation(true);
    }
  };

  const handleDialogOpen = () => {
    updateInvitationState("pinned");
    dialogOpenRef.current = true;
    setSelectedReviewerId(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    dialogOpenRef.current = false;
    setDialogOpen(false);
    setSelectedReviewerId(null);
    updateInvitationState("pinned");
  };

  const triggerLabel =
    invitationState === "pinned"
      ? "Close CV review invitation"
      : invitationState === "preview"
        ? "Pin CV review invitation open"
        : "Open CV review invitation";

  return (
    <>
      <ClickAwayListener
        onClickAway={() => {
          if (!dialogOpenRef.current) {
            closeInvitation();
          }
        }}
      >
        <HeaderSlot
          ref={slotRef}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
          onKeyDown={handleKeyDown}
          data-cv-review-slot
        >
          <OrganicSurface
            id={PANEL_ID}
            role="region"
            aria-label="CV review invitation"
            aria-hidden={!isOpen}
            data-state={invitationState}
          >
            <InvitationContent data-visible={isOpen ? "true" : "false"}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 34,
                  mb: 1,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "rgba(255,255,255,0.62)",
                    fontSize: "0.68rem",
                    fontWeight: 850,
                    letterSpacing: "0.12em",
                    lineHeight: 1,
                  }}
                >
                  Live 1:1 CV review
                </Typography>
                <IconButton
                  onClick={() => closeInvitation(true)}
                  tabIndex={isOpen ? 0 : -1}
                  aria-label="Close CV review invitation"
                  size="small"
                  sx={{
                    mr: -0.5,
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.42)",
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
                  <CloseRounded fontSize="small" />
                </IconButton>
              </Box>

              <Typography
                component="h2"
                sx={{
                  maxWidth: "18rem",
                  color: "#fff",
                  fontSize: { xs: "1.28rem", sm: "1.42rem" },
                  fontWeight: 950,
                  lineHeight: 1.08,
                  letterSpacing: "-0.045em",
                }}
              >
                Your CV says “hire me.” Does it, though?
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 1.15,
                  color: "rgba(255,255,255,0.72)",
                  lineHeight: 1.55,
                }}
              >
                Let someone who actually studies this stuff catch the bits
                recruiters politely pretend not to see. Pick your reviewer
                before your CV develops trust issues.
              </Typography>

              <Button
                onClick={handleDialogOpen}
                tabIndex={isOpen ? 0 : -1}
                variant="contained"
                endIcon={<ArrowForwardRounded />}
                sx={{
                  mt: "auto",
                  minHeight: 45,
                  color: "#000",
                  bgcolor: "#fff",
                  borderRadius: "15px 18px 14px 17px",
                  fontWeight: 950,
                  textTransform: "none",
                  boxShadow: "0 10px 28px rgba(255,255,255,0.13)",
                  "&:hover": {
                    color: "#000",
                    bgcolor: "#f1f1f1",
                    boxShadow: "0 13px 34px rgba(255,255,255,0.20)",
                  },
                  "&:focus-visible": {
                    outline: "3px solid #fff",
                    outlineOffset: 3,
                  },
                }}
              >
                Choose your reviewer
              </Button>
            </InvitationContent>
          </OrganicSurface>

          <CVTrigger
            ref={triggerRef}
            onClick={handleTriggerActivation}
            aria-label={triggerLabel}
            aria-expanded={isOpen}
            aria-controls={PANEL_ID}
          >
            CV
          </CVTrigger>
        </HeaderSlot>
      </ClickAwayListener>

      <CVReviewerDialog
        open={dialogOpen}
        reviewers={reviewers}
        selectedReviewerId={selectedReviewerId}
        onSelect={setSelectedReviewerId}
        onClose={handleDialogClose}
      />
    </>
  );
}
