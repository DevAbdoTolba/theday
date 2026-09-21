import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Alert, Box, Button, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import LinkOffRounded from "@mui/icons-material/LinkOffRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import {
  hasUnsupportedInstapayUsernameInput,
  isValidInstapayHandle,
  sanitizeInstapayUsernameInput,
  verifyBookingGateToken,
} from "../../../../../../components/cv-review/booking-gate";
import CVSupportContact from "../../../../../../components/cv-review/CVSupportContact";
import { NAIRAH_DESTINATION } from "../../../../../../components/cv-review/reviewers";

const CONSOLE_ART = `██████╗ ██╗     ███████╗ █████╗ ███████╗███████╗    ██████╗  ██████╗ ███╗   ██╗████████╗       ██╗
██╔══██╗██║     ██╔════╝██╔══██╗██╔════╝██╔════╝    ██╔══██╗██╔═══██╗████╗  ██║╚══██╔══╝    ██╗╚██╗
██████╔╝██║     █████╗  ███████║███████╗█████╗      ██║  ██║██║   ██║██╔██╗ ██║   ██║       ╚═╝ ██║
██╔═══╝ ██║     ██╔══╝  ██╔══██║╚════██║██╔══╝      ██║  ██║██║   ██║██║╚██╗██║   ██║       ██╗ ██║
██║     ███████╗███████╗██║  ██║███████║███████╗    ██████╔╝╚██████╔╝██║ ╚████║   ██║       ╚═╝██╔╝
╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝   ╚═╝          ╚═╝`;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    bgcolor: "rgba(255,255,255,0.04)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.58)" },
    "&:hover fieldset": { borderColor: "#fff" },
  },
};

