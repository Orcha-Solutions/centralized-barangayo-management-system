"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { StatusChip, date, fullName } from "@cbms/ui";
import { CertificateDetailActions } from "../../components/CertificateDetailActions";
import type { CertificateRequest } from "../../../../../lib/types";

export interface CertificateHeroProps {
  certificate: CertificateRequest;
  busy: boolean;
  mayApprove: boolean;
  mayDelete: boolean;
  actionable: boolean;
  onPrint: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}

export function CertificateHero({
  certificate: c,
  busy,
  mayApprove,
  mayDelete,
  actionable,
  onPrint,
  onApprove,
  onReject,
  onDelete,
}: CertificateHeroProps) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const handleCopyNo = () => {
    navigator.clipboard?.writeText(c.referenceNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applicant = c.inhabitant ? fullName(c.inhabitant as any) : "Walk-in Resident";

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-card, #ffffff)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "14px",
        padding: "1.75rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 8px 16px -4px rgba(0, 0, 0, 0.03)",
        position: "relative",
      }}
    >
      {/* Decorative subtle backdrop accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #0a2463 0%, #0284c7 50%, #f59e0b 100%)",
          borderTopLeftRadius: "14px",
          borderTopRightRadius: "14px",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", minWidth: 280 }}>
          {/* Certificate Badge Icon */}
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "12px",
              backgroundColor: "#f0f9ff",
              border: "1px solid #bae6fd",
              display: "grid",
              placeItems: "center",
              fontSize: "1.75rem",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(2, 132, 199, 0.08)",
            }}
          >
            📜
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--color-text, #0f172a)",
                }}
              >
                {c.referenceNo}
              </h1>

              <button
                type="button"
                onClick={handleCopyNo}
                title="Copy reference number"
                style={{
                  background: copied ? "#dcfce7" : "#f1f5f9",
                  border: `1px solid ${copied ? "#86efac" : "#cbd5e1"}`,
                  color: copied ? "#15803d" : "#475569",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {copied ? "✓ Copied" : "📋 Copy"}
              </button>

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#0369a1",
                  backgroundColor: "#e0f2fe",
                  padding: "2px 8px",
                  borderRadius: 999,
                  letterSpacing: "0.03em",
                }}
              >
                DILG STATUTORY CLEARANCE
              </span>

              <StatusChip status={c.status} />
            </div>

            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#1e293b",
                marginTop: 4,
              }}
            >
              {c.type?.name ?? "Barangay Clearance Document"}
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>👤 <strong>{applicant}</strong></span>
              <span>·</span>
              <span>🎯 Purpose: <em>{c.purpose || "General legal requirements"}</em></span>
              <span>·</span>
              <span>📅 Lodged: {date(c.submittedAt || c.createdAt)}</span>
              {c.source && (
                <>
                  <span>·</span>
                  <span style={{ textTransform: "uppercase", fontSize: "0.75rem", backgroundColor: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>
                    {c.source}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls in Hero */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            className="cbms-btn adm-noprint"
            onClick={() => router.push("/certificates")}
          >
            ← Back to List
          </button>

          <CertificateDetailActions
            certificate={c}
            busy={busy}
            mayApprove={mayApprove}
            mayDelete={mayDelete}
            actionable={actionable}
            onPrint={onPrint}
            onApprove={onApprove}
            onReject={onReject}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
