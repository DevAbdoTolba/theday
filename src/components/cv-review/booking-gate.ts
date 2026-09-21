const BOOKING_GATE_NAMESPACE = "theday:nairah-booking:v1";

export function normalizeBookingEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeInstapayHandle(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidInstapayHandle(value: string): boolean {
  return /^[a-z]+@instapay$/i.test(value.trim());
}

export async function createBookingGateToken(
  email: string,
  instapayHandle: string,
): Promise<string> {
  const payload = [
    BOOKING_GATE_NAMESPACE,
    normalizeBookingEmail(email),
    normalizeInstapayHandle(instapayHandle),
  ].join("|");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(payload),
  );
  const bytes = String.fromCharCode(...Array.from(new Uint8Array(digest)));
  return btoa(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
