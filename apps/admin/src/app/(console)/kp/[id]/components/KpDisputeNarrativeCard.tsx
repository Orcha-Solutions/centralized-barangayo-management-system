"use client";

import * as React from "react";
import { DataTable, dateTime, titleize } from "@cbms/ui";
import type { KpCase } from "../../../../../lib/types";

export interface KpDisputeNarrativeCardProps {
  caseData: KpCase;
}

export function KpDisputeNarrativeCard({ caseData: c }: KpDisputeNarrativeCardProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Narrative & Incident Facts Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f5f9",
            paddingBottom: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem" }}>📝</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
              Dispute Facts & Incident Narrative
            </h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
            DILG KP Form 7 Record
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "0.5rem",
            padding: "1rem 1.25rem",
            fontSize: "0.88rem",
            lineHeight: 1.6,
            color: "#1e293b",
            whiteSpace: "pre-wrap",
            minHeight: "80px",
          }}
        >
          {c.description ? c.description : <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No detailed narrative filed.</span>}
        </div>

        {/* Regulatory Governance Note */}
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "0.375rem",
            fontSize: "0.78rem",
            color: "#1e40af",
            lineHeight: 1.5,
          }}
        >
          ⚖️ <strong>RA 7160 Local Government Code §410:</strong> Proceedings before the Lupon Tagapamayapa and Pangkat ng Tagapagkasundo are informal without technical rules of evidence. All statements given under oath in conciliation proceedings remain strictly confidential.
        </div>
      </div>

      {/* Statutory Documents Issued Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.1rem" }}>📜</span>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
              Statutory Documents & KP Forms Generated
            </h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
            {(c.documents ?? []).length} Document(s) Issued
          </span>
        </div>

        <DataTable
          columns={[
            {
              key: "kind",
              header: "KP Form Statutory Kind",
              render: (d) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.1rem" }}>📄</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--cbms-navy, #0a2463)", fontSize: "0.85rem" }}>
                      {titleize(d.kind)}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      DILG Katarungang Pambarangay Official Form
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "issuedAt",
              header: "Date Issued",
              render: (d) => (
                <span style={{ fontSize: "0.82rem", color: "#475569" }}>
                  {dateTime(d.issuedAt)}
                </span>
              ),
            },
          ]}
          rows={c.documents ?? []}
          empty="No statutory KP forms or notices generated yet for this docket."
        />
      </div>
    </div>
  );
}
