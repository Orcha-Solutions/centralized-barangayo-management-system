"use client";

import * as React from "react";
import { Alert, Chip, PageHead, Spinner, peso, num, relative, dateTime } from "@cbms/ui";
import { useOutlet } from "../../lib/outlet";
import {
  useTill,
  declareTill,
  moveTill,
  isLowFloat,
  FLOAT_ALERT_THRESHOLD_CENTAVOS,
  type TillMovementKind,
} from "../../lib/till";
import { useOutletTxns, belongsToOutlet, sumCentavos } from "../../lib/txns";

const MOVEMENT_LABELS: Record<TillMovementKind, string> = {
  opening: "Drawer counted",
  rebalance_in: "Rebalance in",
  rebalance_out: "Rebalance out",
  cash_out: "Cash-out",
  cash_in: "Cash-in",
};

export default function FloatPage() {
  const { outlet, loading: outletLoading } = useOutlet();
  const till = useTill(outlet?.walletId ?? null);
  const { rows, loading: txLoading } = useOutletTxns(["cash_out", "cash_in"], 200);

  const [countText, setCountText] = React.useState("");
  const [rebalanceText, setRebalanceText] = React.useState("");

  const mine = React.useMemo(() => rows.filter((t) => belongsToOutlet(t, outlet)), [rows, outlet]);
  const cashOuts = mine.filter((t) => t.type === "cash_out");
  const cashIns = mine.filter((t) => t.type === "cash_in");

  if (outletLoading) {
    return (
      <div className="cbms-center">
        <Spinner />
      </div>
    );
  }
  if (!outlet) return <Alert tone="warn">No outlet is assigned to this account.</Alert>;

  const cashOnHand = till?.centavos ?? 0;
  const low = till !== null && isLowFloat(cashOnHand);
  const headroom = cashOnHand - FLOAT_ALERT_THRESHOLD_CENTAVOS;

  const countValue = Number(countText);
  const countValid = Number.isFinite(countValue) && countValue >= 0 && countText.trim() !== "";
  const rebalanceValue = Number(rebalanceText);
  const rebalanceValid = Number.isFinite(rebalanceValue) && rebalanceValue > 0;

  return (
    <>
      <PageHead
        title="Cash float"
        subtitle="Keep enough physical cash to pay out, and enough e-float to accept deposits."
        exclusive
      />

      {low && (
        <Alert tone="warn">
          <div>
            <strong>LOW FLOAT.</strong> Cash on hand is {peso(cashOnHand)} — under the{" "}
            {peso(FLOAT_ALERT_THRESHOLD_CENTAVOS)} alert threshold. Request a rebalance before you
            accept another cash-out.
          </div>
        </Alert>
      )}

      <div className="ag-card ag-card--navy">
        <div className="ag-label">Cash on hand</div>
        <div
          className="ag-amount-big"
          style={{ color: low ? "var(--cbms-gold)" : "#fff", marginTop: 2 }}
        >
          {till ? peso(cashOnHand) : "—"}
        </div>
        <div className="ag-muted" style={{ marginTop: 4 }}>
          {till?.updatedAt ? `Last movement ${relative(till.updatedAt)}` : "No movements recorded"}
        </div>

        <div className="ag-divider" style={{ background: "rgba(255,255,255,.18)" }} />

        <div className="ag-split">
          <div>
            <div className="ag-label">Alert threshold</div>
            <div style={{ fontSize: 17, fontWeight: 800, marginTop: 2 }}>
              {peso(FLOAT_ALERT_THRESHOLD_CENTAVOS)}
            </div>
          </div>
          <div>
            <div className="ag-label">{headroom >= 0 ? "Headroom" : "Short by"}</div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                marginTop: 2,
                color: headroom >= 0 ? "#fff" : "var(--cbms-gold)",
              }}
            >
              {peso(Math.abs(headroom))}
            </div>
          </div>
        </div>

        <div className="ag-divider" style={{ background: "rgba(255,255,255,.18)" }} />

        <div className="ag-label">E-float (e-money you hold)</div>
        <div style={{ fontSize: 19, fontWeight: 800, marginTop: 2 }}>
          {peso(outlet.eFloatCentavos)}
        </div>
      </div>

      <div className="ag-card">
        <div className="ag-label" style={{ marginBottom: 4 }}>
          Rebalancing
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, margin: "6px 0 0" }}>
          <strong>Mag-request ng cash rebalance sa LGU hub bago ang disbursement day.</strong>
        </p>
        <p className="ag-muted" style={{ marginTop: 8 }}>
          Every cash-out drains your drawer and fills your e-float. Rebalancing is the swap back:
          you send e-float to the LGU hub and collect physical notes. Do it{" "}
          <strong>before</strong> a disbursement, not after — when ayuda lands, dozens of residents
          arrive within a couple of hours, and an outlet that opens short runs dry in the first
          hour. That is the single most common reason a barangay falls back to over-the-counter
          queues on payout day.
        </p>
      </div>

      <div className="ag-card">
        <div className="ag-label" style={{ marginBottom: 8 }}>
          Count your drawer
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="cbms-input"
            style={{ flex: 1 }}
            inputMode="decimal"
            placeholder="Actual pesos in the drawer"
            value={countText}
            onChange={(e) => setCountText(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          <button
            className="cbms-btn cbms-btn--primary"
            disabled={!countValid}
            onClick={() => {
              declareTill(outlet.walletId, Math.round(countValue * 100));
              setCountText("");
            }}
          >
            Save
          </button>
        </div>
        {till && !till.declared && (
          <div className="ag-muted" style={{ marginTop: 8 }}>
            Currently using an assumed opening float of {peso(cashOnHand)}. Count the drawer to
            replace it with the real figure.
          </div>
        )}
      </div>

      <div className="ag-card">
        <div className="ag-label" style={{ marginBottom: 8 }}>
          Record a rebalance
        </div>
        <input
          className="cbms-input"
          style={{ width: "100%", marginBottom: 8 }}
          inputMode="decimal"
          placeholder="Amount in pesos"
          value={rebalanceText}
          onChange={(e) => setRebalanceText(e.target.value.replace(/[^0-9.]/g, ""))}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="cbms-btn cbms-btn--primary"
            style={{ flex: 1 }}
            disabled={!rebalanceValid}
            onClick={() => {
              moveTill(
                outlet.walletId,
                "rebalance_in",
                Math.round(rebalanceValue * 100),
                "Cash collected from the LGU hub",
              );
              setRebalanceText("");
            }}
          >
            Cash received
          </button>
          <button
            className="cbms-btn"
            style={{ flex: 1 }}
            disabled={!rebalanceValid}
            onClick={() => {
              moveTill(
                outlet.walletId,
                "rebalance_out",
                -Math.round(rebalanceValue * 100),
                "Cash returned to the LGU hub",
              );
              setRebalanceText("");
            }}
          >
            Cash returned
          </button>
        </div>
      </div>

      <div className="ag-note">
        <strong>Where these numbers come from.</strong> The e-float above is live from{" "}
        <code>GET /wallets?ownerType=agent</code>. The drawer figure is counted on this device: the
        API keeps the authoritative <code>Agent.cashOnHandCentavos</code> but does not expose it on
        any read endpoint, so the only server signal is the <code>lowFloatAlert</code> flag returned
        by a cash-out — when that fires, the count here is corrected down automatically.
      </div>

      <div className="ag-card">
        <div className="ag-label" style={{ marginBottom: 10 }}>
          Recorded on the rail
        </div>
        {txLoading ? (
          <div className="ag-muted">
            <Spinner /> Loading…
          </div>
        ) : (
          <div className="ag-split">
            <div>
              <div className="ag-muted">Cash paid out</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--cbms-navy)" }}>
                {peso(sumCentavos(cashOuts))}
              </div>
              <div className="ag-muted">{num(cashOuts.length)} cash-outs</div>
            </div>
            <div>
              <div className="ag-muted">Cash taken in</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--cbms-navy)" }}>
                {peso(sumCentavos(cashIns))}
              </div>
              <div className="ag-muted">{num(cashIns.length)} cash-ins</div>
            </div>
          </div>
        )}
      </div>

      <div className="ag-label" style={{ margin: "18px 0 8px" }}>
        Drawer movements
      </div>
      {!till || till.log.length === 0 ? (
        <Alert tone="info">
          No drawer movements yet. Count your cash above, then every cash-out you complete in this
          app is logged here.
        </Alert>
      ) : (
        till.log.map((m, i) => {
          const negative = m.kind === "cash_out" || m.kind === "rebalance_out";
          return (
            <div key={`${m.at}-${i}`} className="ag-row ag-row--static">
              <div className="ag-row__main">
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Chip tone={negative ? "gold" : m.kind === "opening" ? "gray" : "green"}>
                    {MOVEMENT_LABELS[m.kind]}
                  </Chip>
                </div>
                <div className="ag-row__sub" style={{ marginTop: 4 }}>
                  {m.note ?? "—"} · {dateTime(m.at)}
                </div>
              </div>
              <div className="ag-row__right">
                <div style={{ fontWeight: 800, fontSize: 14 }}>
                  {m.kind === "opening" ? "" : negative ? "−" : "+"}
                  {peso(m.amountCentavos)}
                </div>
                <div className="ag-row__sub">{peso(m.balanceAfterCentavos)} after</div>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
