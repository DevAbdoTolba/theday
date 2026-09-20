import React, { useMemo, useState } from "react";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import QrCode2Rounded from "@mui/icons-material/QrCode2Rounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import { keyframes } from "@mui/material/styles";
import {
  formatNairahServicePrice,
  NAIRAH_PAYMENT_CONFIG,
  NAIRAH_SERVICES,
  type NairahService,
  type NairahServiceId,
} from "../../../../../components/cv-review/nairah-services";
import { CV_REVIEWERS } from "../../../../../components/cv-review/reviewers";

type PageStage = "services" | "details" | "payment" | "complete";

const pageReveal = keyframes`
  from { opacity: 0; transform: translateY(18px); }
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

function ServiceCard({
  service,
  onChoose,
}: {
  readonly service: NairahService;
  readonly onChoose: () => void;
}) {
  return (
    <Button
      onClick={onChoose}
      variant="outlined"
      sx={{
        display: "block",
        width: "100%",
        p: { xs: 2.25, sm: 3 },
        textAlign: "left",
        color: "#fff",
        borderColor: "rgba(255,255,255,0.72)",
        borderRadius: "25px 32px 24px 30px / 28px 27px 33px 26px",
        textTransform: "none",
        transition:
          "transform 260ms cubic-bezier(0.2, 0.82, 0.2, 1), background-color 200ms ease, border-color 200ms ease",
        "&:hover": {
          borderColor: "#fff",
          bgcolor: "rgba(255,255,255,0.08)",
          transform: "translateY(-4px)",
        },
        "&:focus-visible": {
          outline: "3px solid #ffe600",
          outlineOffset: 4,
        },
      }}
    >
      <Typography component="span" display="block" sx={{ fontSize: "0.76rem", color: "#ffe600", fontWeight: 900, letterSpacing: "0.12em" }}>
        {formatNairahServicePrice(service.priceEgp)}
      </Typography>
      <Typography component="span" display="block" sx={{ mt: 0.8, fontSize: { xs: "1.2rem", sm: "1.5rem" }, fontWeight: 950, lineHeight: 1.06, letterSpacing: "-0.045em" }}>
        {service.title}
      </Typography>
      <Typography component="span" display="block" sx={{ mt: 1, maxWidth: "48rem", color: "rgba(255,255,255,0.72)", fontSize: "0.94rem", lineHeight: 1.45 }}>
        {service.summary}
      </Typography>
    </Button>
  );
}

export default function MeetReviewerPage({ reviewerName }: Props) {
  const [stage, setStage] = useState<PageStage>("services");
  const [selectedServiceId, setSelectedServiceId] = useState<NairahServiceId | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [understoodPaymentNote, setUnderstoodPaymentNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => NAIRAH_SERVICES.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId],
  );
  const paymentReady =
    selectedService?.priceEgp !== null &&
    NAIRAH_PAYMENT_CONFIG.instapayQrImageSrc !== null &&
    NAIRAH_PAYMENT_CONFIG.recipientLabel !== null;

  const chooseService = (serviceId: NairahServiceId) => {
    setSelectedServiceId(serviceId);
    setStage("details");
    setSubmitError(null);
  };

  const goBack = () => {
    if (stage === "payment") {
      setStage("details");
      return;
    }
    setStage("services");
  };

  const submitPayment = async () => {
    if (!selectedService || !paymentReady || !understoodPaymentNote) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("/api/cv-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          serviceId: selectedService.id,
          paymentNoteConfirmed: true,
        }),
      });
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
      <Head>
        <title>CV services with {reviewerName} | TheDay</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Box sx={pageSx}>
        <Box sx={{ width: "100%", maxWidth: "66rem", mx: "auto", animation: `${pageReveal} 460ms cubic-bezier(0.16, 1, 0.3, 1)` }}>
          {stage !== "services" && stage !== "complete" && (
            <Button
              onClick={goBack}
              startIcon={<ArrowBackRounded />}
              sx={{ mb: 3, color: "#fff", textTransform: "none", fontWeight: 850, "&:hover": { bgcolor: "rgba(255,255,255,0.09)" } }}
            >
              Back
            </Button>
          )}

          {stage === "services" && (
            <Box component="main">
              <Typography sx={{ color: "#ffe600", fontSize: "0.76rem", fontWeight: 950, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Nairah A. · CV services
              </Typography>
              <Typography component="h1" sx={{ mt: 1, mb: 1.25, fontSize: { xs: "clamp(2.5rem, 12vw, 5.6rem)", sm: "clamp(4rem, 9vw, 7rem)" }, fontWeight: 1000, lineHeight: 0.86, letterSpacing: "-0.085em" }}>
                Pick your next move.
              </Typography>
              <Typography sx={{ maxWidth: "38rem", mb: { xs: 4, sm: 5 }, color: "rgba(255,255,255,0.72)", fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                Three ways to make your professional story do its job.
              </Typography>
              <Box sx={{ display: "grid", gap: 1.5 }}>
                {NAIRAH_SERVICES.map((service) => (
                  <ServiceCard key={service.id} service={service} onChoose={() => chooseService(service.id)} />
                ))}
              </Box>
            </Box>
          )}

          {stage === "details" && selectedService && (
            <Box component="main" sx={{ animation: `${selectedServiceRise} 360ms cubic-bezier(0.16, 1, 0.3, 1)` }}>
              <Box sx={{ p: { xs: 2.25, sm: 3.5 }, border: "1px solid #fff", borderRadius: "28px 36px 29px 34px / 33px 29px 37px 28px", bgcolor: "rgba(255,255,255,0.045)" }}>
                <Typography sx={{ color: "#ffe600", fontSize: "0.8rem", fontWeight: 950, letterSpacing: "0.12em" }}>
                  {formatNairahServicePrice(selectedService.priceEgp)}
                </Typography>
                <Typography component="h1" sx={{ mt: 1, fontSize: { xs: "2.2rem", sm: "4rem" }, fontWeight: 1000, lineHeight: 0.9, letterSpacing: "-0.07em" }}>
                  {selectedService.title}
                </Typography>
                <Typography sx={{ mt: 2, maxWidth: "45rem", color: "rgba(255,255,255,0.76)", fontSize: { xs: "1rem", sm: "1.12rem" }, lineHeight: 1.6 }}>
                  {selectedService.summary}
                </Typography>
                <Typography sx={{ mt: 2.5, color: "rgba(255,255,255,0.62)", fontSize: "0.94rem" }}>
                  Your request is checked manually after payment. Nairah will send the Calendly link to your email once it is confirmed.
                </Typography>
                <Button
                  onClick={() => setStage("payment")}
                  endIcon={<ArrowForwardRounded />}
                  variant="contained"
                  sx={{ mt: 3.5, px: 3, minHeight: 52, color: "#000", bgcolor: "#ffe600", borderRadius: "12px 17px 11px 15px", fontSize: "1.05rem", fontWeight: 1000, textTransform: "none", "&:hover": { color: "#000", bgcolor: "#ffef4d" } }}
                >
                  Continue to payment
                </Button>
              </Box>
            </Box>
          )}

          {stage === "payment" && selectedService && (
            <Box component="main" sx={{ animation: `${selectedServiceRise} 360ms cubic-bezier(0.16, 1, 0.3, 1)` }}>
              <Typography sx={{ color: "#ffe600", fontSize: "0.8rem", fontWeight: 950, letterSpacing: "0.13em" }}>
                {selectedService.title} · {formatNairahServicePrice(selectedService.priceEgp)}
              </Typography>
              <Typography component="h1" sx={{ mt: 1, fontSize: { xs: "2.2rem", sm: "4rem" }, fontWeight: 1000, lineHeight: 0.9, letterSpacing: "-0.07em" }}>
                Pay carefully.
              </Typography>

              <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
                <Alert icon={<WarningAmberRounded />} severity="warning" sx={{ bgcolor: "rgba(255,184,0,0.12)", color: "#fff", border: "1px solid rgba(255,230,0,0.52)", "& .MuiAlert-icon": { color: "#ffe600" } }}>
                  Your email must be written exactly in the InstaPay transfer message. Without it, Nairah cannot safely match your payment.
                </Alert>

                <Box sx={{ p: { xs: 2, sm: 3 }, border: "1px solid rgba(255,255,255,0.75)", borderRadius: "24px 30px 25px 29px / 28px 25px 31px 24px", bgcolor: "rgba(255,255,255,0.045)" }}>
                  <Typography sx={{ color: "#ffe600", fontWeight: 950, letterSpacing: "0.1em", fontSize: "0.78rem" }}>STEP 1 · TRANSFER NOTE</Typography>
                  <Typography sx={{ mt: 1, fontWeight: 900, fontSize: { xs: "1.3rem", sm: "1.65rem" }, letterSpacing: "-0.04em" }}>Put this email in the payment message.</Typography>
                  <Box sx={{ mt: 2, p: 2, border: "1px dashed rgba(255,230,0,0.86)", borderRadius: 2, bgcolor: "rgba(0,0,0,0.55)" }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.76rem", fontWeight: 800, letterSpacing: "0.1em" }}>INSTAPAY TRANSFER MESSAGE</Typography>
                    <Typography sx={{ mt: 0.65, color: "#ffe600", fontSize: { xs: "1.15rem", sm: "1.5rem" }, fontWeight: 1000, overflowWrap: "anywhere" }}>{email || "your@email.com"}</Typography>
                  </Box>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 }, border: "1px solid rgba(255,255,255,0.75)", borderRadius: "24px 30px 25px 29px / 28px 25px 31px 24px", bgcolor: "rgba(255,255,255,0.045)" }}>
                  <Typography sx={{ color: "#ffe600", fontWeight: 950, letterSpacing: "0.1em", fontSize: "0.78rem" }}>STEP 2 · INSTAPAY QR</Typography>
                  {NAIRAH_PAYMENT_CONFIG.instapayQrImageSrc ? (
                    <Box component="img" src={NAIRAH_PAYMENT_CONFIG.instapayQrImageSrc} alt="Instapay payment QR" sx={{ display: "block", width: { xs: 210, sm: 250 }, maxWidth: "100%", mt: 2, p: 1, bgcolor: "#fff", borderRadius: 2 }} />
                  ) : (
                    <Box sx={{ mt: 2, minHeight: 190, display: "grid", placeItems: "center", textAlign: "center", border: "1px dashed rgba(255,255,255,0.46)", borderRadius: 2, color: "rgba(255,255,255,0.66)" }}>
                      <Box><QrCode2Rounded sx={{ fontSize: 72 }} /><Typography sx={{ mt: 1, fontWeight: 800 }}>Instapay QR will appear here when configured.</Typography></Box>
                    </Box>
                  )}
                  <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.7)" }}>
                    {NAIRAH_PAYMENT_CONFIG.recipientLabel ?? "The recipient details will appear with the real QR."}
                  </Typography>
                </Box>

                <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
                  <TextField label="Your full name" value={name} onChange={(event) => setName(event.target.value)} required fullWidth InputLabelProps={{ sx: { color: "rgba(255,255,255,0.72)" } }} sx={{ "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.58)" }, "&:hover fieldset": { borderColor: "#fff" } } }} />
                  <TextField label="Your email" type="email" value={email} onChange={(event) => setEmail(event.target.value.trim())} required fullWidth InputLabelProps={{ sx: { color: "rgba(255,255,255,0.72)" } }} sx={{ "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.58)" }, "&:hover fieldset": { borderColor: "#fff" } } }} />
                </Box>

                <FormControlLabel
                  control={<Checkbox checked={understoodPaymentNote} onChange={(event) => setUnderstoodPaymentNote(event.target.checked)} sx={{ color: "#ffe600", "&.Mui-checked": { color: "#ffe600" } }} />}
                  label="I understand that I must write this exact email in the InstaPay transfer message."
                  sx={{ color: "rgba(255,255,255,0.9)", alignItems: "flex-start", m: 0 }}
                />

                {!paymentReady && (
                  <Alert severity="info" sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", "& .MuiAlert-icon": { color: "#fff" } }}>
                    Payment is not open yet. Nairah needs to set the three prices and add the real InstaPay QR first.
                  </Alert>
                )}
                {submitError && <Alert severity="error">{submitError}</Alert>}
                <Button
                  onClick={() => void submitPayment()}
                  disabled={!paymentReady || !name.trim() || !email || !understoodPaymentNote || isSubmitting}
                  variant="contained"
                  sx={{ justifySelf: "start", px: 3.5, minHeight: 54, color: "#000", bgcolor: "#ffe600", borderRadius: "12px 17px 11px 15px", fontSize: "1.05rem", fontWeight: 1000, textTransform: "none", "&:hover": { color: "#000", bgcolor: "#ffef4d" }, "&.Mui-disabled": { bgcolor: "rgba(255,230,0,0.34)", color: "rgba(0,0,0,0.5)" } }}
                >
                  {isSubmitting ? "Sending…" : "I made the payment"}
                </Button>
              </Box>
            </Box>
          )}

          {stage === "complete" && (
            <Box component="main" sx={{ minHeight: "75dvh", display: "grid", placeItems: "center", textAlign: "center", animation: `${selectedServiceRise} 420ms cubic-bezier(0.16, 1, 0.3, 1)` }}>
              <Box sx={{ maxWidth: "28rem", p: { xs: 3, sm: 4 }, border: "1px solid #fff", borderRadius: "28px 36px 29px 34px / 33px 29px 37px 28px", bgcolor: "rgba(255,255,255,0.05)" }}>
                <CheckCircleRounded sx={{ color: "#ffe600", fontSize: 56 }} />
                <Typography component="h1" sx={{ mt: 1.5, fontSize: { xs: "2.1rem", sm: "3.3rem" }, fontWeight: 1000, lineHeight: 0.9, letterSpacing: "-0.07em" }}>Thanks — monitor your email.</Typography>
                <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.76)", lineHeight: 1.55 }}>After Nairah confirms the payment, she will send your Calendly link manually.</Typography>
                <Alert severity="info" sx={{ mt: 2.5, textAlign: "left", bgcolor: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", "& .MuiAlert-icon": { color: "#ffe600" } }}>
                  When you schedule, type the InstaPay account holder&apos;s name letter by letter in the Calendly notes.
                </Alert>
              </Box>
            </Box>
          )}
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

  if (reviewer.booking.flow === "direct-calendly") {
    return {
      redirect: {
        destination: reviewer.booking.url,
        permanent: false,
      },
    };
  }

  return { props: { reviewerName: reviewer.displayName } };
};
