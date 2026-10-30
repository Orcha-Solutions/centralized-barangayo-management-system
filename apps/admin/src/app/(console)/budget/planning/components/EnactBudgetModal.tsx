"use client";

import * as React from "react";
import { Button, pesoAmount } from "@cbms/ui";
import type { PlannedItem } from "./PlanningTable";

export interface EnactBudgetModalProps {
  open: boolean;
  onClose: () => void;
  plannedItems: PlannedItem[];
  totalPlannedAmount: number;
  totalAnnualBudget: number;
  onConfirmEnact: (ordinanceNo: string, dateEnacted: string) => Promise<void>;
  busy?: boolean;
}

export function EnactBudgetModal({
  open,
  onClose,
  plannedItems,
  totalPlannedAmount,
  totalAnnualBudget,
  onConfirmEnact,
  busy = false,
}: EnactBudgetModalProps) {
  const [ordinanceNo, setOrdinanceNo] = React.useState("SBO-2026-001");
  const [dateEnacted, setDateEnacted] = React.useState(new Date().toISOString().slice(0, 10));
  const [typedConfirm, setTypedConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setOrdinanceNo("SBO-2026-001");
      setDateEnacted(new Date().toISOString().slice(0, 10));
      setTypedConfirm("");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  // Group items by sector for summary
  const sectorTotals: Record<string, number> = {};
  plannedItems.forEach((item) => {
    sectorTotals[item.sector] = (sectorTotals[item.sector] || 0) + item.proposedAmount;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ordinanceNo.trim()) {
      setError("Appropriations Ordinance number is required.");
      return;
    }
    if (typedConfirm.trim().toUpperCase() !== "ENACT") {
      setError("Please type 'ENACT' to confirm enacting the budget into law.");
      return;
    }

    try {
      await onConfirmEnact(ordinanceNo.trim(), dateEnacted);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to enact budget.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 2300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "520px",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.25rem" }}>🏛️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#166534" }}>
                Enact Budget into Statutory Law
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#15803d" }}>
                Enacts draft into Sangguniang Barangay Appropriations
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: busy ? "not-allowed" : "pointer", color: "#64748b" }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {error && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: "8px 12px", borderRadius: "6px", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          {/* Allocation summary box */}
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "#64748b" }}>Annual Budget Ceiling:</span>
              <strong style={{ fontFamily: "monospace" }}>{pesoAmount(totalAnnualBudget)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ color: "#64748b" }}>Total Programmed:</span>
              <strong style={{ fontFamily: "monospace", color: "#1d4ed8" }}>{pesoAmount(totalPlannedAmount)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed #cbd5e1", paddingTop: "4px" }}>
              <span style={{ color: "#64748b" }}>Sectors to Initialize:</span>
              <strong>{Object.keys(sectorTotals).length} Active Sectors</strong>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Appropriation Ordinance Number *
            </label>
            <input
              type="text"
              placeholder="e.g. SBO-2026-001"
              value={ordinanceNo}
              onChange={(e) => setOrdinanceNo(e.target.value)}
              className="cbms-input"
              required
              disabled={busy}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Date Enacted by Sanggunian *
            </label>
            <input
              type="date"
              value={dateEnacted}
              onChange={(e) => setDateEnacted(e.target.value)}
              className="cbms-input"
              required
              disabled={busy}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Type <strong>ENACT</strong> to confirm authorization *
            </label>
            <input
              type="text"
              placeholder="ENACT"
              value={typedConfirm}
              onChange={(e) => setTypedConfirm(e.target.value)}
              className="cbms-input"
              required
              disabled={busy}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
            <Button variant="default" size="sm" type="button" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={busy || typedConfirm.trim().toUpperCase() !== "ENACT"}
              style={{ backgroundColor: "#16a34a" }}
            >
              {busy ? "Enacting..." : "✓ Confirm & Push to Statutory"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
