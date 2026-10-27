"use client";

import * as React from "react";
import type { KpCase } from "../../../../lib/types";
import { date, dateTime, titleize } from "@cbms/ui";

export interface KpPrintModalProps {
  open: boolean;
  caseData: KpCase | null;
  onClose: () => void;
}

export function KpPrintModal({ open, caseData, onClose }: KpPrintModalProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !caseData) return null;

  const c = caseData;
  const complainants = (c.parties ?? []).filter((p) => p.role === "complainant");
  const respondents = (c.parties ?? []).filter((p) => p.role === "respondent");

  return (
    <div
      id="kp-print-modal-root"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "1.5rem",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <style>{`
        @media print {
          /* Hide all peripheral application shells & non-print controls */
          .cbms-sidebar,
          .cbms-topbar,
          .cbms-mock-banner,
          .cbms-page-head,
          .cbms-detail,
          .adm-noprint {
            display: none !important;
          }

          /* Ensure body allows natural document printing */
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Reset modal fixed overlay to normal flow */
          #kp-print-modal-root {
            position: static !important;
            inset: auto !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          /* Format official paper sheet */
          #kp-official-print-docket {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: block !important;
          }

          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
      `}</style>

      {/* Top Action Bar (Preview & Controls) */}
      <div
        className="adm-noprint"
        style={{
          width: "100%",
          maxWidth: "850px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#1e293b",
          color: "#ffffff",
          padding: "0.75rem 1.25rem",
          borderRadius: "0.5rem 0.5rem 0 0",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.2rem" }}>⚖️</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
              Official KP Docket Sheet — {c.caseNo}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Conforming to DILG Katarungang Pambarangay Statutory Formats (RA 7160)
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            🖨️ Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              color: "#cbd5e1",
              border: "1px solid #475569",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.375rem",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Printable Sheet (Paper Dimensions) */}
      <div
        id="kp-official-print-docket"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "850px",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          padding: "2.5rem 3rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          borderRadius: "0 0 0.5rem 0.5rem",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          lineHeight: "1.5",
          fontSize: "11pt",
        }}
      >
        {/* Official Philippine Government Header */}
        <div style={{ textAlign: "center", borderBottom: "2px solid #0a2463", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ textTransform: "uppercase", fontSize: "10pt", letterSpacing: "0.1em", color: "#475569", marginBottom: 2 }}>
            Republic of the Philippines
          </div>
          <div style={{ textTransform: "uppercase", fontSize: "9.5pt", letterSpacing: "0.08em", color: "#475569", marginBottom: 2 }}>
            National Capital Region · City of Mandaluyong
          </div>
          <div style={{ fontSize: "14pt", fontWeight: 800, color: "#0a2463", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            BARANGAY BARANGKA
          </div>
          <div style={{ fontSize: "12pt", fontWeight: 700, color: "#b45309", letterSpacing: "0.04em", marginTop: 2, textTransform: "uppercase" }}>
            OFFICE OF THE LUPONG TAGAPAMAYAPA
          </div>
          <div style={{ fontSize: "9pt", fontStyle: "italic", color: "#64748b", marginTop: 4 }}>
            Katarungang Pambarangay Dispute Resolution System (R.A. 7160 Chapter 7)
          </div>
        </div>

        {/* Docket Metadata Top Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            padding: "0.6rem 1rem",
            borderRadius: "0.375rem",
            marginBottom: "1.25rem",
            fontSize: "10pt",
          }}
        >
          <div>
            <strong>CASE DOCKET NO:</strong>{" "}
            <span style={{ fontFamily: "monospace", fontSize: "11pt", fontWeight: 700, color: "#0a2463" }}>
              {c.caseNo}
            </span>
          </div>
          <div>
            <strong>DATE FILED:</strong> {date(c.filedAt)}
          </div>
          <div>
            <strong>STAGE:</strong>{" "}
            <span style={{ fontWeight: 700, textTransform: "uppercase", color: "#0369a1" }}>
              {titleize(c.stage)}
            </span>
          </div>
        </div>

        {/* Dispute Parties Layout (Court / Lupon Style) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "1.25rem",
            border: "1px solid #cbd5e1",
            borderRadius: "0.375rem",
            padding: "1rem",
            marginBottom: "1.25rem",
            backgroundColor: "#ffffff",
          }}
        >
          <div>
            <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: 3, marginBottom: 6 }}>
              Complainant(s):
            </div>
            {complainants.length === 0 ? (
              <div style={{ fontStyle: "italic", color: "#94a3b8" }}>— No complainant recorded —</div>
            ) : (
              complainants.map((p, idx) => (
                <div key={p.id || idx} style={{ marginBottom: 6 }}>
                  <strong style={{ fontSize: "10.5pt", color: "#0f172a" }}>
                    {p.inhabitant ? `${p.inhabitant.firstName} ${p.inhabitant.lastName}` : (p.nameOverride ?? "—")}
                  </strong>
                  {p.address && <div style={{ fontSize: "9pt", color: "#475569" }}>📍 {p.address}</div>}
                  {p.contact && <div style={{ fontSize: "9pt", color: "#475569" }}>📞 {p.contact}</div>}
                </div>
              ))
            )}

            <div style={{ textAlign: "center", fontStyle: "italic", fontWeight: 700, margin: "0.75rem 0", color: "#dc2626", letterSpacing: "0.15em" }}>
              — AGAINST —
            </div>

            <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: 3, marginBottom: 6 }}>
              Respondent(s):
            </div>
            {respondents.length === 0 ? (
              <div style={{ fontStyle: "italic", color: "#94a3b8" }}>— No respondent recorded —</div>
            ) : (
              respondents.map((p, idx) => (
                <div key={p.id || idx} style={{ marginBottom: 6 }}>
                  <strong style={{ fontSize: "10.5pt", color: "#0f172a" }}>
                    {p.inhabitant ? `${p.inhabitant.firstName} ${p.inhabitant.lastName}` : (p.nameOverride ?? "—")}
                  </strong>
                  {p.address && <div style={{ fontSize: "9pt", color: "#475569" }}>📍 {p.address}</div>}
                  {p.contact && <div style={{ fontSize: "9pt", color: "#475569" }}>📞 {p.contact}</div>}
                </div>
              ))
            )}
          </div>

          <div style={{ borderLeft: "1px dashed #cbd5e1", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: 3, marginBottom: 6 }}>
                Dispute Subject / Nature:
              </div>
              <div style={{ fontSize: "11pt", fontWeight: 700, color: "#0a2463", marginBottom: "0.75rem" }}>
                {c.subject}
              </div>

              <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: 3, marginBottom: 6 }}>
                Statutory Clock (RA 7160 §410):
              </div>
              <div style={{ fontSize: "9.5pt", color: "#334155", marginBottom: "0.5rem" }}>
                Due Date: {c.deadline?.dueAt ? date(c.deadline.dueAt) : "N/A"}<br />
                Status: {c.deadline?.breached ? "⚠️ Statutory clock breached" : `${c.deadline?.daysRemaining ?? 0} days remaining`}
              </div>

              <div style={{ fontSize: "9pt", fontWeight: 700, textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0", paddingBottom: 3, marginBottom: 6 }}>
                Classification:
              </div>
              <div style={{ fontSize: "9pt", color: c.isConfidential ? "#dc2626" : "#16a34a", fontWeight: 600 }}>
                {c.isConfidential ? "🔒 RESTRICTED (VAWC / Family Code)" : "Standard Barangay Conciliation Record"}
              </div>
            </div>
          </div>
        </div>

        {/* Narrative & Statement of Facts */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "10pt", fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #94a3b8", paddingBottom: 3, marginBottom: 6 }}>
            I. Statement of Complaint & Dispute Narrative:
          </div>
          <div
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "0.375rem",
              fontSize: "10pt",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {c.description || "No dispute narrative facts provided."}
          </div>
        </div>

        {/* Hearings and Proceedings Chronology */}
        <div style={{ marginBottom: "1.25rem" }}>
          <div style={{ fontSize: "10pt", fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #94a3b8", paddingBottom: 3, marginBottom: 6 }}>
            II. Chronology of Hearings & Conciliation Sessions:
          </div>
          {(c.hearings ?? []).length === 0 ? (
            <div style={{ fontStyle: "italic", color: "#64748b", fontSize: "9.5pt", padding: "0.5rem 0" }}>
              No hearing sessions recorded yet.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9pt", marginTop: 4 }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", textAlign: "left" }}>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>Hearing Date & Time</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>Stage</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>Attendance</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>Minutes & Summary</th>
                  <th style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {(c.hearings ?? []).map((h, i) => (
                  <tr key={h.id || i}>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", fontWeight: 600 }}>
                      {dateTime(h.scheduledAt)}
                    </td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px", textTransform: "capitalize" }}>
                      {h.stage}
                    </td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>
                      {h.attended === true ? "Attended" : h.attended === false ? "No-show" : "Scheduled"}
                    </td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>
                      {h.minutes || "—"}
                    </td>
                    <td style={{ border: "1px solid #cbd5e1", padding: "6px 8px" }}>
                      {h.outcome || "Pending"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Settlement or CFA Grounds */}
        {(c.settlementTerms || c.cfaReason) && (
          <div style={{ marginBottom: "1.25rem" }}>
            <div style={{ fontSize: "10pt", fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #94a3b8", paddingBottom: 3, marginBottom: 6 }}>
              III. {c.settlementTerms ? "Amicable Settlement Terms (KP Form 16)" : "Certificate to File Action Grounds (KP Form 20)"}:
            </div>
            <div
              style={{
                padding: "0.75rem 1rem",
                backgroundColor: c.settlementTerms ? "#f0fdf4" : "#fef2f2",
                border: `1px solid ${c.settlementTerms ? "#bbf7d0" : "#fecaca"}`,
                borderRadius: "0.375rem",
                fontSize: "10pt",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {c.settlementTerms || c.cfaReason}
            </div>
          </div>
        )}

        {/* Official Attestation & Signatures Section */}
        <div style={{ marginTop: "2rem", pageBreakInside: "avoid" }}>
          <div style={{ fontSize: "9pt", fontStyle: "italic", textAlign: "center", marginBottom: "2rem", color: "#475569" }}>
            ATTESTATION: Certified as a true and official extract from the Katarungang Pambarangay General Docket of Barangay Barangka.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginTop: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #000000", height: "35px", marginBottom: "4px" }} />
              <div style={{ fontWeight: 700, fontSize: "10.5pt", textTransform: "uppercase" }}>
                HON. PUNONG BARANGAY
              </div>
              <div style={{ fontSize: "9pt", color: "#64748b" }}>
                Lupon Tagapamayapa Chairman
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #000000", height: "35px", marginBottom: "4px" }} />
              <div style={{ fontWeight: 700, fontSize: "10.5pt", textTransform: "uppercase" }}>
                BARANGAY SECRETARY
              </div>
              <div style={{ fontSize: "9pt", color: "#64748b" }}>
                Lupon Secretary
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginTop: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #000000", height: "35px", marginBottom: "4px" }} />
              <div style={{ fontSize: "9pt", color: "#475569" }}>
                Signature of Complainant(s)
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #000000", height: "35px", marginBottom: "4px" }} />
              <div style={{ fontSize: "9pt", color: "#475569" }}>
                Signature of Respondent(s)
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: "8pt", color: "#94a3b8", marginTop: "2rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.5rem" }}>
            Centralized Barangay Management System (CBMS) · System Generated Official Docket Sheet · Date Printed: {dateTime(new Date().toISOString())}
          </div>
        </div>
      </div>
    </div>
  );
}
