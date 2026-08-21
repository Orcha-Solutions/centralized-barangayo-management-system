"use client";

import * as React from "react";
import { Alert, Chip, Loading, type ChipTone } from "@cbms/ui";

/** Renders loading / error / content for a `useApi` result. */
export function Async(props: {
  loading: boolean;
  error: { message: string } | null;
  children: React.ReactNode;
  emptyLabel?: string;
}) {
  if (props.loading) return <Loading label={props.emptyLabel ?? "Loading…"} />;
  if (props.error) return <Alert tone="danger">{props.error.message}</Alert>;
  return <>{props.children}</>;
}

/** Slim inline error/success line used after write actions. */
export function ActionResult({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (error) return <Alert tone="danger">{error}</Alert>;
  if (success) return <Alert tone="success">{success}</Alert>;
  return null;
}

export function Progress({
  value,
  tone = "navy",
  label,
}: {
  value: number;
  tone?: "navy" | "gold" | "red" | "green";
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="adm-progress">
        <div className={`adm-progress__bar adm-progress__bar--${tone}`} style={{ width: `${pct}%` }} />
      </div>
      {label !== undefined && <div className="adm-progress__label">{label}</div>}
    </div>
  );
}

/** Provenance of a row: BIMS-sourced records are read-only in companion mode. */
export function SourceChip({ source }: { source?: string | null }) {
  const s = (source ?? "CBMS").toUpperCase();
  if (s === "BIMS") return <Chip tone="navy">BIMS</Chip>;
  if (s === "IMPORT") return <Chip tone="gray">Import</Chip>;
  return <Chip tone="gold">CBMS</Chip>;
}

/** Sectoral flags rendered as compact chips. */
export function SectorChips({
  row,
}: {
  row: {
    isSenior?: boolean;
    isPwd?: boolean;
    isSoloParent?: boolean;
    is4Ps?: boolean;
    isIndigenous?: boolean;
    isPregnant?: boolean;
    isBedridden?: boolean;
    isOfw?: boolean;
    isVoter?: boolean;
  };
}) {
  const flags: Array<[boolean | undefined, string, ChipTone]> = [
    [row.isSenior, "Senior", "gold"],
    [row.isPwd, "PWD", "blue"],
    [row.isSoloParent, "Solo parent", "navy"],
    [row.is4Ps, "4Ps", "green"],
    [row.isIndigenous, "IP", "navy"],
    [row.isPregnant, "Pregnant", "gold"],
    [row.isBedridden, "Bedridden", "red"],
    [row.isOfw, "OFW", "gray"],
  ];
  const on = flags.filter(([v]) => !!v);
  if (!on.length) return <span className="cbms-table__muted">—</span>;
  return (
    <span className="adm-chiprow">
      {on.map(([, label, tone]) => (
        <Chip key={label} tone={tone}>
          {label}
        </Chip>
      ))}
    </span>
  );
}

/** Colour-coded statutory / SLA countdown. */
export function DeadlineCell({
  dueAt,
  daysRemaining,
  breached,
}: {
  dueAt?: string | null;
  daysRemaining?: number | null;
  breached?: boolean;
}) {
  if (!dueAt || daysRemaining === null || daysRemaining === undefined) {
    return <span className="cbms-table__muted">No running clock</span>;
  }
  const tone: ChipTone = breached ? "red" : daysRemaining <= 3 ? "gold" : "green";
  const text = breached
    ? `Breached by ${Math.abs(daysRemaining)}d`
    : `${daysRemaining}d left`;
  return (
    <span className="adm-chiprow">
      <Chip tone={tone}>{text}</Chip>
      <span className="cbms-table__muted">
        {new Date(dueAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
      </span>
    </span>
  );
}

/** Native-tooltip wrapper so disabled controls can still explain themselves. */
export function Hint({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="adm-hint" title={text}>
      {children}
    </span>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="adm-tabs">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          className={`adm-tabs__tab${t.value === value ? " adm-tabs__tab--active" : ""}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <div className="adm-empty">{children}</div>;
}

/** Horizontal bar chart built from plain divs (no chart library). */
export function BarRow({
  label,
  value,
  max,
  suffix,
  tone = "navy",
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  tone?: "navy" | "gold" | "red" | "green";
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="adm-bar">
      <div className="adm-bar__label">{label}</div>
      <div className="adm-bar__track">
        <div className={`adm-bar__fill adm-bar__fill--${tone}`} style={{ width: `${Math.max(pct, 1.5)}%` }} />
      </div>
      <div className="adm-bar__value">
        {value.toLocaleString("en-PH")}
        {suffix ?? ""}
      </div>
    </div>
  );
}
