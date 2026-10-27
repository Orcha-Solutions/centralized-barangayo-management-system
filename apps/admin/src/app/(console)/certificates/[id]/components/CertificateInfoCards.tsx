"use client";

import * as React from "react";
import { Alert, KeyValue, Panel, date, pesoAmount, titleize } from "@cbms/ui";
import type { CertificateRequest } from "../../../../../lib/types";

export interface CertificateInfoCardsProps {
  certificate: CertificateRequest;
}

export function CertificateInfoCards({ certificate: c }: CertificateInfoCardsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Card 1: Request & Issuance Specification */}
      <Panel title="📋 Request & Issuance Specification">
        <KeyValue
          items={[
            ["Reference Number", <strong key="ref" style={{ color: "var(--cbms-navy, #0a2463)" }}>{c.referenceNo}</strong>],
            ["Certificate Classification", `${c.type?.name ?? "Barangay Clearance"} (${c.type?.code ?? "BC"})`],
            ["Stated Purpose", c.purpose || "—"],
            ["Statutory Clearance Fee", Number(c.fee) === 0 ? "Free (Exempt)" : pesoAmount(c.fee)],
            ["Payment Channel", c.paymentMethod ? titleize(c.paymentMethod.replace(/_/g, " ")) : "Over-The-Counter Cash"],
            ["Official Receipt (OR) No.", c.orNumber ? <span key="or" style={{ fontWeight: 600, color: "#15803d" }}>#{c.orNumber}</span> : "Not issued / Pending payment"],
            ["Filing Source Channel", c.source ? `${c.source} Registration` : "Barangay Desk"],
            ["Application Lodged", date(c.submittedAt || c.createdAt)],
            ["Date Officially Issued", c.issuedAt ? date(c.issuedAt) : "Pending official release"],
            ["Statutory Expiry Date", c.expiresAt ? date(c.expiresAt) : "Calculated upon issuance"],
          ]}
        />
      </Panel>

      {/* Card 2: Regulatory Parity & Audit Governance */}
      <Panel title="⚖️ Statutory Parity & Governance">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {c.rejectedReason && (
            <Alert tone="danger">
              <strong>Official Rejection Recorded:</strong> {c.rejectedReason}
            </Alert>
          )}

          <div
            style={{
              padding: "0.85rem 1rem",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "0.83rem",
              color: "#334155",
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>
              Republic Act No. 7160 (Local Government Code of 1991, Sec. 152)
            </div>
            Clearances and certifications issued by the Punong Barangay attest to resident identity, community good standing, or compliance with local statutory ordinances. All actions are logged into the barangay immutable audit trail conforming to Republic Act 11032 (Ease of Doing Business & Efficient Government Service Delivery).
          </div>
        </div>
      </Panel>
    </div>
  );
}
