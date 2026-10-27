"use client";

import * as React from "react";
import { date, pesoAmount, titleize } from "@cbms/ui";
import type { CertificateRequest } from "../../../../../lib/types";

export interface CertificateStatsProps {
  certificate: CertificateRequest;
}

export function CertificateStats({ certificate: c }: CertificateStatsProps) {
  const isFree = Number(c.fee) === 0;
  const isReleased = c.status === "released" || c.status === "approved";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1rem",
        marginTop: "0.25rem",
      }}
    >
      {/* Stat 1: Statutory Fee */}
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
            Statutory Fee
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: isFree ? "#16a34a" : "var(--cbms-navy, #0a2463)", marginTop: 4 }}>
            {isFree ? "Free" : pesoAmount(c.fee)}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {c.paymentMethod ? titleize(c.paymentMethod.replace(/_/g, " ")) : "OTC Cash"}
            {c.orNumber ? ` · OR #${c.orNumber}` : ""}
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

      {/* Stat 2: Clearance Lifecycle Status */}
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
            Lifecycle Status
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: isReleased ? "#0284c7" : "#0f172a", marginTop: 4 }}>
            {titleize(c.status)}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {isReleased ? "Digitally signed & issued" : "Pending officer authorization"}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: "#eff6ff",
            color: "#0284c7",
            display: "grid",
            placeItems: "center",
            fontSize: "1.3rem",
          }}
        >
          {isReleased ? "✅" : "⏳"}
        </div>
      </div>

      {/* Stat 3: Document Validity Period */}
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
            Validity Period
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: 4 }}>
            {c.type?.validityDays ? `${c.type.validityDays} Days` : "6 Months"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {c.expiresAt ? `Valid until ${date(c.expiresAt)}` : "Counted upon official release"}
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
          📅
        </div>
      </div>

      {/* Stat 4: Security QR Verification */}
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
            Public Verification
          </div>
          <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#475569", marginTop: 6, fontFamily: "monospace" }}>
            {c.verifyCode ? c.verifyCode : "Pending Seal"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {c.verifyCode ? "Live tamper-proof validator" : "Generated upon digital release"}
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
          🛡️
        </div>
      </div>
    </div>
  );
}
