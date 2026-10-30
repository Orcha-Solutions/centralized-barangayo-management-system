"use client";

import * as React from "react";
import { Button } from "@cbms/ui";

export interface FilterValues {
  year: string;
  dateFrom: string;
  dateTo: string;
  fund: string;
  direction: string;
}

export interface FinanceFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "ledger" | "receipts";
  values: FilterValues;
  onApply: (next: FilterValues) => void;
  onReset: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
export const FISCAL_YEARS = [
  { value: "all", label: "All fiscal years" },
  { value: String(CURRENT_YEAR), label: `FY ${CURRENT_YEAR} (Current)` },
  { value: String(CURRENT_YEAR - 1), label: `FY ${CURRENT_YEAR - 1}` },
  { value: String(CURRENT_YEAR - 2), label: `FY ${CURRENT_YEAR - 2}` },
  { value: String(CURRENT_YEAR - 3), label: `FY ${CURRENT_YEAR - 3}` },
  { value: String(CURRENT_YEAR - 4), label: `FY ${CURRENT_YEAR - 4}` },
];

export const FUNDS = [
  { value: "all", label: "All funds" },
  { value: "general", label: "General Fund (GF)" },
  { value: "trust", label: "Trust Fund" },
  { value: "special", label: "Special Purpose Fund" },
];

export function FinanceFilterPopover({
  isOpen,
  onClose,
  activeTab,
  values,
  onApply,
  onReset,
}: FinanceFilterPopoverProps) {
  const [draft, setDraft] = React.useState<FilterValues>(values);

  // Sync draft only when popover opens or individual primitive filter values change
  React.useEffect(() => {
    if (isOpen) {
      setDraft({
        year: values.year,
        dateFrom: values.dateFrom,
        dateTo: values.dateTo,
        fund: values.fund,
        direction: values.direction,
      });
    }
  }, [isOpen, values.year, values.dateFrom, values.dateTo, values.fund, values.direction]);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    const emptyValues: FilterValues = {
      year: "all",
      dateFrom: "",
      dateTo: "",
      fund: "all",
      direction: "all",
    };
    setDraft(emptyValues);
    onReset();
    onClose();
  };

  const activeCount = [
    draft.year !== "all",
    Boolean(draft.dateFrom),
    Boolean(draft.dateTo),
    activeTab === "ledger" && draft.fund !== "all",
    activeTab === "ledger" && draft.direction !== "all",
  ].filter(Boolean).length;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          backgroundColor: "rgba(15, 23, 42, 0.35)",
          backdropFilter: "blur(1px)",
        }}
        onClick={onClose}
      />

      {/* Centered Pop-up Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter configuration"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          width: "420px",
          maxWidth: "calc(100vw - 32px)",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          border: "1px solid var(--color-border, #cbd5e1)",
          borderRadius: "0.625rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.9rem 1.25rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            backgroundColor: "var(--color-bg-subtle, #f8fafc)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.05rem" }}>🎛️</span>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-text, #1e293b)" }}>
              Filter {activeTab === "ledger" ? "Ledger Transactions" : "Official Receipts"}
            </span>
            {activeCount > 0 && (
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  padding: "1px 8px",
                  borderRadius: "12px",
                }}
              >
                {activeCount} selected
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.1rem",
              lineHeight: 1,
              color: "var(--color-text-muted, #64748b)",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Filter Form Body */}
        <form onSubmit={handleApply} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Fiscal Year */}
          <div>
            <label
              htmlFor="filter-year"
              style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text, #334155)" }}
            >
              Fiscal Year
            </label>
            <select
              id="filter-year"
              className="cbms-select"
              value={draft.year}
              onChange={(e) => setDraft((prev) => ({ ...prev, year: e.target.value }))}
              style={{ width: "100%" }}
            >
              {FISCAL_YEARS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: From & To */}
          <div>
            <label
              style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text, #334155)" }}
            >
              Date Range
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginBottom: "3px" }}>
                  Start Date (From)
                </span>
                <input
                  type="date"
                  className="cbms-input"
                  value={draft.dateFrom}
                  onChange={(e) => {
                    const nextFrom = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      dateFrom: nextFrom,
                      year: nextFrom ? "all" : prev.year,
                    }));
                  }}
                  style={{ width: "100%", fontSize: "0.825rem", padding: "0.4rem 0.5rem" }}
                />
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "#64748b", marginBottom: "3px" }}>
                  End Date (To)
                </span>
                <input
                  type="date"
                  className="cbms-input"
                  value={draft.dateTo}
                  min={draft.dateFrom || undefined}
                  onChange={(e) => {
                    const nextTo = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      dateTo: nextTo,
                      year: nextTo ? "all" : prev.year,
                    }));
                  }}
                  style={{ width: "100%", fontSize: "0.825rem", padding: "0.4rem 0.5rem" }}
                />
              </div>
            </div>
            {(draft.dateFrom || draft.dateTo) && (
              <div style={{ marginTop: "0.35rem", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, dateFrom: "", dateTo: "" }))}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "0.75rem",
                    color: "#2563eb",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Clear custom dates
                </button>
              </div>
            )}
          </div>

          {/* Ledger Specific: Fund */}
          {activeTab === "ledger" && (
            <div>
              <label
                htmlFor="filter-fund"
                style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text, #334155)" }}
              >
                Fund Account
              </label>
              <select
                id="filter-fund"
                className="cbms-select"
                value={draft.fund}
                onChange={(e) => setDraft((prev) => ({ ...prev, fund: e.target.value }))}
                style={{ width: "100%" }}
              >
                {FUNDS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ledger Specific: Direction */}
          {activeTab === "ledger" && (
            <div>
              <label
                htmlFor="filter-direction"
                style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text, #334155)" }}
              >
                Direction / Flow
              </label>
              <select
                id="filter-direction"
                className="cbms-select"
                value={draft.direction}
                onChange={(e) => setDraft((prev) => ({ ...prev, direction: e.target.value }))}
                style={{ width: "100%" }}
              >
                <option value="all">All directions</option>
                <option value="credit">Collections (Credit / Cash Inflow)</option>
                <option value="debit">Disbursements (Debit / Cash Outflow)</option>
              </select>
            </div>
          )}

          {/* Actions Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "0.5rem",
              paddingTop: "0.85rem",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              style={{ fontSize: "0.825rem", padding: "0.45rem 0.85rem", cursor: "pointer" }}
            >
              Reset All
            </Button>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                style={{ fontSize: "0.825rem", padding: "0.45rem 0.85rem", cursor: "pointer" }}
              >
                Cancel
              </Button>
              <button
                type="submit"
                className="cbms-btn cbms-btn--primary"
                style={{ fontSize: "0.825rem", padding: "0.45rem 1.1rem", cursor: "pointer", fontWeight: 600 }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
