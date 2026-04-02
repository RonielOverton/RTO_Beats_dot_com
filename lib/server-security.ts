import "server-only";
import type { NextRequest } from "next/server";

const STORE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SANITY_ASSET_HOSTS = new Set(["cdn.sanity.io"]);
const isProduction = process.env.NODE_ENV === "production";

export function isValidStoreSlug(value: string): boolean {
  return STORE_SLUG_PATTERN.test(value);
}

export function parseQuantity(value: unknown, { min = 1, max = 10 } = {}): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  if (value < min || value > max) {
    return null;
  }

  return value;
}

export function getServerBaseUrl(): URL {
  const explicit = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_BASE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const fallback = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";
  const raw = explicit ?? (vercel ? `https://${vercel}` : fallback);

  if (!raw) {
    throw new Error("Missing SITE_URL or NEXT_PUBLIC_BASE_URL for server-side URL generation");
  }

  const parsed = new URL(raw);

  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
    throw new Error("Production base URL must use HTTPS");
  }

  return parsed;
}

export function hasAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    const allowedOrigins = new Set<string>([req.nextUrl.origin, getServerBaseUrl().origin]);
    return allowedOrigins.has(origin);
  } catch {
    return false;
  }
}

export function isJsonRequest(req: NextRequest): boolean {
  const contentType = req.headers.get("content-type") ?? "";
  return contentType.toLowerCase().includes("application/json");
}

export function isAllowedSanityAssetUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && SANITY_ASSET_HOSTS.has(parsed.hostname) && /^\/(images|files)\//.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function toPublicErrorMessage(error: unknown, fallback = "Internal server error"): string {
  if (isProduction) {
    return fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}