"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { StatusChip, Chip, date } from "@cbms/ui";
import { KpDetailActions } from "../../components/KpDetailActions";
import type { KpCase } from "../../../../../lib/types";

export interface KpHeroProps {
  caseData: KpCase;
  isDeleting: boolean;
  onPrint: () => void;
  onScheduleHearing?: () => void;
  onAdvanceStage?: () => void;
  onDelete: () => void;
}

export function KpHero({
  caseData: c,
  isDeleting,
  onPrint,
  onScheduleHearing,
  onAdvanceStage,
  onDelete,
}: KpHeroProps) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);

  const handleCopyCaseNo = () => {
    navigator.clipboard?.writeText(c.caseNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract parties summaries
  const complainants = (c.parties ?? []).filter((p) => p.role === "complainant");
  const respondents = (c.parties ?? []).filter((p) => p.role === "respondent");

  const getPartyName = (p: typeof complainants[0]) =>
    p?.inhabitant
      ? `${p.inhabitant.firstName ?? ""} ${p.inhabitant.lastName ?? ""}`.trim()
      : (p?.nameOverride ?? "Unspecified");

  const complainantText = complainants.length > 0 ? getPartyName(complainants[0]) : "Complainant";
  const respondentText = respondents.length > 0 ? getPartyName(respondents[0]) : "Respondent";

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
      {/* Tricolor brand accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #0a2463 0%, #2563eb 50%, #f59e0b 100%)",
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
        <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", minWidth: 280, flex: 1 }}>
          {/* Scale of Justice Avatar Icon */}
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "12px",
              backgroundColor: "#f0f4ff",
              border: "1px solid #c7d2fe",
              display: "grid",
              placeItems: "center",
              fontSize: "1.75rem",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(10, 36, 99, 0.08)",
            }}
          >
            ⚖️
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            {/* Case No & Status Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "var(--cbms-navy, #0a2463)",
                }}
              >
                {c.caseNo}
              </h1>

              <button
                type="button"
                onClick={handleCopyCaseNo}
                title="Copy docket number"
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
                  color: "#1e40af",
                  backgroundColor: "#dbeafe",
                  padding: "2px 8px",
                  borderRadius: 999,
                  letterSpacing: "0.03em",
                }}
              >
                RA 7160 · KATARUNGANG PAMBARANGAY
              </span>

              <StatusChip status={c.stage} />

              {c.isLocked ? (
                <Chip tone="red">🔒 Locked</Chip>
              ) : (
                <Chip tone="green">Active</Chip>
              )}

              {c.isConfidential && (
                <Chip tone="gold">🛡️ Confidential (VAWC)</Chip>
              )}
            </div>

            {/* Subject Title */}
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#1e293b",
                marginTop: 6,
                letterSpacing: "-0.01em",
              }}
            >
              {c.isConfidential ? "[RESTRICTED VAWC/VAC DOMESTIC PROCEEDING]" : c.subject}
            </div>

            {/* Demographic and Dispute Summary Subline */}
            <div
              style={{
                fontSize: "0.85rem",
                color: "#64748b",
                marginTop: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>
                👤 Complainant: <strong>{complainantText}</strong>
              </span>
              <span>vs</span>
              <span>
                🎯 Respondent: <strong>{respondentText}</strong>
              </span>
              <span>·</span>
              <span>📅 Filed: {date(c.filedAt)}</span>
              {c.closedAt && (
                <>
                  <span>·</span>
                  <span style={{ color: "#16a34a", fontWeight: 600 }}>
                    Closed: {date(c.closedAt)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls in Hero: Back to docket beside Primary Actions button */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
          <button
            type="button"
            className="cbms-btn adm-noprint"
            onClick={() => router.push("/kp")}
            style={{ padding: "0.5rem 0.95rem", fontSize: "0.875rem" }}
          >
            ← Back to docket
          </button>

          <KpDetailActions
            caseData={c}
            onPrint={onPrint}
            onScheduleHearing={onScheduleHearing}
            onAdvanceStage={onAdvanceStage}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
}
