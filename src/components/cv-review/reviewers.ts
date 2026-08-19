export type ReviewerId = "abdo-tolba" | "omar-shawky" | "nairah";
export type ReviewerVisualTier = "standard" | "premium-gold";

export interface BookingDestination {
  readonly status: "available";
  readonly url: string;
}

export interface ReviewerProfile {
  readonly id: ReviewerId;
  readonly displayName: string;
  readonly portraitSrc: string;
  readonly visualTier: ReviewerVisualTier;
  readonly booking: BookingDestination;
}

export function createBookingDestination(
  candidate: string,
): BookingDestination {
  const url = new URL(candidate);
  const isSafeExternalUrl =
    url.protocol === "https:" &&
    url.username === "" &&
    url.password === "" &&
    url.port === "" &&
    url.search === "" &&
    url.hash === "";

  if (!isSafeExternalUrl) {
    throw new TypeError("Reviewer booking destinations must be clean HTTPS URLs.");
  }

  return {
    status: "available",
    url: url.toString(),
  };
}

const PLACEHOLDER_DESTINATION = createBookingDestination(
  "https://example.com/",
);

export const CV_REVIEWERS = [
  {
    id: "abdo-tolba",
    displayName: "Abdo Tolba",
    portraitSrc: "/abdo-tolba.webp",
    visualTier: "standard",
    booking: PLACEHOLDER_DESTINATION,
  },
  {
    id: "omar-shawky",
    displayName: "Omar Shawky",
    portraitSrc: "/grad-cv-leaf.webp",
    visualTier: "standard",
    booking: PLACEHOLDER_DESTINATION,
  },
  {
    id: "nairah",
    displayName: "Nairah A.",
    portraitSrc: "/nairah.webp",
    visualTier: "premium-gold",
    booking: PLACEHOLDER_DESTINATION,
  },
] as const satisfies readonly ReviewerProfile[];
