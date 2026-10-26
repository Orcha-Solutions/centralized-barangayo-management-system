"use client";

import * as React from "react";
import { peso, titleize } from "@cbms/ui";
import type { Household } from "../../../../../lib/types";

export interface HouseholdStatsProps {
  household: Household;
}

export function HouseholdStats({ household: h }: HouseholdStatsProps) {
  const membersCount = h.members?.length ?? h.numMembers ?? 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
        marginTop: "1.25rem",
      }}
    >
      {/* Stat 1: Members */}
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
            Family Members
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--cbms-navy, #0a2463)", marginTop: 4 }}>
            {membersCount}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            Registered domestic inhabitants
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          👥
        </div>
      </div>

      {/* Stat 2: Monthly Income */}
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
            Monthly Income
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: 4 }}>
            {h.monthlyIncome ? peso(h.monthlyIncome) : "₱0.00"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            Estimated aggregate earnings
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
          💵
        </div>
      </div>

      {/* Stat 3: Dwelling & Tenure */}
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
            Tenure & Dwelling
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginTop: 6, lineHeight: 1.2 }}>
            {titleize(h.tenureStatus || "Owner")}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>
            {titleize(h.housingUnit || "Single House")}
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
          🏡
        </div>
      </div>

      {/* Stat 4: Social Assistance */}
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
            Social Protection
          </div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: h.is4Ps ? "#15803d" : "#475569", marginTop: 6, lineHeight: 1.2 }}>
            {h.is4Ps ? "4Ps Beneficiary" : "Non-4Ps"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 4 }}>
            {h.numFamilies || 1} family unit(s)
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: h.is4Ps ? "#f0fdf4" : "#f1f5f9",
            color: h.is4Ps ? "#16a34a" : "#64748b",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          🛡️
        </div>
      </div>
    </div>
  );
}
