"use client";

import * as React from "react";
import { Chip, StatusChip, dateTime } from "@cbms/ui";
import type { KpCase } from "../../../../../lib/types";

export interface KpHearingsCardProps {
  caseData: KpCase;
  mayEncode: boolean;
  onOpenScheduleModal: () => void;
}

export function KpHearingsCard({
  caseData: c,
  mayEncode,
  onOpenScheduleModal,
}: KpHearingsCardProps) {
  const isLocked = Boolean(c.isLocked);
  const isClosed = Boolean(c.closedAt);
  const hearings = c.hearings ?? [];

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
      {/* Header */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.1rem" }}>📅</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
              Hearing Sessions & Minutes
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              KP Form 8 (Notice of Hearing) & Form 9 (Summons) Records
            </span>
          </div>
        </div>

        {!isClosed && !isLocked && mayEncode && (
          <button
            type="button"
            className="cbms-btn cbms-btn--primary"
            onClick={onOpenScheduleModal}
            style={{
              padding: "0.4rem 0.85rem",
              fontSize: "0.8rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              backgroundColor: "var(--cbms-navy, #0a2463)",
              borderColor: "var(--cbms-navy, #0a2463)",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            <span>+</span>
            <span>Schedule Hearing</span>
          </button>
        )}
      </div>

      {/* Hearing List */}
      <div style={{ padding: "1.5rem" }}>
        {hearings.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#94a3b8",
              backgroundColor: "#f8fafc",
              borderRadius: "0.5rem",
              border: "1px dashed #cbd5e1",
            }}
          >
            <div style={{ fontSize: "1.75rem", marginBottom: 6 }}>📅</div>
            <div style={{ fontWeight: 600, color: "#64748b", fontSize: "0.9rem" }}>No hearings scheduled yet</div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: 2 }}>
              Click "Schedule Hearing" above to issue a Notice of Hearing (KP Form 8).
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {hearings.map((h, idx) => (
              <div
                key={h.id || idx}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.625rem",
                  padding: "1rem 1.25rem",
                  backgroundColor: "#ffffff",
                  position: "relative",
                  transition: "box-shadow 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        backgroundColor: "#eff6ff",
                        color: "var(--cbms-navy, #0a2463)",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      #{idx + 1}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--cbms-navy, #0a2463)" }}>
                        {dateTime(h.scheduledAt)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 1 }}>
                        Official Conciliation Docket Session
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <StatusChip status={h.stage} />
                    {h.attended === true && <Chip tone="green">Attended</Chip>}
                    {h.attended === false && <Chip tone="red">No-show</Chip>}
                    {h.attended === null && <Chip tone="gold">Pending</Chip>}
                  </div>
                </div>

                {/* Minutes Note */}
                {h.minutes && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.65rem 0.85rem",
                      backgroundColor: "#f8fafc",
                      borderRadius: "0.375rem",
                      border: "1px solid #f1f5f9",
                      fontSize: "0.82rem",
                      lineHeight: 1.5,
                      color: "#334155",
                    }}
                  >
                    <strong>Minutes:</strong> {h.minutes}
                  </div>
                )}

                {/* Outcome */}
                {h.outcome && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.8rem",
                      color: "#1e40af",
                      fontWeight: 500,
                    }}
                  >
                    🎯 Outcome: {h.outcome}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
