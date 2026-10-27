"use client";

import * as React from "react";

export interface KpGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function KpGuideModal({ open, onClose }: KpGuideModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 620,
          backgroundColor: "#ffffff",
          borderRadius: "0.5rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.25rem" }}>⚖️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--cbms-navy, #0a2463)" }}>
                Katarungang Pambarangay Guide
              </div>
              <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                Republic Act No. 7160 §410 Statutory Conciliation Process
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cbms-btn cbms-btn--subtle"
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "1.25rem", maxHeight: "70vh", overflowY: "auto", fontSize: "0.86rem", lineHeight: 1.55 }}>
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy, #0a2463)", marginBottom: "0.25rem" }}>
              1. Intake & Punong Barangay Mediation (15-Day Clock)
            </div>
            <div style={{ color: "#475569" }}>
              Upon complaint filing, the Punong Barangay issues a Summons (KP Form 7). The mediation period is strictly <strong>15 calendar days</strong>. If the parties fail to reach an amicable settlement, the dispute is certified for Pangkat constitution.
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy, #0a2463)", marginBottom: "0.25rem" }}>
              2. Conciliation by Pangkat ng Tagapagkasundo (15-Day Clock)
            </div>
            <div style={{ color: "#475569" }}>
              A 3-member Pangkat panel convenes to hear the dispute. The conciliation period is <strong>15 calendar days</strong> from constitution (extendable by another 15 days for meritorious grounds).
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy, #0a2463)", marginBottom: "0.25rem" }}>
              3. Amicable Settlement (KP Form 16) vs. CFA (KP Form 20)
            </div>
            <div style={{ color: "#475569" }}>
              When resolved, an <strong>Amicable Settlement</strong> is executed with the force of a final judgment after 10 days. If settlement fails or respondent repudiates, the Lupon issues a <strong>Certificate to File Action (CFA)</strong> allowing the case to proceed to regular courts.
            </div>
          </div>

          <div style={{ padding: "0.75rem", borderRadius: "0.375rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca" }}>
            <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: "0.25rem", fontSize: "0.82rem" }}>
              🔒 Confidential VAWC / Child Protection Proceedings
            </div>
            <div style={{ color: "#7f1d1d", fontSize: "0.8rem" }}>
              Domestic matters governed by RA 9262 are restricted to authorized desk officers and Punong Barangay to preserve absolute statutory confidentiality.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderTop: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "#f8fafc",
          }}
        >
          <button type="button" className="cbms-btn cbms-btn--primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
