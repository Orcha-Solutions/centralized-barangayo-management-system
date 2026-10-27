"use client";

import * as React from "react";
import { Chip, KeyValue, Panel, fullName, titleize } from "@cbms/ui";
import { EmptyNote } from "../../../../../components/common";
import type { CertificateRequest } from "../../../../../lib/types";

export interface CertificateApplicantCardProps {
  certificate: CertificateRequest;
}

export function CertificateApplicantCard({ certificate: c }: CertificateApplicantCardProps) {
  const [copiedCode, setCopiedCode] = React.useState(false);

  const handleCopyCode = () => {
    if (!c.verifyCode) return;
    navigator.clipboard?.writeText(c.verifyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const inhab = c.inhabitant;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Card 1: Resident Applicant Profile */}
      <Panel title="👤 Applicant Resident Dossier">
        {inhab ? (
          <div>
            {/* Header snippet with avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                paddingBottom: "1rem",
                marginBottom: "1rem",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1d4ed8",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {inhab.firstName?.charAt(0) || "R"}
                {inhab.lastName?.charAt(0) || "D"}
              </div>

              <div>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
                  {fullName(inhab as any)}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>
                  {inhab.isVoter ? "✅ Registered Barangay Voter" : "Citizen / Non-Voter"}
                  {inhab.household?.purok ? ` · Purok ${inhab.household.purok}` : ""}
                </div>
              </div>
            </div>

            <KeyValue
              items={[
                ["PhilSys Card (PCN)", inhab.philsysNo ? <code key="pcn" style={{ backgroundColor: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>{inhab.philsysNo}</code> : "Not Linked / Unspecified"],
                ["Civil Status", titleize(inhab.civilStatus ?? "Single")],
                ["Sex / Gender", titleize(inhab.sex ?? inhab.gender ?? "Unspecified")],
                ["Contact Telephone", inhab.contactPhone || "—"],
                ["Email Address", inhab.contactEmail || "—"],
                ["Registered Household", inhab.household?.householdNo ? `Household #${inhab.household.householdNo}` : "Individual Resident Record"],
                ["Residence Address", inhab.household?.addressLine || "Barangay Jurisdiction"],
              ]}
            />
          </div>
        ) : (
          <EmptyNote>Walk-in resident record (no linked inhabitant profile).</EmptyNote>
        )}
      </Panel>

      {/* Card 2: Security & Digital Verification Code */}
      <Panel title="🛡️ Digital Verification & QR Seal">
        {c.verifyCode ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.85rem 1rem",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Official Verification Code
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", fontFamily: "monospace", letterSpacing: "0.05em", marginTop: 2 }}>
                  {c.verifyCode}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  background: copiedCode ? "#dcfce7" : "#ffffff",
                  border: `1px solid ${copiedCode ? "#86efac" : "#cbd5e1"}`,
                  color: copiedCode ? "#15803d" : "#475569",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {copiedCode ? "✓ Copied" : "📋 Copy Code"}
              </button>
            </div>

            <div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.45 }}>
              This tamper-proof alphanumeric key matches the statutory QR code embedded on the printed document, allowing third-party agencies, employers, and banks to verify authenticity directly against the official barangay ledger.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "0.82rem", color: "#64748b", padding: "0.5rem 0" }}>
            The unique cryptographic verification code and QR seal are automatically provisioned and activated once this request is <strong>Approved & Released</strong>.
          </div>
        )}
      </Panel>
    </div>
  );
}
