"use client";

import * as React from "react";
import { get, qs, ApiError } from "@cbms/api-client";
import type { Paged, TxnRow } from "./types";

/**
 * GET /wallet/transactions filters on a single `type`, so "all CICO" means
 * fetching cash_out and cash_in separately and merging newest-first.
 * The endpoint is barangay-wide; callers narrow to their own outlet with
 * `belongsToOutlet`.
 */
export function useOutletTxns(types: readonly string[], limit: number) {
  const [rows, setRows] = React.useState<TxnRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nonce, setNonce] = React.useState(0);

  const typeKey = types.join(",");
  const pageSize = Math.min(200, Math.max(10, limit));

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all(
      typeKey
        .split(",")
        .map((type) =>
          get<Paged<TxnRow>>(`/wallet/transactions${qs({ type, pageSize })}`),
        ),
    )
      .then((pages) => {
        if (cancelled) return;
        const merged = pages
          .flatMap((p) => p.items)
          .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        setRows(merged);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(
          e instanceof ApiError
            ? e.message
            : "Cannot reach the CBMS API. Check that it is running on port 4000.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [typeKey, pageSize, nonce]);

  return { rows, loading, error, reload: () => setNonce((n) => n + 1) };
}

/** True when a transaction belongs to the given outlet (by agent id or wallet). */
export function belongsToOutlet(
  t: TxnRow,
  outlet: { agentId: string | null; walletId: string } | null,
): boolean {
  if (!outlet) return false;
  if (outlet.agentId && t.agentId === outlet.agentId) return true;
  return t.fromWalletId === outlet.walletId || t.toWalletId === outlet.walletId;
}

/**
 * What a CICO transaction does to the outlet, from the agent's side of the
 * counter. Direction follows the transaction TYPE, which is the semantic
 * source of truth:
 *   cash_out — the resident withdraws: the agent hands over physical notes and
 *              receives e-money, so e-float rises and the drawer falls.
 *   cash_in  — the resident deposits: the agent takes physical notes and sends
 *              e-money, so the drawer rises and e-float falls.
 */
export interface TxnEffect {
  label: string;
  cashSign: "+" | "-";
  floatSign: "+" | "-";
  tone: "gold" | "green";
}

export function txnEffect(type: string): TxnEffect | null {
  if (type === "cash_out") {
    return { label: "Cash out", cashSign: "-", floatSign: "+", tone: "gold" };
  }
  if (type === "cash_in") {
    return { label: "Cash in", cashSign: "+", floatSign: "-", tone: "green" };
  }
  return null;
}

export function sumCentavos(rows: TxnRow[]): number {
  return rows.reduce((s, r) => s + Number(r.amountCentavos), 0);
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}
