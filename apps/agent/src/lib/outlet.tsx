"use client";

import * as React from "react";
import { get, qs, ApiError } from "@cbms/api-client";
import type { Paged, WalletRow, TxnRow } from "./types";

/**
 * ---------------------------------------------------------------------------
 * Resolving "which outlet am I?"
 * ---------------------------------------------------------------------------
 * POST /wallet/cash-out needs an `Agent.id`, but GET /wallets deliberately
 * narrows the agent relation to `{ outletName }` — the id never appears there.
 * The one place the API does surface it is GET /wallet/transactions, whose rows
 * carry the scalar `agentId` alongside the agent's wallet id. So we join the
 * two: agent wallets give us the outlet + e-float, CICO transactions give us
 * the agent id for each of those wallets.
 *
 * An outlet that has never transacted therefore has `agentId === null`; the
 * cash-out screen surfaces that honestly instead of posting a broken request.
 */

export interface Outlet {
  walletId: string;
  outletName: string;
  /** null when no CICO transaction exists yet to reveal it. */
  agentId: string | null;
  eFloatCentavos: string;
  emiAccountRef: string;
  kycTier: string;
  status: string;
}

export interface OutletContextValue {
  outlets: Outlet[];
  outlet: Outlet | null;
  selectOutlet: (walletId: string) => void;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

const SELECTED_KEY = "cbms.agent.outlet";

const OutletContext = React.createContext<OutletContextValue>({
  outlets: [],
  outlet: null,
  selectOutlet: () => {},
  loading: true,
  error: null,
  reload: () => {},
});

export const useOutlet = () => React.useContext(OutletContext);

async function loadOutlets(): Promise<Outlet[]> {
  const [wallets, cashOut, cashIn] = await Promise.all([
    get<Paged<WalletRow>>(`/wallets${qs({ ownerType: "agent", pageSize: 50 })}`),
    get<Paged<TxnRow>>(`/wallet/transactions${qs({ type: "cash_out", pageSize: 200 })}`),
    get<Paged<TxnRow>>(`/wallet/transactions${qs({ type: "cash_in", pageSize: 200 })}`),
  ]);

  const agentWalletIds = new Set(wallets.items.map((w) => w.id));
  const agentIdByWallet = new Map<string, string>();

  // A CICO row touches the agent wallet on exactly one side; check both so we
  // do not depend on the direction convention of any single transaction type.
  for (const t of [...cashOut.items, ...cashIn.items]) {
    if (!t.agentId) continue;
    for (const wid of [t.toWalletId, t.fromWalletId]) {
      if (wid && agentWalletIds.has(wid) && !agentIdByWallet.has(wid)) {
        agentIdByWallet.set(wid, t.agentId);
      }
    }
  }

  return wallets.items.map((w) => ({
    walletId: w.id,
    outletName: w.agent?.outletName ?? "Unnamed outlet",
    agentId: agentIdByWallet.get(w.id) ?? null,
    eFloatCentavos: w.balanceCentavos,
    emiAccountRef: w.emiAccountRef,
    kycTier: w.kycTier,
    status: w.status,
  }));
}

export function OutletProvider({ children }: { children: React.ReactNode }) {
  const [outlets, setOutlets] = React.useState<Outlet[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nonce, setNonce] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadOutlets()
      .then((list) => {
        if (cancelled) return;
        setOutlets(list);
        const stored =
          typeof window === "undefined" ? null : window.localStorage.getItem(SELECTED_KEY);
        const valid = stored && list.some((o) => o.walletId === stored) ? stored : null;
        // Spec default: the first agent wallet.
        setSelectedId(valid ?? list[0]?.walletId ?? null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 403) {
          setError(
            "This account cannot read wallets (wallet:view). Sign in with a treasurer or agent credential.",
          );
        } else if (e instanceof ApiError) {
          setError(e.message);
        } else {
          setError("Cannot reach the CBMS API. Check that it is running on port 4000.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  const selectOutlet = React.useCallback((walletId: string) => {
    setSelectedId(walletId);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(SELECTED_KEY, walletId);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const value = React.useMemo<OutletContextValue>(
    () => ({
      outlets,
      outlet: outlets.find((o) => o.walletId === selectedId) ?? null,
      selectOutlet,
      loading,
      error,
      reload: () => setNonce((n) => n + 1),
    }),
    [outlets, selectedId, loading, error, selectOutlet],
  );

  return <OutletContext.Provider value={value}>{children}</OutletContext.Provider>;
}

/**
 * Every registered resident wallet, keyed by inhabitant id, so the counter can
 * see a resident's e-money balance *before* keying an amount. There is no
 * per-inhabitant wallet endpoint, so we page the list once and cache it for
 * the session.
 */
export interface ResidentWallet {
  walletId: string;
  inhabitantId: string;
  balanceCentavos: string;
  kycTier: string;
  status: string;
}

let residentCache: Map<string, ResidentWallet> | null = null;
let residentInflight: Promise<Map<string, ResidentWallet>> | null = null;

async function fetchResidentWallets(): Promise<Map<string, ResidentWallet>> {
  const map = new Map<string, ResidentWallet>();
  const pageSize = 200; // the API caps pageSize at 200
  for (let page = 1; page <= 5; page++) {
    const res = await get<Paged<WalletRow>>(
      `/wallets${qs({ ownerType: "resident", page, pageSize })}`,
    );
    for (const w of res.items) {
      if (w.inhabitantId) {
        map.set(w.inhabitantId, {
          walletId: w.id,
          inhabitantId: w.inhabitantId,
          balanceCentavos: w.balanceCentavos,
          kycTier: w.kycTier,
          status: w.status,
        });
      }
    }
    if (res.items.length < pageSize || page * pageSize >= res.total) break;
  }
  return map;
}

export function useResidentWallets() {
  const [wallets, setWallets] = React.useState<Map<string, ResidentWallet> | null>(residentCache);
  const [loading, setLoading] = React.useState(residentCache === null);

  React.useEffect(() => {
    if (residentCache) return;
    let cancelled = false;
    residentInflight = residentInflight ?? fetchResidentWallets();
    residentInflight
      .then((m) => {
        residentCache = m;
        if (!cancelled) setWallets(m);
      })
      .catch(() => {
        // Non-fatal: the counter simply loses the pre-flight balance hint.
        residentInflight = null;
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Call after a cash-out so the cached balance stops being stale. */
  const applyDebit = React.useCallback((inhabitantId: string, centavos: number) => {
    if (!residentCache) return;
    const w = residentCache.get(inhabitantId);
    if (!w) return;
    const next = Math.max(0, Number(w.balanceCentavos) - centavos);
    residentCache.set(inhabitantId, { ...w, balanceCentavos: String(next) });
    setWallets(new Map(residentCache));
  }, []);

  return { wallets, loading, applyDebit };
}
