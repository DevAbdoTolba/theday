export type NairahServiceId =
  | "cv-review"
  | "cv-review-linkedin-review"
  | "cv-writing"
  | "cv-writing-linkedin-optimization";

export type NairahServiceCategory = "service" | "bundle";

export interface NairahService {
  readonly id: NairahServiceId;
  readonly category: NairahServiceCategory;
  readonly title: string;
  readonly summary: string;
  /** Set the final EGP amount before enabling payments. */
  readonly priceEgp: number | null;
}

export const NAIRAH_SERVICES = [
  {
    id: "cv-review",
    category: "service",
    title: "CV review",
    summary: "A focused review with clear, practical feedback on your CV.",
    priceEgp: 700,
  },
  {
    id: "cv-review-linkedin-review",
    category: "bundle",
    title: "CV review + LinkedIn review",
    summary: "Practical feedback on both your CV and LinkedIn profile in one review.",
    priceEgp: 1000,
  },
  {
    id: "cv-writing",
    category: "service",
    title: "CV writing",
    summary: "A complete CV written around your experience, strengths, and target roles.",
    priceEgp: 1200,
  },
  {
    id: "cv-writing-linkedin-optimization",
    category: "bundle",
    title: "CV writing + LinkedIn optimization",
    summary: "A complete CV plus a LinkedIn profile optimized to tell the same strong story.",
    priceEgp: 1500,
  },
] as const satisfies readonly NairahService[];

export const NAIRAH_PAYMENT_CONFIG = {
  /** Step 1 video showing how to add the email-only payment note. */
  paymentGuideVideoWebmSrc: "/cv-review/nairah-payment-guide.webm" as string | null,
  paymentGuideVideoSrc: "/cv-review/nairah-payment-guide.mp4" as string | null,
  /** InstaPay QR and phone-friendly direct payment destination. */
  instapayQrImageSrc: "/cv-review/nairah-instapay-qr.jpg" as string | null,
  instapayPaymentUrl: "https://ipn.eg/S/nairahatem/instapay/4i0HhZ" as string | null,
  recipientLabel: "nairahatem@instapay" as string | null,
} as const;

export function formatNairahServicePrice(priceEgp: number | null): string {
  return priceEgp === null ? "PRICE — SET IN CONFIG" : `PRICE — ${priceEgp} EGP`;
}
