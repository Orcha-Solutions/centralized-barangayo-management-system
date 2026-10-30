"use client";

import * as React from "react";
import { Chip, pesoAmount } from "@cbms/ui";

export interface PlannedItem {
  id: string;
  ppaCode: string;
  title: string;
  sector: "bdf" | "bdrrmf" | "sk" | "gad" | "senior" | "general";
  expenseClass: "PS" | "MOOE" | "CO";
  proposedAmount: number;
  particulars: string;
  priority: "High" | "Medium" | "Low";
}

export interface PlanningTableProps {
  items: PlannedItem[];
  loading?: boolean;
  onDeleteItem?: (item: PlannedItem) => void;
  isEnacted?: boolean;
}

export function PlanningTable({
  items,
  loading = false,
  onDeleteItem,
  isEnacted = false,
}: PlanningTableProps) {
  const sectorBadges: Record<string, { label: string; tone: "blue" | "red" | "gold" | "navy" | "gray" }> = {
    bdf: { label: "20% BDF", tone: "blue" },
    bdrrmf: { label: "5% BDRRMF", tone: "red" },
    sk: { label: "10% SK", tone: "navy" },
    gad: { label: "5% GAD", tone: "gold" },
    senior: { label: "1% Senior/PWD", tone: "gray" },
    general: { label: "General Admin", tone: "gray" },
  };

  const classBadges: Record<string, string> = {
    PS: "Personal Services",
    MOOE: "MOOE",
    CO: "Capital Outlay",
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                height: "40px",
                backgroundColor: "#f1f5f9",
                borderRadius: "4px",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: "3rem 1.5rem",
          textAlign: "center",
          backgroundColor: "#ffffff",
          border: "1px dashed #cbd5e1",
          borderRadius: "8px",
          color: "#64748b",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
        <h4 style={{ margin: "0 0 0.5rem 0", color: "#1e293b", fontSize: "1rem" }}>
          No Planned Program / Project Items Yet
        </h4>
        <p style={{ margin: 0, fontSize: "0.85rem" }}>
          Click <strong>+ Add Planned Item</strong> to allocate proposed programs for the upcoming fiscal year.
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 600 }}>
              <th style={{ padding: "10px 14px", width: "12%" }}>PPA Code</th>
              <th style={{ padding: "10px 14px", width: "30%" }}>Program / Project Title</th>
              <th style={{ padding: "10px 14px", width: "16%" }}>Target Sector</th>
              <th style={{ padding: "10px 14px", width: "12%" }}>Expense Class</th>
              <th style={{ padding: "10px 14px", width: "10%" }}>Priority</th>
              <th style={{ padding: "10px 14px", width: "14%", textAlign: "right" }}>Proposed Amount</th>
              {!isEnacted && <th style={{ padding: "10px 14px", width: "6%", textAlign: "center" }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const sec = sectorBadges[item.sector] || { label: item.sector, tone: "gray" };
              return (
                <tr
                  key={item.id}
                  style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                >
                  <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: 600, color: "#1e293b" }}>
                    {item.ppaCode}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.title}</div>
                    {item.particulars && (
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                        {item.particulars}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <Chip tone={sec.tone}>{sec.label}</Chip>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#334155" }}>
                    <span style={{ fontSize: "0.8rem", padding: "2px 6px", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                      {classBadges[item.expenseClass] || item.expenseClass}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: item.priority === "High" ? "#dc2626" : item.priority === "Medium" ? "#d97706" : "#16a34a",
                      }}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>
                    {pesoAmount(item.proposedAmount)}
                  </td>
                  {!isEnacted && (
                    <td style={{ padding: "10px 14px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => onDeleteItem?.(item)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                          fontSize: "0.9rem",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        }}
                        title="Delete planned item"
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
