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
    priceEgp: null,
  },
  {
    id: "cv-writing",
    title: "CV writing",
    summary: "May start with a consultation, then Nairah writes your CV with you.",
    priceEgp: null,
  },
  {
    id: "linkedin-optimization",
    title: "LinkedIn optimization",
    summary: "Get notes for your profile or share access for Nairah to edit it herself.",
    priceEgp: null,
  },
] as const satisfies readonly NairahService[];

export const NAIRAH_PAYMENT_CONFIG = {
  /** Add a real Instapay QR image under public/ and set its path here. */
  instapayQrImageSrc: null as string | null,
  /** Add the recipient name or payment handle shown next to the QR. */
  recipientLabel: null as string | null,
} as const;

export function formatNairahServicePrice(priceEgp: number | null): string {
  return priceEgp === null ? "Price coming soon" : `${priceEgp} EGP`;
}
