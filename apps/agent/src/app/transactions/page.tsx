"use client";

import * as React from "react";
import { Alert, Chip, PageHead, Spinner, StatusChip, peso, num, relative, dateTime } from "@cbms/ui";
import { useOutlet } from "../../lib/outlet";
import { useOutletTxns, belongsToOutlet, txnEffect, sumCentavos } from "../../lib/txns";
import type { TxnRow } from "../../lib/types";

type Filter = "all" | "cash_out" | "cash_in";

const FILTERS: Array<{ key: Filter; label: string; types: string[] }> = [
  { key: "all", label: "All", types: ["cash_out", "cash_in"] },
  { key: "cash_out", label: "Cash-out", types: ["cash_out"] },
  { key: "cash_in", label: "Cash-in", types: ["cash_in"] },
];

export default function TransactionsPage() {
  const { outlet } = useOutlet();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [mineOnly, setMineOnly] = React.useState(true);
  const [limit, setLimit] = React.useState(25);
  const [open, setOpen] = React.useState<string | null>(null);

  const types = FILTERS.find((f) => f.key === filter)?.types ?? ["cash_out"];
  const { rows, loading, error, reload } = useOutletTxns(types, 200);

  const filtered = React.useMemo(
    () => (mineOnly ? rows.filter((t) => belongsToOutlet(t, outlet)) : rows),
    [rows, mineOnly, outlet],
  );
  const visible = filtered.slice(0, limit);

  return (
    <>
      <PageHead
        title="Transactions"
        subtitle="Every cash-in and cash-out recorded against the e-wallet rail."
        exclusive
      />

      <div className="ag-seg" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            className={`ag-seg__btn${filter === f.key ? " ag-seg__btn--active" : ""}`}
            onClick={() => {
              setFilter(f.key);
              setLimit(25);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`ag-toggle${mineOnly ? " ag-toggle--on" : ""}`}
        onClick={() => {
          setMineOnly((v) => !v);
          setLimit(25);
        }}
        aria-pressed={mineOnly}
        style={{ marginBottom: 12 }}
      >
        <span className="ag-toggle__track">
          <span className="ag-toggle__knob" />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 13.5 }}>This outlet only</span>
          <span className="ag-row__sub" style={{ display: "block" }}>
            {mineOnly
              ? (outlet?.outletName ?? "No outlet selected")
              : "Showing every outlet in the barangay"}
          </span>
        </span>
      </button>

      {error && (
        <>
          <Alert tone="danger">{error}</Alert>
          <button className="ag-btn-lg" onClick={reload}>
            Try again
          </button>
        </>
      )}

      {loading && (
        <div className="ag-muted" style={{ padding: "8px 2px" }}>
          <Spinner /> Loading transactions…
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="ag-card">
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div className="ag-label">Transactions</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "var(--cbms-navy)" }}>
                  {num(filtered.length)}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="ag-label">Total value</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: "var(--cbms-navy)" }}>
                  {peso(sumCentavos(filtered))}
                </div>
              </div>
            </div>
          </div>

          {filtered.length === 0 && (
            <Alert tone="info">
              No {filter === "all" ? "cash-in or cash-out" : filter.replace("_", "-")} transactions
              {mineOnly ? " at this outlet" : ""} yet.
            </Alert>
          )}

          {visible.map((t) => (
            <TxnItem
              key={t.id}
              txn={t}
              expanded={open === t.id}
              onToggle={() => setOpen(open === t.id ? null : t.id)}
            />
          ))}

          {visible.length < filtered.length && (
            <button className="cbms-btn" style={{ width: "100%" }} onClick={() => setLimit((n) => n + 25)}>
              Load {Math.min(25, filtered.length - visible.length)} more
            </button>
          )}
        </>
      )}
    </>
  );
}

function TxnItem({
  txn,
  expanded,
  onToggle,
}: {
  txn: TxnRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const effect = txnEffect(txn.type);
  const label = effect?.label ?? txn.type.replace(/_/g, " ");

  return (
    <button type="button" className="ag-row" onClick={onToggle} style={{ display: "block" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="ag-row__main">
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Chip tone={effect?.tone ?? "gray"}>{label}</Chip>
            <StatusChip status={txn.status} />
          </div>
          <div className="ag-row__sub" style={{ marginTop: 4 }}>
            {txn.agent?.outletName ?? txn.description ?? "—"}
          </div>
        </div>
        <div className="ag-row__right">
          <div style={{ fontWeight: 800, fontSize: 15, color: "var(--cbms-navy)" }}>
            {peso(txn.amountCentavos)}
          </div>
          <div className="ag-row__sub">{relative(txn.createdAt)}</div>
        </div>
      </div>

      {expanded && (
        <>
          <div className="ag-divider" />
          <div style={{ display: "grid", gap: 5, fontSize: 12 }}>
            {effect && (
              <Row
                k="Effect on your outlet"
                v={
                  <span>
                    cash on hand <strong>{effect.cashSign}</strong>, e-float{" "}
                    <strong>{effect.floatSign}</strong>
                  </span>
                }
              />
            )}
            <Row k="Reference" v={<code style={{ fontSize: 11 }}>{txn.reference}</code>} />
            <Row
              k="Fee"
              v={
                Number(txn.feeCentavos) === 0 ? (
                  <span style={{ color: "var(--cbms-green)", fontWeight: 700 }}>
                    ₱0.00 — free
                  </span>
                ) : (
                  peso(txn.feeCentavos)
                )
              }
            />
            <Row k="Recorded" v={dateTime(txn.createdAt)} />
            {txn.completedAt && <Row k="Completed" v={dateTime(txn.completedAt)} />}
            {txn.emiTxnRef && (
              <Row k="EMI reference" v={<code style={{ fontSize: 11 }}>{txn.emiTxnRef}</code>} />
            )}
          </div>
        </>
      )}
    </button>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <span style={{ color: "var(--cbms-muted)", flex: 1 }}>{k}</span>
      <span style={{ textAlign: "right", wordBreak: "break-all" }}>{v}</span>
    </div>
  );
}
