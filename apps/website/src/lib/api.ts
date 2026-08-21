import type {
  ConcernMap,
  PublicBarangayList,
  PublicBarangaySite,
  VerifyHit,
  VerifyResult,
} from "./types";

/**
 * Base URL of the CBMS API.
 *
 * NOTE: we deliberately do NOT import `API_URL` from `@cbms/api-client` — that
 * module is marked `"use client"`, so a React Server Component cannot read a
 * plain value out of it. `NEXT_PUBLIC_API_URL` is the same env var the client
 * package reads, so behaviour is identical.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/**
 * Fetch a public endpoint. Never throws — every page renders a graceful state
 * when the API is down, so `next build` never depends on a running API.
 * Always called from inside a component body, never at module scope.
 */
async function getPublic<T>(path: string): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message:
        err instanceof Error
          ? `Could not reach the CBMS API at ${API_URL} (${err.message}).`
          : `Could not reach the CBMS API at ${API_URL}.`,
    };
  }

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : null) ?? `Request failed (${res.status}).`;
    return { ok: false, status: res.status, message };
  }

  return { ok: true, data: body as T };
}

/** GET /public/barangays */
export function fetchBarangays(): Promise<ApiResult<PublicBarangayList>> {
  return getPublic<PublicBarangayList>("/public/barangays");
}

/** GET /public/barangay/:psgc */
export function fetchBarangaySite(psgc: string): Promise<ApiResult<PublicBarangaySite>> {
  return getPublic<PublicBarangaySite>(`/public/barangay/${encodeURIComponent(psgc)}`);
}

/** GET /public/barangay/:psgc/concerns-map */
export function fetchConcernsMap(psgc: string): Promise<ApiResult<ConcernMap>> {
  return getPublic<ConcernMap>(`/public/barangay/${encodeURIComponent(psgc)}/concerns-map`);
}

/**
 * GET /verify/:code — a 404 here is a meaningful answer ("not a valid
 * certificate"), not a failure, so it is modelled separately from an outage.
 */
export async function fetchVerification(code: string): Promise<VerifyResult> {
  const res = await getPublic<VerifyHit>(`/verify/${encodeURIComponent(code)}`);
  if (res.ok) return { kind: "hit", data: res.data };
  if (res.status === 404) return { kind: "miss", message: res.message };
  if (res.status === 0) return { kind: "unavailable", message: res.message };
  return { kind: "miss", message: res.message };
}
