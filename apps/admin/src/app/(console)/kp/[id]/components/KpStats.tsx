"use client";

import * as React from "react";
import { date, titleize } from "@cbms/ui";
import { DeadlineCell } from "../../../../../components/common";
import type { KpCase } from "../../../../../lib/types";

export interface KpStatsProps {
  caseData: KpCase;
}

export function KpStats({ caseData: c }: KpStatsProps) {
  const isSettled = c.stage === "settled";
  const isCfa = c.stage === "cfa_issued";
  const isClosed = Boolean(c.closedAt);

  const stageLabel = React.useMemo(() => {
    switch (c.stage) {
      case "mediation":
        return "Mediation (PB)";
      case "conciliation":
        return "Conciliation (Pangkat)";
      case "arbitration":
        return "Arbitration";
      case "settled":
        return "Amicably Settled";
      case "cfa_issued":
        return "CFA Issued";
      case "repudiated":
        return "Repudiated";
      default:
        return titleize(c.stage || "Mediation");
    }
  }, [c.stage]);

  const hearingsCount = c._count?.hearings ?? c.hearings?.length ?? 0;
  const attendedHearings = (c.hearings ?? []).filter((h) => h.attended === true).length;

  const partiesCount = (c.parties ?? []).length;
  const complainantsCount = (c.parties ?? []).filter((p) => p.role === "complainant").length;
  const respondentsCount = (c.parties ?? []).filter((p) => p.role === "respondent").length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
        marginTop: "0.25rem",
      }}
    >
      {/* Stat 1: Statutory Stage & Forum */}
      <div
        style={{
          backgroundColor: "var(--color-bg-card, #ffffff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: "12px",
          padding: "1.2rem 1.4rem",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Statutory Stage
          </div>
          <div
            style={{
              fontSize: "1.45rem",
              fontWeight: 800,
              color: isSettled ? "#16a34a" : isCfa ? "#dc2626" : "var(--cbms-navy, #0a2463)",
              marginTop: 4,
            }}
          >
            {stageLabel}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {isClosed ? `Closed on ${date(c.closedAt)}` : "Ongoing Barangay Conciliation"}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: isSettled ? "#f0fdf4" : isCfa ? "#fef2f2" : "#eff6ff",
            color: isSettled ? "#16a34a" : isCfa ? "#dc2626" : "#2563eb",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          {isSettled ? "🤝" : isCfa ? "📜" : "⚖️"}
        </div>
      </div>

      {/* Stat 2: Statutory Clock (RA 7160 §410) */}
      <div
        style={{
          backgroundColor: "var(--color-bg-card, #ffffff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: "12px",
          padding: "1.2rem 1.4rem",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Statutory Clock (§410)
          </div>
          <div style={{ marginTop: 6, fontSize: "0.95rem" }}>
            <DeadlineCell
              dueAt={c.deadline?.dueAt}
              daysRemaining={c.deadline?.daysRemaining}
              breached={c.deadline?.breached}
            />
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>
            {c.deadline?.dueAt ? `Mandatory Deadline: ${date(c.deadline.dueAt)}` : "15-day PB mediation period"}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: c.deadline?.breached ? "#fee2e2" : "#fef3c7",
            color: c.deadline?.breached ? "#dc2626" : "#d97706",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          ⏱️
        </div>
      </div>

      {/* Stat 3: Hearing Sessions */}
      <div
        style={{
          backgroundColor: "var(--color-bg-card, #ffffff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: "12px",
          padding: "1.2rem 1.4rem",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Hearings Convened
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--cbms-navy, #0a2463)", marginTop: 4 }}>
            {hearingsCount}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {attendedHearings} attended · {hearingsCount - attendedHearings} pending/no-show
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: "#f5f3ff",
            color: "#7c3aed",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          📅
        </div>
      </div>

      {/* Stat 4: Dispute Parties */}
      <div
        style={{
          backgroundColor: "var(--color-bg-card, #ffffff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: "12px",
          padding: "1.2rem 1.4rem",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Dispute Parties
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--cbms-navy, #0a2463)", marginTop: 4 }}>
            {partiesCount}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {complainantsCount} Complainant · {respondentsCount} Respondent
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: "#f0fdf4",
            color: "#16a34a",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          👥
        </div>
      </div>
    </div>
  );
}
