"use client";

import * as React from "react";

/**
 * ---------------------------------------------------------------------------
 * Physical cash drawer ("till") tracking.
 * ---------------------------------------------------------------------------
 * The CBMS API stores the authoritative figure on `Agent.cashOnHandCentavos`,
 * but no read endpoint exposes it: GET /wallets only `select`s
 * `agent: { outletName }`, and there is no GET /agents. The only server signal
 * we get is `lowFloatAlert` on the POST /wallet/cash-out response.
 *
 * So the drawer count lives on the device: the agent declares an opening count
 * (which is what outlet staff physically do at the start of a shift) and every
 * cash-out performed in this app debits it, mirroring the server-side
 * `cashOnHandCentavos` decrement. Whenever the server sends `lowFloatAlert`,
 * we clamp the local figure down to the threshold so the two never disagree in
 * the dangerous direction.
 *
 * Everything shown from this module is labelled in the UI as a local count.
 */

/** Matches the `Agent.floatAlertThreshold` default in the Prisma schema: ₱5,000. */
export const FLOAT_ALERT_THRESHOLD_CENTAVOS = 500_000;

/** Used until the agent counts the drawer, so the demo is usable on first run. */
export const DEFAULT_OPENING_CENTAVOS = 2_000_000; // ₱20,000

export type TillMovementKind = "opening" | "rebalance_in" | "rebalance_out" | "cash_out" | "cash_in";

export interface TillMovement {
  kind: TillMovementKind;
  amountCentavos: number;
  balanceAfterCentavos: number;
  note?: string;
  at: string;
}

export interface TillState {
  centavos: number;
  /** False while we are still using DEFAULT_OPENING_CENTAVOS. */
  declared: boolean;
  updatedAt: string | null;
  log: TillMovement[];
}

const EMPTY: TillState = {
  centavos: DEFAULT_OPENING_CENTAVOS,
  declared: false,
  updatedAt: null,
  log: [],
};

const key = (walletId: string) => `cbms.agent.till.${walletId}`;

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}

export function readTill(walletId: string): TillState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(key(walletId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<TillState>;
    return {
      centavos: Number.isFinite(parsed.centavos) ? Number(parsed.centavos) : EMPTY.centavos,
      declared: parsed.declared === true,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
      log: Array.isArray(parsed.log) ? parsed.log.slice(0, 60) : [],
    };
  } catch {
    return EMPTY;
  }
}

function write(walletId: string, next: TillState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(walletId), JSON.stringify(next));
  } catch {
    /* private mode / quota — the in-memory value still drives this session */
  }
  emit();
}

/** Replace the drawer total outright — a physical recount. */
export function declareTill(walletId: string, centavos: number, note = "Drawer counted") {
  const current = readTill(walletId);
  const amount = Math.max(0, Math.round(centavos));
  const entry: TillMovement = {
    kind: "opening",
    amountCentavos: amount,
    balanceAfterCentavos: amount,
    note,
    at: new Date().toISOString(),
  };
  write(walletId, {
    centavos: amount,
    declared: true,
    updatedAt: entry.at,
    log: [entry, ...current.log].slice(0, 60),
  });
}

/**
 * Apply a movement. `deltaCentavos` is signed from the drawer's point of view:
 * a cash-out hands physical money to the resident, so it is negative.
 */
export function moveTill(
  walletId: string,
  kind: TillMovementKind,
  deltaCentavos: number,
  note?: string,
) {
  const current = readTill(walletId);
  const after = Math.max(0, current.centavos + Math.round(deltaCentavos));
  write(walletId, {
    centavos: after,
    declared: current.declared,
    updatedAt: new Date().toISOString(),
    log: [
      {
        kind,
        amountCentavos: Math.abs(Math.round(deltaCentavos)),
        balanceAfterCentavos: after,
        note,
        at: new Date().toISOString(),
      },
      ...current.log,
    ].slice(0, 60),
  });
}

/**
 * The server told us float is low. Never let the local count claim otherwise.
 */
export function clampToLowFloat(walletId: string) {
  const current = readTill(walletId);
  if (current.centavos >= FLOAT_ALERT_THRESHOLD_CENTAVOS) {
    const entry: TillMovement = {
      kind: "cash_out",
      amountCentavos: 0,
      balanceAfterCentavos: FLOAT_ALERT_THRESHOLD_CENTAVOS - 1,
      note: "Server raised a low-float alert — local count corrected down.",
      at: new Date().toISOString(),
    };
    write(walletId, {
      ...current,
      centavos: FLOAT_ALERT_THRESHOLD_CENTAVOS - 1,
      updatedAt: entry.at,
      log: [entry, ...current.log].slice(0, 60),
    });
  }
}

export function useTill(walletId: string | null): TillState | null {
  const [state, setState] = React.useState<TillState | null>(null);

  React.useEffect(() => {
    if (!walletId) {
      setState(null);
      return;
    }
    setState(readTill(walletId));
    const fn = () => setState(readTill(walletId));
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, [walletId]);

  return state;
}

export const isLowFloat = (centavos: number) => centavos < FLOAT_ALERT_THRESHOLD_CENTAVOS;
