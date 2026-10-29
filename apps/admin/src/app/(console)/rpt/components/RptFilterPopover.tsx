"use client";

import * as React from "react";
import { Button } from "@cbms/ui";
import type { RptFilterState } from "../../../../store/useRptStore";

export interface RptFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  values: RptFilterState;
  onApply: (next: RptFilterState) => void;
  onReset: () => void;
}

const CURRENT_YEAR = new Date().getFullYear();
export const RPT_TAX_YEARS = [
  { value: "all", label: "All tax years" },
  { value: String(CURRENT_YEAR), label: `FY ${CURRENT_YEAR} (Current)` },
  { value: String(CURRENT_YEAR - 1), label: `FY ${CURRENT_YEAR - 1}` },
  { value: String(CURRENT_YEAR - 2), label: `FY ${CURRENT_YEAR - 2}` },
  { value: String(CURRENT_YEAR - 3), label: `FY ${CURRENT_YEAR - 3}` },
  { value: String(CURRENT_YEAR - 4), label: `FY ${CURRENT_YEAR - 4}` },
];

export const RPT_PROPERTY_TYPES = [
  { value: "all", label: "All classifications" },
  { value: "residential", label: "Residential (20% Level)" },
  { value: "commercial", label: "Commercial (50% Level)" },
  { value: "industrial", label: "Industrial (50% Level)" },
  { value: "agricultural", label: "Agricultural (40% Level)" },
  { value: "special", label: "Special Class (10% Level)" },
];

export const RPT_PAYMENT_STATUSES = [
  { value: "all", label: "All payment statuses" },
  { value: "fully_paid", label: "Paid (Settled)" },
  { value: "unpaid", label: "Unpaid / Delinquent" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "exempt", label: "Tax Exempt" },
];

export const RPT_PUROKS = [
  { value: "all", label: "All puroks" },
  { value: "Purok 1", label: "Purok 1" },
  { value: "Purok 2", label: "Purok 2" },
  { value: "Purok 3", label: "Purok 3" },
  { value: "Purok 4", label: "Purok 4" },
  { value: "Purok 5", label: "Purok 5" },
  { value: "Purok 6", label: "Purok 6" },
  { value: "Purok 7", label: "Purok 7" },
];

export function RptFilterPopover({
  isOpen,
  onClose,
  values,
  onApply,
  onReset,
}: RptFilterPopoverProps) {
  const [draft, setDraft] = React.useState<RptFilterState>(values);

  React.useEffect(() => {
    if (isOpen) {
      setDraft({
        year: values.year,
        dateFrom: values.dateFrom,
        dateTo: values.dateTo,
        propertyType: values.propertyType,
        paymentStatus: values.paymentStatus,
        purok: values.purok,
      });
    }
  }, [
    isOpen,
    values.year,
    values.dateFrom,
    values.dateTo,
    values.propertyType,
    values.paymentStatus,
    values.purok,
  ]);

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
    const empty: RptFilterState = {
      year: "all",
      dateFrom: "",
      dateTo: "",
      propertyType: "all",
      paymentStatus: "all",
      purok: "all",
    };
    setDraft(empty);
    onReset();
    onClose();
  };

  const activeCount = [
    draft.year !== "all",
    Boolean(draft.dateFrom),
    Boolean(draft.dateTo),
    draft.propertyType !== "all",
    draft.paymentStatus !== "all",
    draft.purok !== "all",
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
        aria-label="RPT filter configuration"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          width: "440px",
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
              Filter RPT Property Declarations
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

        {/* Form Body */}
        <form onSubmit={handleApply} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.95rem" }}>
          {/* Tax Year & Purok Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
            <div>
              <label
                htmlFor="rpt-filter-year"
                style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text, #334155)" }}
              >
                Tax Year
              </label>
              <select
                id="rpt-filter-year"
                className="cbms-select"
                value={draft.year}
                onChange={(e) => setDraft((prev) => ({ ...prev, year: e.target.value }))}
                style={{ width: "100%" }}
              >
                {RPT_TAX_YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="rpt-filter-purok"
                style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text, #334155)" }}
              >
                Purok / Zone
              </label>
              <select
                id="rpt-filter-purok"
                className="cbms-select"
                value={draft.purok}
                onChange={(e) => setDraft((prev) => ({ ...prev, purok: e.target.value }))}
                style={{ width: "100%" }}
              >
                {RPT_PUROKS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range: From & To */}
          <div>
            <label
              style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text, #334155)" }}
            >
              Declaration Date Range
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
          </div>

          {/* Property Classification */}
          <div>
            <label
              htmlFor="rpt-filter-type"
              style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text, #334155)" }}
            >
              Property Classification
            </label>
            <select
              id="rpt-filter-type"
              className="cbms-select"
              value={draft.propertyType}
              onChange={(e) => setDraft((prev) => ({ ...prev, propertyType: e.target.value }))}
              style={{ width: "100%" }}
            >
              {RPT_PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label
              htmlFor="rpt-filter-status"
              style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--color-text, #334155)" }}
            >
              Tax Payment Status
            </label>
            <select
              id="rpt-filter-status"
              className="cbms-select"
              value={draft.paymentStatus}
              onChange={(e) => setDraft((prev) => ({ ...prev, paymentStatus: e.target.value }))}
              style={{ width: "100%" }}
            >
              {RPT_PAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "0.75rem",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              marginTop: "0.25rem",
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted, #64748b)",
                fontSize: "0.825rem",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
                padding: "4px 0",
              }}
            >
              Reset all filters
            </button>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Apply Filters
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
