"use client";

import * as React from "react";
import { Field, StatusChip, date, titleize } from "@cbms/ui";
import { KP_ADVANCE_STAGES } from "../../../../../lib/labels";
import type { KpCase } from "../../../../../lib/types";

export interface KpStageProgressionCardProps {
  caseData: KpCase;
  mayAdvance: boolean;
  stage: string;
  setStage: (stage: string) => void;
  settlementTerms: string;
  setSettlementTerms: (terms: string) => void;
  cfaReason: string;
  setCfaReason: (reason: string) => void;
  isAdvancing: boolean;
  onAdvance: (e: React.FormEvent) => void;
}

export function KpStageProgressionCard({
  caseData: c,
  mayAdvance,
  stage,
  setStage,
  settlementTerms,
  setSettlementTerms,
  cfaReason,
  setCfaReason,
  isAdvancing,
  onAdvance,
}: KpStageProgressionCardProps) {
  const isClosed = Boolean(c.closedAt);
  const isLocked = Boolean(c.isLocked);

  return (
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
          <span style={{ fontSize: "1.1rem" }}>⚡</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
              Statutory Stage & Progression
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              RA 7160 §410 Conciliation Progression Tracker
            </span>
          </div>
        </div>
        <StatusChip status={c.stage} />
      </div>

      <div style={{ padding: "1.5rem" }}>
        {/* If Case is already Closed / Settled */}
        {isClosed ? (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0.75rem 1rem",
                borderRadius: "0.375rem",
                backgroundColor: c.stage === "settled" ? "#f0fdf4" : "#fef2f2",
                border: c.stage === "settled" ? "1px solid #bbf7d0" : "1px solid #fecaca",
                fontSize: "0.85rem",
                color: c.stage === "settled" ? "#166534" : "#991b1b",
                fontWeight: 600,
              }}
            >
              <span>{c.stage === "settled" ? "✅" : "📜"}</span>
              <span>
                Case closed and finalized on {date(c.closedAt)} ({titleize(c.stage)}).
              </span>
            </div>

            {/* Settlement Terms */}
            {c.settlementTerms && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534", marginBottom: 4 }}>
                  🤝 Amicable Settlement Terms (KP Form 16):
                </div>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    padding: "0.85rem",
                    borderRadius: "0.375rem",
                    color: "#14532d",
                  }}
                >
                  {c.settlementTerms}
                </div>
              </div>
            )}

            {/* CFA Grounds */}
            {c.cfaReason && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>
                  📜 Certification to File Action Grounds (KP Form 20):
                </div>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    padding: "0.85rem",
                    borderRadius: "0.375rem",
                    color: "#7f1d1d",
                  }}
                >
                  {c.cfaReason}
                </div>
              </div>
            )}
          </div>
        ) : isLocked ? (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              borderRadius: "0.375rem",
              fontSize: "0.85rem",
              color: "#92400e",
              lineHeight: 1.5,
            }}
          >
            🔒 <strong>Case Docket Locked:</strong> Stage advancement is disabled because this docket is locked.
          </div>
        ) : !mayAdvance ? (
          <div
            style={{
              padding: "1.25rem",
              textAlign: "center",
              color: "#64748b",
              backgroundColor: "#f8fafc",
              borderRadius: "0.5rem",
              border: "1px dashed #cbd5e1",
              fontSize: "0.82rem",
            }}
          >
            Only the Punong Barangay or authorized Lupon Secretary may advance statutory stages.
          </div>
        ) : (
          <form onSubmit={onAdvance} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Field label="Advance to Statutory Stage *">
              <select
                className="cbms-select"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                disabled={isAdvancing}
              >
                {KP_ADVANCE_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>

            {stage === "settled" && (
              <Field
                label="Amicable Settlement Terms *"
                hint="Recorded automatically on statutory KP Form 16."
              >
                <textarea
                  className="cbms-textarea"
                  rows={4}
                  placeholder="Record mutual stipulations, restitution terms, payment schedule, or mutual undertakings..."
                  value={settlementTerms}
                  onChange={(e) => setSettlementTerms(e.target.value)}
                  required
                  disabled={isAdvancing}
                />
              </Field>
            )}

            {stage === "cfa_issued" && (
              <Field
                label="Grounds for Certificate to File Action (CFA) *"
                hint="Statutory grounds conforming to DILG KP Form 20 standards."
              >
                <textarea
                  className="cbms-textarea"
                  rows={4}
                  placeholder="Specify failure of conciliation, respondent's refusal to appear, or lack of settlement..."
                  value={cfaReason}
                  onChange={(e) => setCfaReason(e.target.value)}
                  required
                  disabled={isAdvancing}
                />
              </Field>
            )}

            <button
              type="submit"
              className="cbms-btn cbms-btn--primary"
              disabled={isAdvancing}
              style={{
                padding: "0.6rem 1.25rem",
                backgroundColor: "var(--cbms-navy, #0a2463)",
                borderColor: "var(--cbms-navy, #0a2463)",
                color: "#ffffff",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
              }}
            >
              {isAdvancing && <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>}
              <span>{isAdvancing ? "Advancing Stage..." : "Advance Statutory Stage"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
