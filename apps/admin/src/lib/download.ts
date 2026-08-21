"use client";

import { api } from "@cbms/api-client";

/** Escapes a value for CSV. */
function esc(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
): string {
  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

export function downloadText(text: string, filename: string, mime = "text/plain;charset=utf-8;") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
) {
  downloadText(toCsv(headers, rows), filename, "text/csv;charset=utf-8;");
}

/**
 * Streams a server-rendered CSV (which needs the bearer token) into a Blob download.
 * `window.open` cannot be used because the export endpoints require Authorization.
 */
export async function downloadFromApi(path: string, filename: string, mime = "text/csv;charset=utf-8;") {
  const res = await api<Response>(path, { raw: true });
  if (!res.ok) {
    let message = `Export failed (${res.status}).`;
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      /* keep the default message */
    }
    throw new Error(message);
  }
  downloadText(await res.text(), filename, mime);
}
