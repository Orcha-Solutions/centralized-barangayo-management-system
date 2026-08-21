"use client";

import * as React from "react";
import { titleize } from "./format";

// ---------------------------------------------------------------
// Stat cards
// ---------------------------------------------------------------

export function StatCard(props: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "navy" | "gold" | "red" | "green";
}) {
  const tone = props.tone ?? "navy";
  return (
    <div className="cbms-stat">
      {props.icon !== undefined && (
        <div className={`cbms-stat__icon${tone !== "navy" ? ` cbms-stat__icon--${tone}` : ""}`}>
          {props.icon}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <div className="cbms-stat__label">{props.label}</div>
        <div className="cbms-stat__value">{props.value}</div>
        {props.hint && <div className="cbms-stat__hint">{props.hint}</div>}
      </div>
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="cbms-stats">{children}</div>;
}

// ---------------------------------------------------------------
// Status chips
// ---------------------------------------------------------------

export type ChipTone = "green" | "blue" | "gold" | "red" | "gray" | "navy";

const STATUS_TONES: Record<string, ChipTone> = {
  // generic
  active: "green", completed: "green", approved: "green", released: "green",
  resolved: "green", enacted: "green", settled: "green", paid: "green",
  operational: "green", granted: "green", success: "green", open: "blue",
  ongoing: "blue", in_progress: "blue", dispatched: "blue", acknowledged: "blue",
  submitted: "blue", booked: "blue", mediation: "blue", serving: "blue",
  monitoring: "blue", proposed: "gray", draft: "gray", closed: "gray",
  checked_in: "blue", conciliation: "gold", for_approval: "gold",
  awaiting_payment: "gold", pending: "gold", under_construction: "gold",
  escalated: "gold", recovery: "gold", filed: "gold", deferred: "gray",
  rejected: "red", failed: "red", unserviceable: "red", cfa_issued: "red",
  repudiated: "red", cancelled: "gray", no_show: "red", withdrawn: "gray",
  suspended: "red", frozen: "red", critical: "red", warning: "gold",
  otc_fallback: "gold", test: "gray", false_alarm: "gray", dismissed: "gray",
  info: "blue", tier1: "gray", tier2: "green",
};

export function StatusChip({ status, tone }: { status: string; tone?: ChipTone }) {
  const t = tone ?? STATUS_TONES[status] ?? "gray";
  return <span className={`cbms-chip cbms-chip--${t}`}>{titleize(status)}</span>;
}

export function Chip({ children, tone = "gray" }: { children: React.ReactNode; tone?: ChipTone }) {
  return <span className={`cbms-chip cbms-chip--${tone}`}>{children}</span>;
}

/** Marks a module as BIMS-parity or CBMS-exclusive (success criterion #3). */
export function ParityBadge({ bims }: { bims?: string }) {
  return bims ? (
    <span className="cbms-parity" title="This module mirrors a DILG LGUSS-BIMS sub-system">
      ⛭ BIMS-parity: {bims}
    </span>
  ) : (
    <span className="cbms-parity cbms-parity--exclusive" title="Not present in LGUSS-BIMS">
      ★ CBMS exclusive
    </span>
  );
}

// ---------------------------------------------------------------
// Page scaffolding
// ---------------------------------------------------------------

export function PageHead(props: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  parity?: string;
  exclusive?: boolean;
  actions?: React.ReactNode;
}) {
  return (
    <div className="cbms-page-head">
      {props.breadcrumb && <div className="cbms-breadcrumb">{props.breadcrumb}</div>}
      <div className="cbms-page-head__row">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="cbms-page-title">{props.title}</h1>
          {props.subtitle && <p className="cbms-page-sub">{props.subtitle}</p>}
          {(props.parity || props.exclusive) && (
            <div style={{ marginTop: 9 }}>
              <ParityBadge bims={props.parity} />
            </div>
          )}
        </div>
        {props.actions && (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>{props.actions}</div>
        )}
      </div>
    </div>
  );
}

export function Panel(props: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <div className="cbms-panel">
      {(props.title || props.actions) && (
        <div className="cbms-panel__head">
          {props.title && <div className="cbms-panel__title">{props.title}</div>}
          <div style={{ flex: 1 }} />
          {props.actions}
        </div>
      )}
      {props.padded === false ? props.children : <div className="cbms-panel__body">{props.children}</div>}
    </div>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="cbms-toolbar">{children}</div>;
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "primary" | "gold" | "danger";
    size?: "sm" | "md";
  },
) {
  const { variant = "default", size = "md", className = "", ...rest } = props;
  const cls = [
    "cbms-btn",
    variant !== "default" ? `cbms-btn--${variant}` : "",
    size === "sm" ? "cbms-btn--sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <button {...rest} className={cls} />;
}

export function Alert(props: {
  tone?: "info" | "warn" | "danger" | "success";
  children: React.ReactNode;
}) {
  return <div className={`cbms-alert cbms-alert--${props.tone ?? "info"}`}>{props.children}</div>;
}

export function Spinner() {
  return <span className="cbms-spinner" aria-label="Loading" />;
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="cbms-center">
      <div style={{ textAlign: "center", color: "var(--cbms-muted)" }}>
        <Spinner />
        <div style={{ marginTop: 10, fontSize: 13 }}>{label}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Data table
// ---------------------------------------------------------------

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  width?: string | number;
  align?: "left" | "right" | "center";
}

export function DataTable<T extends Record<string, any>>(props: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
  rowKey?: (row: T, i: number) => string;
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="cbms-table-wrap">
      <table className="cbms-table">
        <thead>
          <tr>
            {props.columns.map((c) => (
              <th key={c.key} style={{ width: c.width, textAlign: c.align ?? "left" }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.length === 0 ? (
            <tr>
              <td className="cbms-table__empty" colSpan={props.columns.length}>
                {props.empty ?? "No records found."}
              </td>
            </tr>
          ) : (
            props.rows.map((row, i) => (
              <tr
                key={props.rowKey ? props.rowKey(row, i) : (row.id ?? i)}
                onClick={props.onRowClick ? () => props.onRowClick!(row) : undefined}
                style={props.onRowClick ? { cursor: "pointer" } : undefined}
              >
                {props.columns.map((c) => (
                  <td key={c.key} style={{ textAlign: c.align ?? "left" }}>
                    {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination(props: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(props.total / props.pageSize));
  const from = props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1;
  const to = Math.min(props.page * props.pageSize, props.total);
  return (
    <div className="cbms-pagination">
      <span>
        Showing <strong>{from}</strong>–<strong>{to}</strong> of{" "}
        <strong>{props.total.toLocaleString()}</strong>
      </span>
      <div className="cbms-pagination__spacer" />
      <Button size="sm" disabled={props.page <= 1} onClick={() => props.onPage(props.page - 1)}>
        ← Prev
      </Button>
      <span style={{ fontSize: 12.5 }}>
        Page {props.page} of {totalPages}
      </span>
      <Button
        size="sm"
        disabled={props.page >= totalPages}
        onClick={() => props.onPage(props.page + 1)}
      >
        Next →
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------
// Key/value detail list
// ---------------------------------------------------------------

export function KeyValue({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <div className="cbms-kv">
      {items.map(([k, v], i) => (
        <React.Fragment key={i}>
          <div className="cbms-kv__k">{k}</div>
          <div className="cbms-kv__v">{v ?? "—"}</div>
        </React.Fragment>
      ))}
    </div>
  );
}

export function Field(props: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="cbms-field">
      <label className="cbms-label">{props.label}</label>
      {props.children}
      {props.hint && (
        <div style={{ fontSize: 11.5, color: "var(--cbms-muted)", marginTop: 4 }}>{props.hint}</div>
      )}
    </div>
  );
}

/** Honest labelling required by the build spec: adapters are simulated. */
export function MockBanner({ what = "BIMS, PhilSys and the EMI payment rail" }: { what?: string }) {
  return (
    <div className="cbms-mock-banner">
      Demo environment — {what} are <strong>mock adapters</strong>. No live DILG, PhilSys or
      e-money connection. Data is synthetic.
    </div>
  );
}
