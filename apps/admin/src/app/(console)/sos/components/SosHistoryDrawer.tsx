"use client";

import * as React from "react";
import { Chip, StatusChip, dateTime } from "@cbms/ui";
import { SOS_KIND_ICON } from "../../../../lib/labels";
import { useAlertHistoryQuery } from "../../../../lib/sos-queries";
import { SosDrawerTimeline } from "./SosDrawerTimeline";
import type { SosAlert } from "../../../../lib/types";

export interface SosHistoryDrawerProps {
  open: boolean;
  alert: SosAlert | null;
  onClose: () => void;
  onRespond?: (alert: SosAlert, targetStatus: string) => void;
  mayRespond?: boolean;
  busy?: boolean;
}

function formatDuration(startIso: string, endIso?: string | null): string {
  if (!endIso) return "In progress";
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const diffMinutes = Math.max(0, Math.round((end - start) / 60000));
  if (diffMinutes < 1) return "< 1 min";
  if (diffMinutes < 60) return `${diffMinutes} mins`;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return `${hours}h ${mins}m`;
}

export function SosHistoryDrawer({
  open,
  alert,
  onClose,
  onRespond,
  mayRespond,
  busy,
}: SosHistoryDrawerProps) {
  // Fetch chronological audit trail directly from backend API /api/v1/sos/:id/history
  const { data: historyList, isLoading: loadingHistory } = useAlertHistoryQuery(
    open && alert?.id ? alert.id : null
  );

  if (!open || !alert) return null;

  const icon = SOS_KIND_ICON[alert.kind?.toLowerCase()] ?? "🚨";
  const timeToAck = alert.acknowledgedAt
    ? formatDuration(alert.createdAt, alert.acknowledgedAt)
    : null;
  const timeToResolve = alert.resolvedAt
    ? formatDuration(alert.createdAt, alert.resolvedAt)
    : null;
  const isResolved = alert.status === "resolved";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(2px)",
        zIndex: 2200,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-history-drawer-title"
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "100%",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          borderLeft: "1px solid var(--color-border, #e2e8f0)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-6px 0 24px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            backgroundColor: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.75rem" }}>{icon}</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2
                  id="sos-history-drawer-title"
                  style={{
                    margin: 0,
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "var(--color-text, #1b2430)",
                    textTransform: "uppercase",
                  }}
                >
                  {alert.kind || "GENERAL"}
                </h2>
                <StatusChip status={alert.status} />
                {alert.isTest && <Chip tone="gray">TEST</Chip>}
              </div>
              <p style={{ margin: "3px 0 0 0", fontSize: "0.85rem", color: "var(--cbms-muted, #64748b)" }}>
                Alert #{alert.id.slice(0, 8)} · Dispatch History & Timeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: busy ? "not-allowed" : "pointer",
              color: "var(--cbms-muted, #64748b)",
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Resident & Incident Details Card */}
          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: "12.5px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--cbms-muted, #64748b)" }}>Caller / Resident:</span>
              <strong style={{ color: "var(--color-text, #1b2430)" }}>
                {alert.inhabitant
                  ? `${alert.inhabitant.firstName} ${alert.inhabitant.lastName}`
                  : "Unregistered Resident"}
              </strong>
            </div>

            {alert.inhabitant?.contactPhone && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--cbms-muted, #64748b)" }}>Contact:</span>
                <span style={{ fontWeight: 600 }}>📞 {alert.inhabitant.contactPhone}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--cbms-muted, #64748b)" }}>Reported At:</span>
              <span>{dateTime(alert.createdAt)}</span>
            </div>

            {alert.latitude != null && alert.longitude != null && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--cbms-muted, #64748b)" }}>Location:</span>
                <a
                  href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#0369a1", textDecoration: "underline", fontWeight: 600 }}
                >
                  📍 {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                </a>
              </div>
            )}

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4 }}>
              <span style={{ color: "var(--cbms-muted, #64748b)", display: "block", marginBottom: 3 }}>
                Emergency Note:
              </span>
              <div style={{ color: "var(--color-text, #1b2430)", fontWeight: 500, fontStyle: "italic" }}>
                “{alert.note}”
              </div>
            </div>
          </div>

          {/* Turnaround & SLA Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                backgroundColor: alert.acknowledgedAt ? "#fef3c7" : "#f8fafc",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)", fontWeight: 600 }}>
                TIME TO ACKNOWLEDGE
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: alert.acknowledgedAt ? "#92400e" : "#64748b", marginTop: 2 }}>
                {timeToAck ? timeToAck : "Pending"}
              </div>
            </div>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #e2e8f0",
                backgroundColor: isResolved ? "#f0fdf4" : "#f8fafc",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)", fontWeight: 600 }}>
                TOTAL TURNAROUND
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: isResolved ? "#166534" : "#b45309", marginTop: 2 }}>
                {isResolved && timeToResolve ? timeToResolve : "In Progress"}
              </div>
            </div>
          </div>

          {/* Chronological Audit Trail & State Transitions */}
          <div>
            <h3
              style={{
                margin: "0 0 0.75rem 0",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--color-text, #1b2430)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>📜</span>
              <span>Dispatch State History</span>
            </h3>

            <SosDrawerTimeline
              alert={alert}
              historyList={historyList}
              loading={loadingHistory}
              timeToAck={timeToAck}
            />
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8fafc",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {mayRespond && alert.status === "active" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onRespond?.(alert, "acknowledged")}
                style={{
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  color: "#92400e",
                  borderRadius: 6,
                  padding: "0.4rem 0.8rem",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                Acknowledge
              </button>
            )}

            {mayRespond && ["active", "acknowledged"].includes(alert.status) && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onRespond?.(alert, "dispatched")}
                style={{
                  background: "#0a2463",
                  border: "1px solid #0a2463",
                  color: "#ffffff",
                  borderRadius: 6,
                  padding: "0.4rem 0.8rem",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                Dispatch Unit
              </button>
            )}

            {mayRespond && !["resolved", "false_alarm"].includes(alert.status) && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onRespond?.(alert, "resolved")}
                style={{
                  background: "#dcfce7",
                  border: "1px solid #bbf7d0",
                  color: "#166534",
                  borderRadius: 6,
                  padding: "0.4rem 0.8rem",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                Resolve Incident
              </button>
            )}
          </div>

          <button
            type="button"
            className="cbms-button"
            onClick={onClose}
            disabled={busy}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--color-border, #cbd5e1)",
              background: "#ffffff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
