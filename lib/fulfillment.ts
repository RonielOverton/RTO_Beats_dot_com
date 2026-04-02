import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const DOWNLOAD_TICKET_VERSION = "v1";

interface DownloadTicketPayload {
  sessionId: string;
  slug: string;
  expiresAt: number;
}

function getFulfillmentSecret() {
  const secret =
    process.env.DIGITAL_FULFILLMENT_SECRET ??
    process.env.STRIPE_WEBHOOK_SECRET ??
    process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    throw new Error(
      "Missing DIGITAL_FULFILLMENT_SECRET. Set it in production to sign secure download tickets."
    );
  }

  return secret;
}

function signEncodedPayload(encodedPayload: string) {
  return createHmac("sha256", getFulfillmentSecret())
    .update(`${DOWNLOAD_TICKET_VERSION}.${encodedPayload}`)
    .digest("base64url");
}

export function createDownloadTicket(payload: DownloadTicketPayload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signEncodedPayload(encodedPayload);
  return `${DOWNLOAD_TICKET_VERSION}.${encodedPayload}.${signature}`;
}

export function verifyDownloadTicket(ticket: string): DownloadTicketPayload {
  const [version, encodedPayload, signature] = ticket.split(".");

  if (!version || !encodedPayload || !signature || version !== DOWNLOAD_TICKET_VERSION) {
    throw new Error("Malformed download ticket");
  }

  const expectedSignature = signEncodedPayload(encodedPayload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    throw new Error("Invalid download ticket signature");
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as DownloadTicketPayload;

  if (!payload.sessionId || !payload.slug || typeof payload.expiresAt !== "number") {
    throw new Error("Invalid download ticket payload");
  }

  if (Date.now() > payload.expiresAt) {
    throw new Error("Download ticket has expired");
  }

  return payload;
}

export function sanitizeDownloadFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]+/g, "-");
}