"use client";

import * as React from "react";
import Link from "next/link";
import { get, post, qs, ApiError } from "@cbms/api-client";
import { Alert, Chip, PageHead, Spinner, peso, pesoAmount, fullName, dateTime } from "@cbms/ui";
import { useOutlet, useResidentWallets } from "../../lib/outlet";
import { useTill, moveTill, clampToLowFloat, FLOAT_ALERT_THRESHOLD_CENTAVOS } from "../../lib/till";
import { describeCashOutError, type FriendlyError } from "../../lib/errors";
import type { CashOutResponse, InhabitantRow, Paged, TxnRow } from "../../lib/types";

/** Matches the API: `const fee = body.isGovernmentAid ? 0n : 1000n;` */
const COMMERCIAL_FEE_CENTAVOS = 1000;
const QUICK_AMOUNTS = [200, 500, 1000, 2000];

type Step = "search" | "amount" | "receipt";

interface Receipt {
  amountCentavos: number;
  feeCentavos: number;
  residentName: string;
  outletName: string;
  isGovernmentAid: boolean;
  lowFloatAlert: boolean;
  reference: string | null;
  at: string;
}

export default function CashOutPage() {
  const { outlet, loading: outletLoading, reload: reloadOutlet } = useOutlet();
  const { wallets, applyDebit } = useResidentWallets();
  const till = useTill(outlet?.walletId ?? null);

  const [step, setStep] = React.useState<Step>("search");
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<InhabitantRow[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [searchError, setSearchError] = React.useState<string | null>(null);

  const [resident, setResident] = React.useState<InhabitantRow | null>(null);
  const [amountText, setAmountText] = React.useState("");
  const [isGovernmentAid, setIsGovernmentAid] = React.useState(true);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<FriendlyError | null>(null);
  const [receipt, setReceipt] = React.useState<Receipt | null>(null);

  // ---- resident search (debounced) ------------------------------------
  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      get<Paged<InhabitantRow>>(`/inhabitants${qs({ q, pageSize: 12 })}`)
        .then((res) => {
          if (!cancelled) {
            setResults(res.items);
            setSearchError(null);
          }
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setResults([]);
          setSearchError(
            e instanceof ApiError ? e.message : "Cannot reach the CBMS API right now.",
          );
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // ---- derived --------------------------------------------------------
  const amountPeso = Number(amountText);
  const amountValid = Number.isFinite(amountPeso) && amountPeso > 0;
  const amountCentavos = amountValid ? Math.round(amountPeso * 100) : 0;
  const feeCentavos = isGovernmentAid ? 0 : COMMERCIAL_FEE_CENTAVOS;
  const totalDebit = amountCentavos + feeCentavos;

  const residentWallet = resident && wallets ? (wallets.get(resident.id) ?? null) : null;
  const residentBalance = residentWallet ? Number(residentWallet.balanceCentavos) : null;
  const overBalance = residentBalance !== null && totalDebit > residentBalance;
  const overDrawer = till !== null && amountCentavos > till.centavos;
  const canSubmit =
    !!outlet?.agentId && !!resident && amountValid && !overBalance && !submitting;

  function reset() {
    setStep("search");
    setQuery("");
    setResults([]);
    setResident(null);
    setAmountText("");
    setIsGovernmentAid(true);
    setError(null);
    setReceipt(null);
  }

  /**
   * POST /wallet/cash-out answers only `{ ok, lowFloatAlert }` — no reference —
   * so we read the newest cash_out row back to print a real reference number.
   */
  async function fetchReference(agentId: string): Promise<string | null> {
    try {
      const res = await get<Paged<TxnRow>>(
        `/wallet/transactions${qs({ type: "cash_out", pageSize: 10 })}`,
      );
      return res.items.find((t) => t.agentId === agentId)?.reference ?? null;
    } catch {
      return null;
    }
  }

  async function submit() {
    if (!outlet?.agentId || !resident || !amountValid) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await post<CashOutResponse>("/wallet/cash-out", {
        agentId: outlet.agentId,
        inhabitantId: resident.id,
        amountPeso: Math.round(amountPeso * 100) / 100,
        isGovernmentAid,
      });

      // Mirror the server's book-keeping locally: notes leave the drawer.
      moveTill(
        outlet.walletId,
        "cash_out",
        -amountCentavos,
        `Cash-out to ${fullName(resident)}`,
      );
      if (res.lowFloatAlert) clampToLowFloat(outlet.walletId);
      applyDebit(resident.id, totalDebit);

      const reference = await fetchReference(outlet.agentId);
      reloadOutlet();

      setReceipt({
        amountCentavos,
        feeCentavos,
        residentName: fullName(resident),
        outletName: outlet.outletName,
        isGovernmentAid,
        lowFloatAlert: res.lowFloatAlert === true,
        reference,
        at: new Date().toISOString(),
      });
      setStep("receipt");
    } catch (e) {
      setError(describeCashOutError(e));
    } finally {
      setSubmitting(false);
    }
  }

  // ---- receipt --------------------------------------------------------
  if (step === "receipt" && receipt) {
    return (
      <>
        <PageHead title="Cash-out complete" subtitle="Hand over the cash and keep this receipt." exclusive />

        <div className="ag-receipt">
          <div style={{ fontSize: 34, marginBottom: 4 }} aria-hidden="true">
            {"✅"}
          </div>
          <div className="ag-label">Paid out to resident</div>
          <div className="ag-amount-big">{peso(receipt.amountCentavos)}</div>
          <div className="ag-muted" style={{ marginTop: 6 }}>
            {receipt.residentName}
          </div>
          <div className="ag-divider" />
          <div style={{ fontSize: 12.5, display: "grid", gap: 6, textAlign: "left" }}>
            <Line k="Outlet" v={receipt.outletName} />
            <Line
              k="Service fee"
              v={
                receipt.isGovernmentAid ? (
                  <span style={{ color: "var(--cbms-green)", fontWeight: 700 }}>
                    ₱0.00 — government aid
                  </span>
                ) : (
                  peso(receipt.feeCentavos)
                )
              }
            />
            <Line k="Debited from wallet" v={peso(receipt.amountCentavos + receipt.feeCentavos)} />
            <Line k="Reference" v={receipt.reference ?? "recorded in the ledger"} />
            <Line k="Time" v={dateTime(receipt.at)} />
          </div>
        </div>

        {receipt.isGovernmentAid && (
          <Alert tone="success">
            Free cash-out. Government aid is never eroded by a withdrawal fee — the barangay
            shoulders the rail cost, so the resident receives the full amount.
          </Alert>
        )}

        {receipt.lowFloatAlert && (
          <Alert tone="warn">
            <div>
              <strong>LOW FLOAT after this payout.</strong> Your recorded cash on hand has fallen
              below the {peso(FLOAT_ALERT_THRESHOLD_CENTAVOS)} threshold. Request a cash rebalance
              from the LGU hub before the next disbursement day — an outlet that opens short runs
              dry within the first hour of an ayuda release.
            </div>
          </Alert>
        )}

        <button className="ag-btn-lg" onClick={reset}>
          New cash-out
        </button>
        <div style={{ height: 10 }} />
        <Link
          href="/transactions"
          className="cbms-btn"
          style={{ display: "block", textAlign: "center" }}
        >
          View transactions
        </Link>
      </>
    );
  }

  // ---- guards ---------------------------------------------------------
  if (outletLoading) {
    return (
      <div className="cbms-center">
        <Spinner />
      </div>
    );
  }
  if (!outlet) {
    return <Alert tone="warn">No outlet is assigned to this account.</Alert>;
  }

  // ---- flow -----------------------------------------------------------
  return (
    <>
      <PageHead
        title="Cash-out"
        subtitle="Turn a resident's e-money into notes across the counter."
        exclusive
      />

      <div className="ag-steps" aria-hidden="true">
        <div className="ag-step ag-step--done" />
        <div className={`ag-step${step === "amount" ? " ag-step--done" : ""}`} />
      </div>

      {!outlet.agentId && (
        <Alert tone="danger">
          This outlet has no agent id yet (the API only reveals it through past CICO transactions),
          so a cash-out cannot be submitted. Switch to an outlet that has already transacted from
          the Home tab.
        </Alert>
      )}

      {error && (
        <Alert tone={error.tone}>
          <div>
            <strong>{error.title}</strong>
            <div style={{ marginTop: 4 }}>{error.detail}</div>
            {error.filipino && (
              <div style={{ marginTop: 5, fontStyle: "italic" }}>{error.filipino}</div>
            )}
          </div>
        </Alert>
      )}

      {step === "search" && (
        <>
          <input
            className="cbms-input cbms-input--search"
            style={{ width: "100%", marginBottom: 12 }}
            placeholder="Search resident by name or PhilSys no."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />

          {searchError && <Alert tone="danger">{searchError}</Alert>}

          {searching && (
            <div className="ag-muted" style={{ padding: "6px 2px" }}>
              <Spinner /> Searching…
            </div>
          )}

          {!searching && query.trim().length >= 2 && results.length === 0 && !searchError && (
            <Alert tone="info">
              No resident matches “{query.trim()}”. Check the spelling, or the resident may be
              registered in another barangay.
            </Alert>
          )}

          {query.trim().length < 2 && (
            <div className="ag-note">
              Type at least two letters. Only living residents in your barangay&rsquo;s RBI appear
              here — the same register the DILG BIMS inhabitant sub-system holds.
            </div>
          )}

          {results.map((r) => {
            const w = wallets?.get(r.id) ?? null;
            return (
              <button key={r.id} type="button" className="ag-row" onClick={() => { setResident(r); setStep("amount"); setError(null); }}>
                <div className="ag-row__main">
                  <div className="ag-row__name">{fullName(r)}</div>
                  <div className="ag-row__sub">
                    {r.household?.purok ?? "No purok"}
                    {r.household?.householdNo ? ` · ${r.household.householdNo}` : ""}
                    {r.is4Ps ? " · 4Ps" : ""}
                    {r.isSenior ? " · Senior" : ""}
                    {r.isPwd ? " · PWD" : ""}
                  </div>
                </div>
                <div className="ag-row__right">
                  {w ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{peso(w.balanceCentavos)}</div>
                      <div className="ag-row__sub">wallet balance</div>
                    </>
                  ) : (
                    <Chip tone="gray">No e-wallet</Chip>
                  )}
                </div>
              </button>
            );
          })}
        </>
      )}

      {step === "amount" && resident && (
        <>
          <div className="ag-row ag-row--static" style={{ marginBottom: 14 }}>
            <div className="ag-row__main">
              <div className="ag-row__name">{fullName(resident)}</div>
              <div className="ag-row__sub">
                {residentBalance !== null
                  ? `Wallet balance ${peso(residentBalance)}`
                  : "Wallet balance unknown"}
              </div>
            </div>
            <button
              type="button"
              className="cbms-btn cbms-btn--sm"
              onClick={() => {
                setStep("search");
                setResident(null);
                setError(null);
              }}
            >
              Change
            </button>
          </div>

          <label className="ag-label" htmlFor="amount">
            Amount to hand over
          </label>
          <input
            id="amount"
            className="ag-amount-input"
            inputMode="decimal"
            placeholder="0.00"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value.replace(/[^0-9.]/g, ""))}
            style={{ marginTop: 6 }}
          />
          <div className="ag-quick">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                className="ag-quick__btn"
                onClick={() => setAmountText(String(a))}
              >
                {pesoAmount(a).replace(".00", "")}
              </button>
            ))}
          </div>
          {residentBalance !== null && residentBalance > 0 && (
            <button
              type="button"
              className="ag-quick__btn"
              style={{ width: "100%", marginTop: 7 }}
              onClick={() =>
                setAmountText(((Math.max(0, residentBalance - feeCentavos)) / 100).toFixed(2))
              }
            >
              Cash out everything — {peso(Math.max(0, residentBalance - feeCentavos))}
            </button>
          )}

          <div style={{ height: 14 }} />

          <button
            type="button"
            className={`ag-toggle${isGovernmentAid ? " ag-toggle--on" : ""}`}
            onClick={() => setIsGovernmentAid((v) => !v)}
            aria-pressed={isGovernmentAid}
          >
            <span className="ag-toggle__track">
              <span className="ag-toggle__knob" />
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: 13.5 }}>
                Government aid — free cash-out
              </span>
              <span className="ag-row__sub" style={{ display: "block" }}>
                {isGovernmentAid
                  ? "No fee. Ayuda, honoraria and stipends are never charged."
                  : `Commercial withdrawal — ${peso(COMMERCIAL_FEE_CENTAVOS)} fee is added.`}
              </span>
            </span>
          </button>

          <div className="ag-card" style={{ marginTop: 12 }}>
            <div style={{ display: "grid", gap: 6, fontSize: 12.5 }}>
              <Line k="Cash to resident" v={<strong>{peso(amountCentavos)}</strong>} />
              <Line k="Fee" v={feeCentavos === 0 ? "₱0.00" : peso(feeCentavos)} />
              <Line k="Debited from their wallet" v={<strong>{peso(totalDebit)}</strong>} />
              <Line
                k="Your drawer after"
                v={till ? peso(Math.max(0, till.centavos - amountCentavos)) : "—"}
              />
            </div>
          </div>

          {overBalance && (
            <Alert tone="warn">
              {fullName(resident)} only has {peso(residentBalance ?? 0)} in their wallet — that is
              less than the {peso(totalDebit)} this cash-out would debit. Lower the amount.
            </Alert>
          )}

          {overDrawer && !overBalance && (
            <Alert tone="warn">
              Your counted drawer holds {peso(till?.centavos ?? 0)}, less than the{" "}
              {peso(amountCentavos)} you are about to hand over. The server keeps its own record of
              your cash on hand and will refuse the payout if it agrees.
            </Alert>
          )}

          <div style={{ height: 4 }} />
          <button className="ag-btn-lg" onClick={submit} disabled={!canSubmit}>
            {submitting ? <Spinner /> : `Pay out ${amountValid ? peso(amountCentavos) : "—"}`}
          </button>
          <div className="ag-note" style={{ marginTop: 12, marginBottom: 0 }}>
            Count the notes in front of the resident before you confirm. The debit is immediate and
            is written to the barangay ledger and audit trail.
          </div>
        </>
      )}
    </>
  );
}

function Line({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <span style={{ color: "var(--cbms-muted)", flex: 1 }}>{k}</span>
      <span style={{ textAlign: "right" }}>{v}</span>
    </div>
  );
}
