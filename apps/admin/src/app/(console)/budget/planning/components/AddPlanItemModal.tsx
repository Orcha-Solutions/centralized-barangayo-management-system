"use client";

import * as React from "react";
import { Button } from "@cbms/ui";
import type { PlannedItem } from "./PlanningTable";

export interface AddPlanItemModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: Omit<PlannedItem, "id">) => void;
}

export function AddPlanItemModal({ open, onClose, onAdd }: AddPlanItemModalProps) {
  const [ppaCode, setPpaCode] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [sector, setSector] = React.useState<PlannedItem["sector"]>("bdf");
  const [expenseClass, setExpenseClass] = React.useState<PlannedItem["expenseClass"]>("CO");
  const [amount, setAmount] = React.useState("");
  const [particulars, setParticulars] = React.useState("");
  const [priority, setPriority] = React.useState<PlannedItem["priority"]>("Medium");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setPpaCode(`2026-${Math.floor(100 + Math.random() * 900)}`);
      setTitle("");
      setSector("bdf");
      setExpenseClass("CO");
      setAmount("");
      setParticulars("");
      setPriority("Medium");
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(amount);
    if (!title.trim()) {
      setError("Program/Project title is required.");
      return;
    }
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid proposed amount.");
      return;
    }

    onAdd({
      ppaCode: ppaCode.trim(),
      title: title.trim(),
      sector,
      expenseClass,
      proposedAmount: val,
      particulars: particulars.trim(),
      priority,
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        zIndex: 2200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "540px",
          overflow: "hidden",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0a2463" }}>
            Add Planned Program / Project (PPA)
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                PPA Code *
              </label>
              <input
                type="text"
                value={ppaCode}
                onChange={(e) => setPpaCode(e.target.value)}
                className="cbms-input"
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="cbms-select"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Program / Project Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Procurement of 50 Monobloc Chairs for Hall"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="cbms-input"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Target Sector *
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as any)}
                className="cbms-select"
              >
                <option value="bdf">20% Barangay Development (BDF)</option>
                <option value="bdrrmf">5% Disaster Risk (BDRRMF)</option>
                <option value="sk">10% Sangguniang Kabataan (SK)</option>
                <option value="gad">5% Gender & Development (GAD)</option>
                <option value="senior">1% Senior Citizens / PWDs</option>
                <option value="general">General Administrative</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Expense Classification *
              </label>
              <select
                value={expenseClass}
                onChange={(e) => setExpenseClass(e.target.value as any)}
                className="cbms-select"
              >
                <option value="CO">Capital Outlay (CO)</option>
                <option value="MOOE">MOOE (Supplies/Operations)</option>
                <option value="PS">Personal Services (Honoraria)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Proposed Amount (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="cbms-input"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.825rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Particulars / Specifications
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of the proposed procurement or project..."
              value={particulars}
              onChange={(e) => setParticulars(e.target.value)}
              className="cbms-input"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
            <Button variant="default" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              + Save to Draft Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
