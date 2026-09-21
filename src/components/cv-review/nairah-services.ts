export type NairahServiceId =
  | "cv-review"
  | "cv-writing"
  | "linkedin-optimization";

export interface NairahService {
  readonly id: NairahServiceId;
  readonly title: string;
  readonly summary: string;
  /** Set the final EGP amount before enabling payments. */
  readonly priceEgp: number | null;
}

export const NAIRAH_SERVICES = [
  {
    id: "cv-review",
    title: "CV reviewing — 30 min session feedback",
    summary: "A focused review with clear, practical feedback on your CV.",
    priceEgp: 700,
  },
  {
    id: "cv-writing",
    title: "CV writing",
    summary: "May start with a consultation, then Nairah writes your CV with you.",
    priceEgp: 1500,
  },
  {
    id: "linkedin-optimization",
    title: "LinkedIn optimization",
    summary: "Get notes for your profile or share access for Nairah to edit it herself.",
    priceEgp: 1000,
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
