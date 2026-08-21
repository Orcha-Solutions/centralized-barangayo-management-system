"use client";

import * as React from "react";
import Link from "next/link";
import { logout } from "@cbms/api-client";
import { Alert, Chip, Loading, PageHead, StatusChip, peso, num, relative } from "@cbms/ui";
import { useOutlet } from "../lib/outlet";
import { useTill, isLowFloat, FLOAT_ALERT_THRESHOLD_CENTAVOS } from "../lib/till";
import { useOutletTxns, belongsToOutlet, sumCentavos, isToday } from "../lib/txns";

export default function HomePage() {
  const { outlet, outlets, selectOutlet, loading, error, reload } = useOutlet();
  const till = useTill(outlet?.walletId ?? null);
  const { rows, loading: txLoading } = useOutletTxns(["cash_out", "cash_in"], 200);

  const mine = React.useMemo(
    () => rows.filter((t) => belongsToOutlet(t, outlet)),
    [rows, outlet],
  );
  const cashOutsToday = mine.filter((t) => t.type === "cash_out" && isToday(t.createdAt));
  const cashOuts30d = mine.filter((t) => t.type === "cash_out");
  const lastTxn = mine[0];

  if (loading) return <Loading label="Opening your outlet…" />;

  if (error) {
    return (
      <>
        <Alert tone="danger">{error}</Alert>
        <button className="ag-btn-lg" onClick={reload}>
          Try again
        </button>
      </>
    );
  }

  if (!outlet) {
    return (
      <Alert tone="warn">
        No agent wallet exists in this barangay yet. An LGU administrator has to register the
        outlet before it can accept cash-in / cash-out.
      </Alert>
    );
  }

  const cashOnHand = till?.centavos ?? 0;
  const low = till !== null && isLowFloat(cashOnHand);

  return (
    <>
      <PageHead
        title="Outlet summary"
        subtitle="Your cash drawer and e-float at a glance."
        exclusive
      />

      {low && (
        <Alert tone="warn">
          <div>
            <strong>LOW FLOAT — you cannot pay out much longer.</strong>
            <div style={{ marginTop: 5 }}>
              Cash on hand is {peso(cashOnHand)}, below the {peso(FLOAT_ALERT_THRESHOLD_CENTAVOS)}{" "}
              alert threshold. Agents must be <strong>pre-funded before a disbursement day</strong>
              {" "}— when ayuda lands, dozens of residents arrive within hours and an outlet that
              starts short runs dry in the first hour, which is what pushes people back to
              over-the-counter queues. Request a cash rebalance from the LGU hub now.
            </div>
            <div style={{ marginTop: 6 }}>
              <Link href="/float" style={{ fontWeight: 700, textDecoration: "underline" }}>
                Open float &amp; rebalancing →
              </Link>
            </div>
          </div>
        </Alert>
      )}

      <div className="ag-card ag-card--navy">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{outlet.outletName}</div>
            <div className="ag-muted" style={{ marginTop: 2 }}>
              {outlet.emiAccountRef} · KYC {outlet.kycTier}
            </div>
          </div>
          <StatusChip status={outlet.status} />
        </div>

        <div className="ag-divider" style={{ background: "rgba(255,255,255,.18)" }} />

        <div className="ag-split">
          <div>
            <div className="ag-label">Cash on hand</div>
            <div className="ag-figure" style={{ color: low ? "var(--cbms-gold)" : "#fff" }}>
              {till ? peso(cashOnHand) : "—"}
            </div>
            <div className="ag-muted" style={{ marginTop: 3 }}>
              Physical notes in the drawer
            </div>
          </div>
          <div>
            <div className="ag-label">E-float</div>
            <div className="ag-figure">{peso(outlet.eFloatCentavos)}</div>
            <div className="ag-muted" style={{ marginTop: 3 }}>
              E-money you can send
            </div>
          </div>
        </div>
      </div>

      <div className="ag-note">
        <strong>How the two balance.</strong> A cash-out swaps them: you hand over notes (cash on
        hand falls) and the resident&rsquo;s e-money lands in your e-float. You stay solvent only if
        the LGU converts that e-float back into physical cash — that is what a rebalance is.
        {till && !till.declared && (
          <>
            {" "}
            <strong>Cash on hand is an assumed opening count</strong> of{" "}
            {peso(cashOnHand)} — count your drawer on the Float tab to make it real.
          </>
        )}
      </div>

      {outlets.length > 1 && (
        <div className="ag-card">
          <div className="ag-label" style={{ marginBottom: 6 }}>
            Switch outlet
          </div>
          <select
            className="cbms-select"
            style={{ width: "100%" }}
            value={outlet.walletId}
            onChange={(e) => selectOutlet(e.target.value)}
          >
            {outlets.map((o) => (
              <option key={o.walletId} value={o.walletId}>
                {o.outletName} — {peso(o.eFloatCentavos)}
              </option>
            ))}
          </select>
        </div>
      )}

      {!outlet.agentId && (
        <Alert tone="warn">
          This outlet has no cash-in/cash-out history yet, so the API has not disclosed its agent
          id — and <code>POST /wallet/cash-out</code> needs one. Pick an outlet that has already
          transacted, or ask the LGU hub to expose the agent profile endpoint.
        </Alert>
      )}

      <div className="cbms-grid-3" style={{ gap: 10, marginBottom: 14 }}>
        <Link href="/cash-out" className="cbms-tile">
          <span className="cbms-tile__icon" aria-hidden="true">
            {"\u{1F4B8}"}
          </span>
          <span className="cbms-tile__label">New cash-out</span>
        </Link>
        <Link href="/transactions" className="cbms-tile">
          <span className="cbms-tile__icon" aria-hidden="true">
            {"\u{1F9FE}"}
          </span>
          <span className="cbms-tile__label">Transactions</span>
        </Link>
        <Link href="/float" className="cbms-tile">
          <span className="cbms-tile__icon" aria-hidden="true">
            {"\u{1F4B5}"}
          </span>
          <span className="cbms-tile__label">Float</span>
        </Link>
      </div>

      <div className="ag-card">
        <div className="ag-label" style={{ marginBottom: 10 }}>
          Activity at this outlet
        </div>
        {txLoading ? (
          <div className="ag-muted">Loading transactions…</div>
        ) : (
          <>
            <div className="ag-split">
              <div>
                <div className="ag-muted">Cash-outs today</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--cbms-navy)" }}>
                  {num(cashOutsToday.length)}
                </div>
                <div className="ag-muted">{peso(sumCentavos(cashOutsToday))} paid out</div>
              </div>
              <div>
                <div className="ag-muted">Cash-outs on record</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--cbms-navy)" }}>
                  {num(cashOuts30d.length)}
                </div>
                <div className="ag-muted">{peso(sumCentavos(cashOuts30d))} total</div>
              </div>
            </div>
            {lastTxn && (
              <>
                <div className="ag-divider" />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Chip tone={lastTxn.type === "cash_out" ? "gold" : "green"}>
                    {lastTxn.type === "cash_out" ? "Cash out" : "Cash in"}
                  </Chip>
                  <div style={{ flex: 1, fontWeight: 700 }}>{peso(lastTxn.amountCentavos)}</div>
                  <div className="ag-muted">{relative(lastTxn.createdAt)}</div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Link
        href="/cash-out"
        className="ag-btn-lg ag-btn-lg--gold"
        style={{ display: "block", textAlign: "center" }}
      >
        Start a cash-out
      </Link>

      <button
        className="cbms-btn"
        style={{ width: "100%", marginTop: 10 }}
        onClick={() => {
          void logout();
        }}
      >
        Sign out
      </button>
    </>
  );
}
