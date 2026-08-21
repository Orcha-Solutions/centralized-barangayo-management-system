import type { CSSProperties } from "react";

export const DEFAULT_PRIMARY = "#0A2463";
export const DEFAULT_ACCENT = "#FDB913";

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Only ever let a hex colour out of the API payload and into a `style`
 * attribute — an arbitrary string there would be a CSS-injection vector.
 */
export function safeColor(value: string | null | undefined, fallback: string): string {
  if (typeof value === "string" && HEX.test(value.trim())) return value.trim();
  return fallback;
}

/** Per-barangay theme, exposed to CSS as custom properties. */
export function brandVars(
  primary: string | null | undefined,
  accent: string | null | undefined,
): CSSProperties {
  return {
    "--brand": safeColor(primary, DEFAULT_PRIMARY),
    "--brand-accent": safeColor(accent, DEFAULT_ACCENT),
  } as CSSProperties;
}

/** Normalises a user-typed verification code for the API. */
export function normalizeCode(raw: string): string {
  return raw.trim().replace(/[\s-]+/g, "").toUpperCase();
}

/** "peace_order" -> "Peace & order"-ish label for concern/sector slugs. */
export function humanize(slug: string | null | undefined): string {
  if (!slug) return "Unspecified";
  const t = slug.replace(/[_-]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
