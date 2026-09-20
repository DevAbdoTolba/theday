import React, { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { Alert, Box, Button, Typography } from "@mui/material";
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

export default function MeetReviewerPage({ reviewerName }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<PageStage>("services");
  const [selectedServiceId, setSelectedServiceId] = useState<NairahServiceId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const selectedService = useMemo(() => NAIRAH_SERVICES.find((service) => service.id === selectedServiceId) ?? null, [selectedServiceId]);
  const paymentReady = selectedService?.priceEgp !== null && NAIRAH_PAYMENT_CONFIG.paymentGuideImageSrc !== null && NAIRAH_PAYMENT_CONFIG.instapayQrImageSrc !== null && NAIRAH_PAYMENT_CONFIG.recipientLabel !== null;

  const goBack = () => {
    if (stage === "details") setStage("services");
    else if (stage === "guide") setStage("details");
    else if (stage === "qr") setStage("guide");
  };

  const submitPayment = async () => {
    if (!selectedService || !paymentReady) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/cv-payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serviceId: selectedService.id, paymentConfirmed: true }) });
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
            <Typography sx={{ maxWidth: "38rem", mb: { xs: 4, sm: 5 }, color: "rgba(255,255,255,0.72)", fontSize: { xs: "1rem", sm: "1.15rem" } }}>Three ways to make your professional story do its job.</Typography>
            <Box sx={{ display: "grid", gap: 1.5 }}>{NAIRAH_SERVICES.map((service) => <ServiceCard key={service.id} service={service} onChoose={() => { setSelectedServiceId(service.id); setStage("details"); setSubmitError(null); }} />)}</Box>
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
            <Box sx={{ mt: 3, overflow: "hidden", border: "1px solid rgba(255,255,255,0.75)", borderRadius: "24px 30px 25px 29px / 28px 25px 31px 24px", bgcolor: "rgba(255,255,255,0.045)" }}>
              {NAIRAH_PAYMENT_CONFIG.paymentGuideImageSrc ? <Box component="img" src={NAIRAH_PAYMENT_CONFIG.paymentGuideImageSrc} alt="How to send the InstaPay payment" sx={{ display: "block", width: "100%", height: "auto" }} /> : <Box sx={{ minHeight: { xs: 230, sm: 360 }, display: "grid", placeItems: "center", p: 3, textAlign: "center", color: "rgba(255,255,255,0.66)", border: "1px dashed rgba(255,255,255,0.38)" }}><Box><Typography sx={{ color: "#ffe600", fontSize: "0.76rem", fontWeight: 950, letterSpacing: "0.14em" }}>PAYMENT GUIDE IMAGE</Typography><Typography sx={{ mt: 1, fontWeight: 800 }}>Add your screenshot here.</Typography></Box></Box>}
            </Box>
            <Button onClick={() => setStage("qr")} endIcon={<ArrowForwardRounded />} variant="contained" sx={yellowButtonSx}>I understand — show the QR</Button>
          </Box>}

          {stage === "qr" && selectedService && <Box component="main" sx={{ animation: `${selectedServiceRise} 360ms cubic-bezier(0.16, 1, 0.3, 1)` }}>
            <Typography sx={{ color: "#ffe600", fontSize: "0.78rem", fontWeight: 950, letterSpacing: "0.13em" }}>STEP 2 OF 2 · {formatNairahServicePrice(selectedService.priceEgp)}</Typography>
            <Typography component="h1" sx={{ mt: 1, fontSize: { xs: "2.2rem", sm: "4rem" }, fontWeight: 1000, lineHeight: 0.9, letterSpacing: "-0.07em" }}>Scan. Pay. Done.</Typography>
            <Box sx={{ mt: 3, p: { xs: 2, sm: 3 }, border: "1px solid rgba(255,255,255,0.75)", borderRadius: "24px 30px 25px 29px / 28px 25px 31px 24px", bgcolor: "rgba(255,255,255,0.045)" }}>
              {NAIRAH_PAYMENT_CONFIG.instapayQrImageSrc ? <Box component="img" src={NAIRAH_PAYMENT_CONFIG.instapayQrImageSrc} alt="Instapay payment QR" sx={{ display: "block", width: { xs: 210, sm: 250 }, maxWidth: "100%", mx: "auto", p: 1, bgcolor: "#fff", borderRadius: 2 }} /> : <Box sx={{ minHeight: 200, display: "grid", placeItems: "center", textAlign: "center", color: "rgba(255,255,255,0.66)", border: "1px dashed rgba(255,255,255,0.46)", borderRadius: 2 }}><Box><QrCode2Rounded sx={{ fontSize: 72 }} /><Typography sx={{ mt: 1, fontWeight: 800 }}>Add the InstaPay QR here.</Typography></Box></Box>}
              {NAIRAH_PAYMENT_CONFIG.recipientLabel && <Typography sx={{ mt: 2, textAlign: "center", color: "rgba(255,255,255,0.78)", fontWeight: 750 }}>{NAIRAH_PAYMENT_CONFIG.recipientLabel}</Typography>}
            </Box>
            {!paymentReady && <Alert severity="info" sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", "& .MuiAlert-icon": { color: "#fff" } }}>Add the price, guide image, recipient, and QR in the payment config to open payments.</Alert>}
            {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
            <Button onClick={() => void submitPayment()} disabled={!paymentReady || isSubmitting} variant="contained" sx={{ ...yellowButtonSx, px: 3.5, minHeight: 54, "&.Mui-disabled": { bgcolor: "rgba(255,230,0,0.34)", color: "rgba(0,0,0,0.5)" } }}>{isSubmitting ? "Sending…" : "I made the payment"}</Button>
          </Box>}

          {stage === "complete" && <Box component="main" sx={{ minHeight: "75dvh", display: "grid", placeItems: "center", textAlign: "center", animation: `${selectedServiceRise} 420ms cubic-bezier(0.16, 1, 0.3, 1)` }}><Box sx={{ maxWidth: "28rem", p: { xs: 3, sm: 4 }, border: "1px solid #fff", borderRadius: "28px 36px 29px 34px / 33px 29px 37px 28px", bgcolor: "rgba(255,255,255,0.05)" }}><CheckCircleRounded sx={{ color: "#ffe600", fontSize: 56 }} /><Typography component="h1" sx={{ mt: 1.5, fontSize: { xs: "2.1rem", sm: "3.3rem" }, fontWeight: 1000, lineHeight: 0.9, letterSpacing: "-0.07em" }}>Payment request sent.</Typography><Typography sx={{ mt: 2, color: "rgba(255,255,255,0.76)", lineHeight: 1.55 }}>Nairah will check the transfer manually.</Typography></Box></Box>}
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
