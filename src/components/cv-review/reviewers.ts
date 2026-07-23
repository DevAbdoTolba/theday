export type ReviewerId = "abdo-tolba" | "omar-shawky" | "nairah";

export type ReviewerVisualTier = "standard" | "premium-gold";

export type BookingDestination =
  | {
      readonly status: "available";
      readonly url: string;
    }
  | {
      readonly status: "coming-soon";
      readonly url: null;
    };

export interface ReviewerProfile {
  readonly id: ReviewerId;
  readonly displayName: string;
  readonly initials: string;
  readonly portraitSrc: string | null;
  readonly reviewFocus: string;
  readonly visualTier: ReviewerVisualTier;
  readonly booking: BookingDestination;
}

const COMING_SOON: BookingDestination = {
  status: "coming-soon",
  url: null,
};

export function normalizeCalendlyUrl(candidate: unknown): BookingDestination {
  if (typeof candidate !== "string" || candidate.trim().length === 0) {
    return COMING_SOON;
  }

  try {
    const url = new URL(candidate.trim());
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const isAllowed =
      url.protocol === "https:" &&
      url.hostname === "calendly.com" &&
      url.username === "" &&
      url.password === "" &&
      url.port === "" &&
      url.search === "" &&
      url.hash === "" &&
      pathSegments.length >= 2;

    if (!isAllowed) {
      return COMING_SOON;
    }

    return {
      status: "available",
      url: url.toString(),
    };
  } catch {
    return COMING_SOON;
  }
}

export const CV_REVIEWERS = [
  {
    id: "abdo-tolba",
    displayName: "Abdo Tolba",
    initials: "AT",
    portraitSrc: null,
    reviewFocus: "Structure, recruiter-first clarity, and the details worth keeping.",
    visualTier: "standard",
    booking: normalizeCalendlyUrl(null),
  },
  {
    id: "omar-shawky",
    displayName: "Omar Shawky",
    initials: "OS",
    portraitSrc: null,
    reviewFocus: "Your story, your positioning, and whether every line earns its place.",
    visualTier: "standard",
    booking: normalizeCalendlyUrl(null),
  },
  {
    id: "nairah",
    displayName: "Nairah",
    initials: "N",
    portraitSrc: null,
    reviewFocus: "Wording, hierarchy, and the final polish that makes a CV feel confident.",
    visualTier: "premium-gold",
    booking: normalizeCalendlyUrl(null),
  },
] as const satisfies readonly ReviewerProfile[];
