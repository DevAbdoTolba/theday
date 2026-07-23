export type ReviewerId = "abdo-tolba" | "omar-shawky" | "nairah";

export interface BookingDestination {
  readonly status: "available";
  readonly url: string;
}

export interface ReviewerProfile {
  readonly id: ReviewerId;
  readonly displayName: string;
  readonly portraitSrc: string;
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
    portraitSrc: "https://picsum.photos/seed/abdo-tolba/900/1200",
    booking: PLACEHOLDER_DESTINATION,
  },
  {
    id: "omar-shawky",
    displayName: "Omar Shawky",
    portraitSrc: "https://picsum.photos/seed/omar-shawky/900/1200",
    booking: PLACEHOLDER_DESTINATION,
  },
  {
    id: "nairah",
    displayName: "Nairah",
    portraitSrc: "https://picsum.photos/seed/nairah/900/1200",
    booking: PLACEHOLDER_DESTINATION,
  },
] as const satisfies readonly ReviewerProfile[];
