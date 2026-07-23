import React, { useRef, useState } from "react";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { Box, Button, ClickAwayListener, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import CVReviewerDialog from "./CVReviewerDialog";
import type { ReviewerId, ReviewerProfile } from "./reviewers";

export type InvitationState = "closed" | "preview" | "pinned";

export interface CVReviewHeaderItemProps {
  readonly reviewers: readonly ReviewerProfile[];
}

const SLOT_SIZE = 48;
const TRIGGER_SIZE = 40;
const PANEL_ID = "cv-review-invitation-panel";

const HeaderSlot = styled(Box)({
  position: "relative",
  isolation: "isolate",
  width: SLOT_SIZE,
  height: SLOT_SIZE,
  flex: `0 0 ${SLOT_SIZE}px`,
  marginInline: 3,
  overflow: "visible",
  zIndex: 2,
});

/*
 * This is deliberately one bordered element in both states. The compact circle
 * grows into the invitation instead of sitting on top of a second panel.
 */
const OrganicSurface = styled(Box)({
  position: "absolute",
  insetBlockStart: 0,
  insetInlineEnd: 0,
  width: SLOT_SIZE,
  height: SLOT_SIZE,
  maxWidth: "calc(100vw - 1rem)",
  overflow: "hidden",
  color: "#fff",
  backgroundColor: "#000",
  backgroundImage:
    "radial-gradient(circle at 88% 8%, rgba(255,255,255,0.14), transparent 34%)",
  border: "1px solid #fff",
  borderRadius: "50%",
  boxShadow:
    "0 8px 24px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.14)",
  transformOrigin: "top right",
  transition:
    "width 440ms cubic-bezier(0.2, 0.82, 0.2, 1), height 440ms cubic-bezier(0.2, 0.82, 0.2, 1), border-radius 420ms cubic-bezier(0.2, 0.82, 0.2, 1), box-shadow 260ms ease",
  willChange: "width, height, border-radius",
  zIndex: 0,
  '&[data-state="preview"], &[data-state="pinned"]': {
    width: "min(20rem, calc(100vw - 1rem))",
    height: "11.25rem",
    borderRadius: "30px 42px 28px 34px / 34px 38px 30px 28px",
    boxShadow:
      "0 26px 68px rgba(0,0,0,0.62), 0 0 28px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.18)",
  },
  "@media (max-width: 420px)": {
    '&[data-state="preview"], &[data-state="pinned"]': {
      width: "min(18.5rem, calc(100vw - 1.5rem))",
      height: "10.75rem",
      borderRadius: "27px 40px 30px 33px / 31px 37px 32px 29px",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    willChange: "auto",
    transition:
      "width 110ms ease, height 110ms ease, border-radius 110ms ease, box-shadow 110ms ease",
  },
  "@media (forced-colors: active)": {
    borderColor: "CanvasText",
    background: "Canvas",
    color: "CanvasText",
    boxShadow: "none",
  },
});

const CVTrigger = styled(Button)({
  position: "absolute",
  insetBlockStart: 4,
  insetInlineEnd: 4,
  zIndex: 3,
  width: TRIGGER_SIZE,
  minWidth: TRIGGER_SIZE,
  height: TRIGGER_SIZE,
  padding: 0,
  color: "#fff",
  background: "transparent",
  border: 0,
  borderRadius: "50%",
  fontFamily: "Inter, ui-rounded, system-ui, sans-serif",
  fontSize: "0.92rem",
  fontWeight: 950,
  lineHeight: 1,
  letterSpacing: "-0.055em",
  textTransform: "none",
  textShadow: "0 1px 10px rgba(255,255,255,0.25)",
  transition:
    "letter-spacing 180ms ease, text-shadow 180ms ease, transform 180ms ease",
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
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "14px 62px 14px 18px",
  opacity: 0,
  visibility: "hidden",
  pointerEvents: "none",
  transform: "translateX(9px)",
  transition:
    "opacity 170ms ease, transform 230ms cubic-bezier(0.2, 0.82, 0.2, 1), visibility 0s linear 230ms",
  '&[data-visible="true"]': {
    opacity: 1,
    visibility: "visible",
    pointerEvents: "auto",
    transform: "translateX(0)",
    transitionDelay: "150ms, 130ms, 0s",
  },
  "@media (max-width: 420px)": {
    paddingInlineStart: 16,
    paddingBlock: 13,
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
      ? "Collapse CV review invitation"
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
              <Typography
                component="h2"
                sx={{
                  m: 0,
                  color: "#fff",
                  fontSize: { xs: "1.62rem", sm: "1.74rem" },
                  fontWeight: 950,
                  lineHeight: 1,
                  letterSpacing: "-0.05em",
                }}
              >
                Get hired!
              </Typography>

              <Typography
                sx={{
                  mt: 0.8,
                  maxWidth: "14rem",
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "0.88rem",
                  fontWeight: 650,
                  lineHeight: 1.35,
                }}
              >
                Book a 1:1 meeting to enhance your CV/Resume.
              </Typography>

              <Button
                onClick={handleDialogOpen}
                tabIndex={isOpen ? 0 : -1}
                variant="contained"
                endIcon={<ArrowForwardRounded />}
                sx={{
                  mt: 1.3,
                  minWidth: 108,
                  minHeight: 38,
                  px: 2,
                  color: "#000",
                  bgcolor: "#fff",
                  borderRadius: "13px 16px 12px 15px",
                  fontWeight: 950,
                  textTransform: "none",
                  boxShadow: "0 8px 22px rgba(255,255,255,0.13)",
                  "&:hover": {
                    color: "#000",
                    bgcolor: "#f1f1f1",
                    boxShadow: "0 11px 28px rgba(255,255,255,0.20)",
                  },
                  "&:focus-visible": {
                    outline: "3px solid #fff",
                    outlineOffset: 3,
                  },
                }}
              >
                Now!
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
