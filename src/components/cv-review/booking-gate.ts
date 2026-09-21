const LEGACY_BOOKING_GATE_NAMESPACE = "theday:nairah-booking:v1";
const BOOKING_GATE_NAMESPACE = "theday:nairah-booking:v2";

export interface BookingGateVerification {
  readonly valid: boolean;
  readonly serviceTitle: string | null;
}

export function normalizeBookingEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeInstapayHandle(value: string): string {
  return value.trim().toLowerCase();
}

export function sanitizeInstapayUsernameInput(value: string): string {
  return value
    .replace(/[^a-z0-9]/gi, "")
    .replace(/instapay/gi, "")
    .slice(0, 64);
}

export function isValidInstapayHandle(value: string): boolean {
  return /^[a-z0-9]+@instapay$/i.test(value.trim());
}

function toBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...Array.from(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function encodeText(value: string): string {
  return toBase64Url(new TextEncoder().encode(value));
}

function decodeText(value: string): string | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

async function digestPayload(payload: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );
  return toBase64Url(new Uint8Array(digest));
}

function bookingPayload(
  namespace: string,
  email: string,
  instapayHandle: string,
  serviceTitle?: string,
): string {
  return [
    namespace,
    normalizeBookingEmail(email),
    normalizeInstapayHandle(instapayHandle),
    ...(serviceTitle === undefined ? [] : [serviceTitle.trim()]),
  ].join("|");
}

export function readBookingGateServiceTitle(token: string): string | null {
  const [encodedService, digest, extra] = token.split(".");
  if (!encodedService || !digest || extra !== undefined) return null;
  const serviceTitle = decodeText(encodedService)?.trim() ?? "";
  return serviceTitle.length >= 1 && serviceTitle.length <= 180 ? serviceTitle : null;
}

export async function createBookingGateToken(
  email: string,
  instapayHandle: string,
  serviceTitle: string,
): Promise<string> {
  const normalizedServiceTitle = serviceTitle.trim();
  if (!normalizedServiceTitle || normalizedServiceTitle.length > 180) {
    throw new Error("A valid purchased service is required.");
  }
  const digest = await digestPayload(
    bookingPayload(BOOKING_GATE_NAMESPACE, email, instapayHandle, normalizedServiceTitle),
  );
  return `${encodeText(normalizedServiceTitle)}.${digest}`;
}

export async function verifyBookingGateToken(
  token: string,
  email: string,
  instapayHandle: string,
): Promise<BookingGateVerification> {
  const serviceTitle = readBookingGateServiceTitle(token);
  if (serviceTitle) {
    const expectedToken = await createBookingGateToken(email, instapayHandle, serviceTitle);
    return { valid: expectedToken === token, serviceTitle };
  }

  const legacyDigest = await digestPayload(
    bookingPayload(LEGACY_BOOKING_GATE_NAMESPACE, email, instapayHandle),
  );
  return { valid: legacyDigest === token, serviceTitle: null };
}