export default function NairahSchedulePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [instapayHandle, setInstapayHandle] = useState("");
  const [handleInputWarning, setHandleInputWarning] = useState(false);
  const [fullName, setFullName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [purchasedService, setPurchasedService] = useState<string | null>(null);
  const [calendarName, setCalendarName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const fullInstapayHandle = instapayHandle.trim() ? `${instapayHandle.trim()}@instapay` : "";
  const handleIsValid = isValidInstapayHandle(fullInstapayHandle);
  const fullNameIsValid = fullName.trim().length >= 2 && fullName.trim().length <= 120;
  const suppliedToken = typeof router.query.u === "string" ? router.query.u : "";

  useEffect(() => {
    console.info(`%c${CONSOLE_ART}`, "color:#ffe600;background:#050505;font:900 12px/1 monospace;letter-spacing:0;padding:0;border:0;");
    console.info("%cIf you are interested in a nice position, please contact me at DevAbdoTolba@gmail.com with subject 'Hacked theday'", "color:#fff;background:#050505;font:800 16px/1.5 sans-serif;padding:12px 18px;border-left:5px solid #ffe600;");
  }, []);

  const verifyIdentity = async () => {
    if (!emailIsValid || !handleIsValid || !suppliedToken) return;
    setIsChecking(true);
    setError(null);
    try {
      const verification = await verifyBookingGateToken(suppliedToken, email, fullInstapayHandle);
      if (!verification.valid) {
        setError("The email, InstaPay handle, or purchased service does not match this booking link.");
        return;
      }
      setPurchasedService(verification.serviceTitle);
      setIsUnlocked(true);
    } catch {
      setError("Could not verify this booking link. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  if (!router.isReady) {
    return <Box sx={{ minHeight: "100dvh", bgcolor: "#000" }} />;
  }

  if (!suppliedToken) {
    return (
      <>
        <Head>
          <title>Invalid Nairah booking link | TheDay</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <Box component="main" sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", bgcolor: "#000", color: "#fff", px: 2 }}>
          <Box role="alert" sx={{ width: "100%", maxWidth: "35rem", p: { xs: 3, sm: 4.5 }, textAlign: "center", border: "1px solid #fff", borderRadius: "27px 34px 28px 32px / 31px 27px 35px 29px", bgcolor: "rgba(255,255,255,0.045)" }}>
            <LinkOffRounded sx={{ color: "#ffe600", fontSize: 58 }} />
            <Typography component="h1" sx={{ mt: 1.5, fontSize: { xs: "2.15rem", sm: "3.5rem" }, fontWeight: 1000, lineHeight: 0.92, letterSpacing: "-0.07em" }}>This link cannot work.</Typography>
            <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.75)", fontSize: { xs: "1rem", sm: "1.1rem" }, lineHeight: 1.55 }}>The booking URL is incomplete. Ask Nairah to send you the correct, complete scheduling link.</Typography>
            <CVSupportContact />
          </Box>
        </Box>
      </>
    );
  }

  const calendlyUrl = new URL(NAIRAH_DESTINATION.url);
  if (calendarName) {
    calendlyUrl.searchParams.set("name", calendarName);
    calendlyUrl.searchParams.set("email", email.trim());
    if (purchasedService) calendlyUrl.searchParams.set("a1", purchasedService);
  }

  return (
    <>
      <Head>
        <title>Schedule with Nairah A. | TheDay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Box component="main" sx={{ minHeight: "100dvh", bgcolor: "#000", color: "#fff", px: { xs: 1.25, sm: 3 }, py: { xs: 1.25, sm: 2.5 } }}>
        <Box sx={{ width: "100%", maxWidth: calendarName ? "72rem" : "34rem", mx: "auto" }}>
          {!isUnlocked && (
            <Box sx={{ mt: { xs: 3, sm: 8 }, p: { xs: 2.5, sm: 4 }, border: "1px solid #fff", borderRadius: "24px 31px 25px 29px / 28px 25px 33px 26px" }}>
              <Typography component="h1" sx={{ fontSize: { xs: "2rem", sm: "3.2rem" }, fontWeight: 1000, lineHeight: 0.95, letterSpacing: "-0.065em" }}>One quick check.</Typography>
              <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.7)" }}>Enter the same details used for your payment request.</Typography>
              <Box sx={{ mt: 3, display: "grid", gap: 1.5 }}>
                <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" error={email.length > 0 && !emailIsValid} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.72)" } }} sx={fieldSx} />
                <Tooltip open={handleInputWarning} title="English letters and numbers only." placement="top" arrow disableFocusListener disableHoverListener disableTouchListener><TextField label="InstaPay username" value={instapayHandle} onChange={(event) => { const rawValue = event.target.value; setHandleInputWarning(hasUnsupportedInstapayUsernameInput(rawValue)); setInstapayHandle(sanitizeInstapayUsernameInput(rawValue)); }} onBlur={() => setHandleInputWarning(false)} required autoComplete="off" placeholder="name123" helperText="Paste the full handle if you want—we keep only the username." error={instapayHandle.length > 0 && !handleIsValid} inputProps={{ maxLength: 64, pattern: "[A-Za-z0-9]+" }} InputProps={{ endAdornment: <InputAdornment position="end" sx={{ alignSelf: "stretch", height: "auto", maxHeight: "none", ml: 1.25, pl: 1.25, borderInlineStart: "1px solid rgba(255,255,255,0.58)", pointerEvents: "none" }}><Box aria-hidden="true" sx={{ color: "rgba(255,255,255,0.9)", fontSize: { xs: "0.82rem", sm: "0.92rem" }, fontWeight: 900, lineHeight: 1, userSelect: "none", whiteSpace: "nowrap" }}>@instapay</Box></InputAdornment> }} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.72)" } }} FormHelperTextProps={{ sx: { color: "rgba(255,255,255,0.62)" } }} sx={fieldSx} /></Tooltip>
              </Box>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              <Button onClick={() => void verifyIdentity()} disabled={!emailIsValid || !handleIsValid || !suppliedToken || isChecking} variant="contained" sx={{ mt: 2.5, minHeight: 50, px: 3, color: "#000", bgcolor: "#ffe600", fontWeight: 1000, textTransform: "none", "&:hover": { bgcolor: "#ffef4d" } }}>{isChecking ? "Checking…" : "Continue"}</Button>
            </Box>
          )}

          {isUnlocked && !calendarName && (
            <Box sx={{ mt: { xs: 3, sm: 8 }, p: { xs: 2.5, sm: 4 }, border: "1px solid #fff", borderRadius: "24px 31px 25px 29px / 28px 25px 33px 26px" }}>
              <Typography component="h1" sx={{ fontSize: { xs: "2rem", sm: "3.2rem" }, fontWeight: 1000, lineHeight: 0.95, letterSpacing: "-0.065em" }}>Last thing.</Typography>
              <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.72)" }}>Enter the InstaPay account holder&apos;s full name exactly, letter by letter.</Typography>
              <TextField label="Full name in InstaPay" value={fullName} onChange={(event) => setFullName(event.target.value)} required fullWidth autoComplete="name" error={fullName.length > 0 && !fullNameIsValid} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.72)" } }} sx={{ ...fieldSx, mt: 3 }} />
              <Button onClick={() => setCalendarName(fullName.trim())} disabled={!fullNameIsValid} variant="contained" sx={{ mt: 2.5, minHeight: 50, px: 3, color: "#000", bgcolor: "#ffe600", fontWeight: 1000, textTransform: "none", "&:hover": { bgcolor: "#ffef4d" } }}>Choose a time</Button>
            </Box>
          )}

          {calendarName && (
            <>
              <Typography component="h1" sx={{ fontSize: { xs: "1.65rem", sm: "2.5rem" }, fontWeight: 1000, letterSpacing: "-0.055em" }}>Choose your time with Nairah.</Typography>
              <Alert severity="warning" sx={{ mt: 1.5, mb: 2, bgcolor: "rgba(255,230,0,0.11)", color: "#fff", border: "1px solid rgba(255,230,0,0.65)", "& .MuiAlert-icon": { color: "#ffe600" } }}>
                Confirm that Calendly shows the InstaPay account holder&apos;s exact name, the same email used in InstaPay{purchasedService ? <>, and the purchased service: <strong>{purchasedService}</strong></> : null}.
              </Alert>
              <Box component="iframe" src={calendlyUrl.toString()} title="Choose a Calendly time with Nairah" sx={{ display: "block", width: "100%", minHeight: { xs: "760px", sm: "820px" }, border: 0, borderRadius: "18px", bgcolor: "#fff" }} />
              <Button component="a" href={calendlyUrl.toString()} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewRounded />} sx={{ mt: 1.5, color: "#fff", textTransform: "none", fontWeight: 850 }}>Open Calendly in a new tab</Button>
            </>
          )}
        </Box>
      </Box>
    </>
  );
}
