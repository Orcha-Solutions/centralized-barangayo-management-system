"use client";

import * as React from "react";
import { age, date, titleize } from "@cbms/ui";
import type { InhabitantDetail } from "../../../../../lib/types";

export interface InhabitantStatsProps {
  inhabitant: InhabitantDetail;
}

export function InhabitantStats({ inhabitant: p }: InhabitantStatsProps) {
  const completeness = p.completeness ?? 0;
  const isHighCompleteness = completeness >= 80;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
        marginTop: "0.25rem",
      }}
    >
      {/* Stat 1: Form A2 Completeness */}
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
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Profile Completeness
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: isHighCompleteness ? "#16a34a" : "#0f172a", marginTop: 4 }}>
            {completeness}%
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {isHighCompleteness ? "DILG Form A2 compliant" : "Pending complete capture"}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: isHighCompleteness ? "#f0fdf4" : "#eff6ff",
            color: isHighCompleteness ? "#16a34a" : "#1d4ed8",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          📋
        </div>
      </div>

      {/* Stat 2: Resident Age & Demographics */}
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
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Demographics & Age
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: 4 }}>
            {age(p.birthDate) ?? "—"} Yrs
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            Born {date(p.birthDate)} · {titleize(p.sex)}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: "#fffbeb",
            color: "#d97706",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          🎂
        </div>
      </div>

      {/* Stat 3: Household Registry Affiliation */}
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
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Household Folder
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--cbms-navy, #0a2463)", marginTop: 4 }}>
            {p.household?.householdNo ? `#${p.household.householdNo}` : "Individual"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {p.household?.purok ? `Purok ${p.household.purok}` : "Unattached to household"}
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
          🏠
        </div>
      </div>

      {/* Stat 4: Voter Status */}
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
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Voter Registry
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: p.isRegisteredVoter ? "#0284c7" : "#64748b", marginTop: 4 }}>
            {p.isRegisteredVoter ? "Voter" : "Non-Voter"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {p.isRegisteredVoter ? `COMELEC verified (Last voted: ${p.lastVotedYear || "2025"})` : "Not registered in barangay precinct"}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: "#faf5ff",
            color: "#7c3aed",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          🗳️
        </div>
      </div>
    </div>
  );
}
