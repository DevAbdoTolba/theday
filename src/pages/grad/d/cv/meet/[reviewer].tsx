import React, { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { Alert, Box, Button, Checkbox, FormControlLabel, TextField, Typography } from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import QrCode2Rounded from "@mui/icons-material/QrCode2Rounded";
import { keyframes } from "@mui/material/styles";
import {
  formatNairahServicePrice,
  NAIRAH_PAYMENT_CONFIG,
  NAIRAH_SERVICES,
  type NairahService,
  type NairahServiceId,
} from "../../../../../components/cv-review/nairah-services";
import { isValidInstapayHandle } from "../../../../../components/cv-review/booking-gate";
import CVSupportContact from "../../../../../components/cv-review/CVSupportContact";
import { CV_REVIEWERS } from "../../../../../components/cv-review/reviewers";

type PageStage = "services" | "details" | "guide" | "qr" | "complete";

const pageReveal = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const selectedServiceRise = keyframes`
  from { opacity: 0; transform: translateY(22px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

interface Props {
  readonly reviewerName: string;
}

const pageSx = {
  minHeight: "100dvh",
  bgcolor: "#000",
  color: "#fff",
  px: { xs: 1.5, sm: 3 },
  py: { xs: 1.5, sm: 3 },
  backgroundImage:
    "radial-gradient(circle at 82% 10%, rgba(255,255,255,0.10), transparent 22%), radial-gradient(circle at 12% 88%, rgba(255,210,79,0.11), transparent 28%)",
};

function ServiceCard({ service, onChoose }: { readonly service: NairahService; readonly onChoose: () => void }) {
  return (
    <Button onClick={onChoose} variant="outlined" sx={{ display: "block", width: "100%", p: { xs: 2.25, sm: 3 }, textAlign: "left", color: "#fff", borderColor: "rgba(255,255,255,0.72)", borderRadius: "25px 32px 24px 30px / 28px 27px 33px 26px", textTransform: "none", transition: "transform 260ms cubic-bezier(0.2, 0.82, 0.2, 1), background-color 200ms ease, border-color 200ms ease", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)", transform: "translateY(-4px)" }, "&:focus-visible": { outline: "3px solid #ffe600", outlineOffset: 4 } }}>
      <Typography component="span" display="block" sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" }, fontWeight: 950, lineHeight: 1.06, letterSpacing: "-0.045em" }}>{service.title}</Typography>
      <Typography component="span" display="block" sx={{ mt: 1, maxWidth: "48rem", color: "rgba(255,255,255,0.72)", fontSize: "0.94rem", lineHeight: 1.45 }}>{service.summary}</Typography>
    </Button>
  );
}

function cleanReturnPath(): string {
  if (typeof window === "undefined") return "/";
  const path = window.sessionStorage.getItem("cv-review-return-path");
  return path && path.startsWith("/") && !path.includes("/cv-review") ? path : "/";
}

const outlinedPanelSx = { p: { xs: 2.25, sm: 3.5 }, border: "1px solid #fff", borderRadius: "28px 36px 29px 34px / 33px 29px 37px 28px", bgcolor: "rgba(255,255,255,0.045)" };
const yellowButtonSx = { mt: 3, px: 3, minHeight: 52, color: "#000", bgcolor: "#ffe600", borderRadius: "12px 17px 11px 15px", fontSize: "1.05rem", fontWeight: 1000, textTransform: "none", "&:hover": { color: "#000", bgcolor: "#ffef4d" } };
const individualServices = NAIRAH_SERVICES.filter((service) => service.category === "service");
const serviceBundles = NAIRAH_SERVICES.filter((service) => service.category === "bundle");

function PaymentGuideConfirmation({ videoWatched, onConfirmed }: { readonly videoWatched: boolean; readonly onConfirmed: () => void }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Box sx={{ mt: 3, width: "min(100%, 22rem)" }}>
      <Typography sx={{ mb: 1, color: videoWatched ? "#ffe600" : "rgba(255,255,255,0.7)", fontSize: "0.82rem", fontWeight: 800 }}>
        {videoWatched ? "Video completed. Confirm below." : "Watch the full video to unlock confirmation."}
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={confirmed}
            disabled={!videoWatched}
            onChange={(event) => setConfirmed(event.target.checked)}
            inputProps={{ "aria-label": "I read and understand the payment guide" }}
            sx={{ color: "rgba(255,255,255,0.72)", "&.Mui-checked": { color: "#ffe600" }, "&.Mui-disabled": { color: "rgba(255,255,255,0.28)" } }}
          />
        }
        label={<Typography sx={{ color: confirmed ? "#ffe600" : "#fff", fontSize: { xs: "0.92rem", sm: "1rem" }, fontWeight: 850, lineHeight: 1.25 }}>I read and understand these steps.</Typography>}
        sx={{ width: "100%", minHeight: 58, m: 0, px: 1.1, py: 0.45, border: "1px solid rgba(255,255,255,0.78)", borderRadius: "13px 17px 12px 15px", bgcolor: confirmed ? "rgba(255,230,0,0.09)" : "rgba(255,255,255,0.045)", filter: videoWatched ? "none" : "blur(2.5px)", opacity: videoWatched ? 1 : 0.42, pointerEvents: videoWatched ? "auto" : "none", transition: "filter 280ms ease, opacity 280ms ease, background-color 180ms ease, border-color 180ms ease", "&:hover": { borderColor: "#fff", bgcolor: confirmed ? "rgba(255,230,0,0.12)" : "rgba(255,255,255,0.08)" } }}
      />
      <Button onClick={onConfirmed} disabled={!confirmed} variant="outlined" sx={{ mt: 1.2, width: "100%", minHeight: 48, color: "#fff", borderColor: "rgba(255,255,255,0.8)", borderRadius: "10px 14px 9px 12px", fontSize: "1rem", fontWeight: 950, textTransform: "none", opacity: confirmed ? 1 : 0, transform: confirmed ? "translateY(0)" : "translateY(10px)", pointerEvents: confirmed ? "auto" : "none", transition: "opacity 220ms ease, transform 260ms cubic-bezier(0.22, 1, 0.36, 1), background-color 160ms ease", "&:hover": { color: "#000", bgcolor: "#fff", borderColor: "#fff" } }}>Show QR code</Button>
    </Box>
  );
}

export default function MeetReviewerPage({ reviewerName }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<PageStage>("services");
  const [selectedServiceId, setSelectedServiceId] = useState<NairahServiceId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [instapayHandle, setInstapayHandle] = useState("");
  const [email, setEmail] = useState("");
  const [guideWatched, setGuideWatched] = useState(false);
  const guideVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const furthestGuideTimeRef = React.useRef(0);
  const selectedService = useMemo(() => NAIRAH_SERVICES.find((service) => service.id === selectedServiceId) ?? null, [selectedServiceId]);
  const paymentReady = selectedService?.priceEgp !== null && NAIRAH_PAYMENT_CONFIG.paymentGuideVideoSrc !== null && NAIRAH_PAYMENT_CONFIG.instapayQrImageSrc !== null && NAIRAH_PAYMENT_CONFIG.instapayPaymentUrl !== null && NAIRAH_PAYMENT_CONFIG.recipientLabel !== null;
  const instapayHandleIsValid = isValidInstapayHandle(instapayHandle);
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const goBack = () => {
    if (stage === "details") setStage("services");
    else if (stage === "guide") setStage("details");
    else if (stage === "qr") setStage("guide");
  };

  const submitPayment = async () => {
    if (!selectedService || !paymentReady || !instapayHandleIsValid || !emailIsValid) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/cv-payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instapayHandle: instapayHandle.trim(), email: email.trim(), serviceId: selectedService.id, paymentConfirmed: true }) });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not submit your payment confirmation.");
      }
      setStage("complete");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit your payment confirmation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head><title>CV services with {reviewerName} | TheDay</title><meta name="robots" content="noindex, nofollow" /></Head>
      <Box sx={pageSx}>
        <Box sx={{ width: "100%", maxWidth: "66rem", mx: "auto", animation: `${pageReveal} 420ms cubic-bezier(0.22, 1, 0.36, 1) both`, "@media (prefers-reduced-motion: reduce)": { animation: "none" } }}>
          {stage === "services" ? <Button onClick={() => void router.push(cleanReturnPath())} startIcon={<ArrowBackRounded />} sx={{ mb: 3, color: "#fff", textTransform: "none", fontWeight: 850, "&:hover": { bgcolor: "rgba(255,255,255,0.09)" } }}>Back to dashboard</Button> : stage !== "complete" ? <Button onClick={goBack} startIcon={<ArrowBackRounded />} sx={{ mb: 3, color: "#fff", textTransform: "none", fontWeight: 850, "&:hover": { bgcolor: "rgba(255,255,255,0.09)" } }}>Back</Button> : null}

          {stage === "services" && <Box component="main">
            <Typography sx={{ color: "#ffe600", fontSize: "0.76rem", fontWeight: 950, letterSpacing: "0.16em", textTransform: "uppercase" }}>Nairah A. · CV services</Typography>
            <Typography component="h1" sx={{ mt: 1, mb: 1.25, fontSize: { xs: "clamp(2.5rem, 12vw, 5.6rem)", sm: "clamp(4rem, 9vw, 7rem)" }, fontWeight: 1000, lineHeight: 0.86, letterSpacing: "-0.085em" }}>Pick your next move.</Typography>
            <Typography sx={{ maxWidth: "38rem", mb: { xs: 4, sm: 5 }, color: "rgba(255,255,255,0.72)", fontSize: { xs: "1rem", sm: "1.15rem" } }}>Choose one focused service, or handle your full professional profile with a bundle.</Typography>
            <Typography component="h2" sx={{ mb: 1.5, color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", fontWeight: 1000, letterSpacing: "0.16em", textTransform: "uppercase" }}>Services</Typography>
            <Box sx={{ display: "grid", gap: 1.5 }}>{individualServices.map((service) => <ServiceCard key={service.id} service={service} onChoose={() => { setSelectedServiceId(service.id); setGuideWatched(false); furthestGuideTimeRef.current = 0; setStage("details"); setSubmitError(null); }} />)}</Box>
            <Typography component="h2" sx={{ mt: { xs: 4, sm: 5 }, mb: 1.5, color: "#ffe600", fontSize: "0.78rem", fontWeight: 1000, letterSpacing: "0.16em", textTransform: "uppercase" }}>Bundles</Typography>
            <Box sx={{ display: "grid", gap: 1.5 }}>{serviceBundles.map((service) => <ServiceCard key={service.id} service={service} onChoose={() => { setSelectedServiceId(service.id); setGuideWatched(false); furthestGuideTimeRef.current = 0; setStage("details"); setSubmitError(null); }} />)}</Box>
          </Box>}

          {stage === "details" && selectedService && <Box component="main" sx={{ animation: `${selectedServiceRise} 360ms cubic-bezier(0.16, 1, 0.3, 1)` }}><Box sx={outlinedPanelSx}>
            <Typography sx={{ color: "#ffe600", fontSize: "0.8rem", fontWeight: 950, letterSpacing: "0.12em" }}>{formatNairahServicePrice(selectedService.priceEgp)}</Typography>
            <Typography component="h1" sx={{ mt: 1, fontSize: { xs: "2.2rem", sm: "4rem" }, fontWeight: 1000, lineHeight: 0.9, letterSpacing: "-0.07em" }}>{selectedService.title}</Typography>
            <Typography sx={{ mt: 2, maxWidth: "45rem", color: "rgba(255,255,255,0.76)", fontSize: { xs: "1rem", sm: "1.12rem" }, lineHeight: 1.6 }}>{selectedService.summary}</Typography>
            <Button onClick={() => setStage("guide")} endIcon={<ArrowForwardRounded />} variant="contained" sx={{ ...yellowButtonSx, mt: 3.5 }}>Continue to payment</Button>
          </Box></Box>}

          {stage === "guide" && selectedService && <Box component="main" sx={{ animation: `${selectedServiceRise} 360ms cubic-bezier(0.16, 1, 0.3, 1)` }}>
            <Typography sx={{ color: "#ffe600", fontSize: "0.78rem", fontWeight: 950, letterSpacing: "0.13em" }}>STEP 1 OF 2</Typography>
            <Typography component="h1" sx={{ mt: 1, fontSize: { xs: "2.2rem", sm: "4rem" }, fontWeight: 1000, lineHeight: 0.9, letterSpacing: "-0.07em" }}>Follow this first.</Typography>
            <Box role="note" sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, overflow: "hidden", border: "1px solid rgba(255,230,0,0.72)", borderRadius: "18px 23px 19px 21px", bgcolor: "rgba(255,230,0,0.075)" }}>
              <Box sx={{ p: { xs: 2, sm: 2.5 }, borderInlineEnd: { sm: "1px solid rgba(255,230,0,0.34)" }, borderBlockEnd: { xs: "1px solid rgba(255,230,0,0.34)", sm: 0 } }}>
                <Typography sx={{ color: "#ffe600", fontSize: "0.72rem", fontWeight: 1000, letterSpacing: "0.13em" }}>ENGLISH NOTE</Typography>
                <Typography sx={{ mt: 0.8, color: "#fff", fontSize: { xs: "0.94rem", sm: "1rem" }, fontWeight: 750, lineHeight: 1.5 }}>In the payment note, write only your own email address. Do not add any other words. Without the email, we may not match your payment and your money could be lost.</Typography>
              </Box>
              <Box lang="ar" dir="rtl" sx={{ p: { xs: 2, sm: 2.5 }, textAlign: "right" }}>
                <Typography sx={{ color: "#ffe600", fontSize: "0.72rem", fontWeight: 1000, letterSpacing: "0.08em" }}>ملاحظة بالعربي</Typography>
                <Typography sx={{ mt: 0.8, color: "#fff", fontSize: { xs: "0.98rem", sm: "1.04rem" }, fontWeight: 750, lineHeight: 1.65 }}>في التحويل، اكتب إيميلك الشخصي بس كملحوظة، من غير أي كلام زيادة. من غير الإيميل ده، مش هنقدر نطابق التحويل وممكن فلوسك تضيع.</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: "grid", placeItems: "center", overflow: "hidden", border: "1px solid rgba(255,255,255,0.75)", borderRadius: "24px 30px 25px 29px / 28px 25px 31px 24px", bgcolor: "#050505" }}>
              {NAIRAH_PAYMENT_CONFIG.paymentGuideVideoSrc ? <Box component="video" ref={guideVideoRef} controls playsInline preload="metadata" aria-label="Video showing how to add the email payment note" onTimeUpdate={(event) => { const video = event.currentTarget; if (!video.seeking && video.currentTime <= furthestGuideTimeRef.current + 1.25) furthestGuideTimeRef.current = Math.max(furthestGuideTimeRef.current, video.currentTime); }} onSeeking={(event) => { const video = event.currentTarget; if (!guideWatched && video.currentTime > furthestGuideTimeRef.current + 1) video.currentTime = furthestGuideTimeRef.current; }} onEnded={(event) => { const video = event.currentTarget; if (video.duration > 0 && furthestGuideTimeRef.current >= video.duration - 1) setGuideWatched(true); }} sx={{ display: "block", width: "min(100%, 26rem)", maxHeight: "72dvh", bgcolor: "#000" }}>{NAIRAH_PAYMENT_CONFIG.paymentGuideVideoWebmSrc && <source src={NAIRAH_PAYMENT_CONFIG.paymentGuideVideoWebmSrc} type="video/webm" />}<source src={NAIRAH_PAYMENT_CONFIG.paymentGuideVideoSrc} type="video/mp4" /></Box> : <Box sx={{ minHeight: { xs: 230, sm: 360 }, display: "grid", placeItems: "center", p: 3, textAlign: "center", color: "rgba(255,255,255,0.66)" }}><Typography sx={{ fontWeight: 800 }}>Payment guide video is not configured.</Typography></Box>}
            </Box>
            <PaymentGuideConfirmation videoWatched={guideWatched} onConfirmed={() => setStage("qr")} />
          </Box>}

          {stage === "qr" && selectedService && <Box component="main" sx={{ animation: `${selectedServiceRise} 360ms cubic-bezier(0.16, 1, 0.3, 1)` }}>
            <Typography sx={{ color: "rgba(255,255,255,0.66)", fontSize: "0.78rem", fontWeight: 950, letterSpacing: "0.13em" }}>STEP 2 OF 2 · {selectedService.title}</Typography>
            <Typography component="h1" sx={{ mt: 1, color: "#ffe600", fontSize: { xs: "clamp(3.3rem, 17vw, 5.4rem)", sm: "clamp(5rem, 10vw, 8rem)" }, fontWeight: 1000, lineHeight: 0.82, letterSpacing: "-0.085em" }}>{selectedService.priceEgp === null ? "Price unavailable" : `${selectedService.priceEgp.toLocaleString("en-US")} EGP`}</Typography>
            <Typography sx={{ mt: 1.5, color: "#fff", fontSize: { xs: "1.2rem", sm: "1.55rem" }, fontWeight: 900, letterSpacing: "-0.035em" }}>Scan the QR and pay this exact amount.</Typography>
            <Box sx={{ mt: 3, p: { xs: 2, sm: 3 }, border: "1px solid rgba(255,255,255,0.75)", borderRadius: "24px 30px 25px 29px / 28px 25px 31px 24px", bgcolor: "rgba(255,255,255,0.045)" }}>
              {NAIRAH_PAYMENT_CONFIG.instapayQrImageSrc ? <Box component="img" src={NAIRAH_PAYMENT_CONFIG.instapayQrImageSrc} alt="Instapay payment QR" sx={{ display: "block", width: { xs: 280, sm: 340 }, maxWidth: "100%", mx: "auto", p: 0.75, bgcolor: "#fff", borderRadius: 2.5, boxShadow: "0 0 0 1px rgba(255,255,255,0.9), 0 16px 50px rgba(255,230,0,0.14)" }} /> : <Box sx={{ minHeight: 200, display: "grid", placeItems: "center", textAlign: "center", color: "rgba(255,255,255,0.66)", border: "1px dashed rgba(255,255,255,0.46)", borderRadius: 2 }}><Box><QrCode2Rounded sx={{ fontSize: 72 }} /><Typography sx={{ mt: 1, fontWeight: 800 }}>Add the InstaPay QR here.</Typography></Box></Box>}
              {NAIRAH_PAYMENT_CONFIG.recipientLabel && <Typography sx={{ mt: 2, textAlign: "center", color: "rgba(255,255,255,0.78)", fontWeight: 750 }}>{NAIRAH_PAYMENT_CONFIG.recipientLabel}</Typography>}
              {NAIRAH_PAYMENT_CONFIG.instapayPaymentUrl && <Box sx={{ display: { xs: "block", sm: "none" }, mt: 2, textAlign: "center" }}><Typography sx={{ color: "rgba(255,255,255,0.68)", fontSize: "0.78rem", fontWeight: 750 }}>Pay directly on your phone</Typography><Typography component="a" href={NAIRAH_PAYMENT_CONFIG.instapayPaymentUrl} target="_blank" rel="noopener noreferrer" sx={{ display: "block", mt: 0.65, color: "#ffe600", fontSize: "0.88rem", fontWeight: 900, lineHeight: 1.35, overflowWrap: "anywhere", textUnderlineOffset: 3 }}>{NAIRAH_PAYMENT_CONFIG.instapayPaymentUrl}</Typography></Box>}
            </Box>
            <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <TextField label="Your InstaPay handle" value={instapayHandle} onChange={(event) => setInstapayHandle(event.target.value)} required fullWidth autoComplete="off" placeholder="name123@instapay" helperText="Letters and numbers only before @instapay." error={instapayHandle.length > 0 && !instapayHandleIsValid} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.72)" } }} FormHelperTextProps={{ sx: { color: "rgba(255,255,255,0.62)" } }} sx={{ "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.035)", "& fieldset": { borderColor: "rgba(255,255,255,0.58)" }, "&:hover fieldset": { borderColor: "#fff" } } }} />
              <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth autoComplete="email" helperText="Use the same email written in the transfer note." error={email.length > 0 && !emailIsValid} InputLabelProps={{ sx: { color: "rgba(255,255,255,0.72)" } }} FormHelperTextProps={{ sx: { color: "rgba(255,255,255,0.62)" } }} sx={{ "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.035)", "& fieldset": { borderColor: "rgba(255,255,255,0.58)" }, "&:hover fieldset": { borderColor: "#fff" } } }} />
            </Box>
            {!paymentReady && <Alert severity="info" sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", "& .MuiAlert-icon": { color: "#fff" } }}>Add the price, guide video, recipient, QR, and direct payment URL in the payment config to open payments.</Alert>}
            {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
            <Button onClick={() => void submitPayment()} disabled={!paymentReady || !instapayHandleIsValid || !emailIsValid || isSubmitting} variant="contained" sx={{ ...yellowButtonSx, px: 3.5, minHeight: 54, "&.Mui-disabled": { bgcolor: "rgba(255,230,0,0.34)", color: "rgba(0,0,0,0.5)" } }}>{isSubmitting ? "Recording confirmation…" : "I made the payment"}</Button>
            <CVSupportContact />
          </Box>}

          {stage === "complete" && <Box component="main" sx={{ minHeight: "75dvh", display: "grid", placeItems: "center", textAlign: "center", animation: `${selectedServiceRise} 420ms cubic-bezier(0.16, 1, 0.3, 1)` }}><Box sx={{ maxWidth: "34rem", p: { xs: 3, sm: 4 }, border: "1px solid #fff", borderRadius: "28px 36px 29px 34px / 33px 29px 37px 28px", bgcolor: "rgba(255,255,255,0.05)" }}><CheckCircleRounded sx={{ color: "#ffe600", fontSize: 56 }} /><Typography component="h1" sx={{ mt: 1.5, fontSize: { xs: "2.1rem", sm: "3.3rem" }, fontWeight: 1000, lineHeight: 0.9, letterSpacing: "-0.07em" }}>Watch your email.</Typography><Typography sx={{ mt: 2, color: "rgba(255,255,255,0.76)", lineHeight: 1.55 }}>After Nairah confirms the payment, the private scheduling link will be sent to <Box component="strong" sx={{ color: "#fff" }}>{email.trim()}</Box>.</Typography><CVSupportContact /></Box></Box>}
        </Box>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const reviewerId = ctx.params?.reviewer;
  if (typeof reviewerId !== "string") return { notFound: true };
  const reviewer = CV_REVIEWERS.find((entry) => entry.id === reviewerId);
  if (!reviewer) return { notFound: true };
  if (reviewer.booking.flow === "direct-calendly") return { redirect: { destination: reviewer.booking.url, permanent: false } };
  return { props: { reviewerName: reviewer.displayName } };
};
