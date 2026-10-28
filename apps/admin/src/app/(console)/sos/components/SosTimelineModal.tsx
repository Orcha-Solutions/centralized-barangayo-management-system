"use client";

import * as React from "react";
import { Chip, StatusChip, dateTime } from "@cbms/ui";
import { SOS_KIND_ICON } from "../../../../lib/labels";
import { useAlertHistoryQuery } from "../../../../lib/sos-queries";
import type { SosAlert, SosDispatchHistory } from "../../../../lib/types";

export interface SosTimelineModalProps {
  open: boolean;
  alert: SosAlert | null;
  onClose: () => void;
}

function formatDuration(startIso: string, endIso?: string | null): string {
  if (!endIso) return "In progress";
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const diffMinutes = Math.max(0, Math.round((end - start) / 60000));
  if (diffMinutes < 1) return "< 1 minute";
  if (diffMinutes < 60) return `${diffMinutes} mins`;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return `${hours}h ${mins}m`;
}

export function SosTimelineModal({ open, alert, onClose }: SosTimelineModalProps) {
  const { data: dbHistory, isLoading: loadingHistory } = useAlertHistoryQuery(open && alert?.id ? alert.id : null);

  if (!open || !alert) return null;

  const icon = SOS_KIND_ICON[alert.kind?.toLowerCase()] ?? "🚨";
  const timeToAck = alert.acknowledgedAt
    ? formatDuration(alert.createdAt, alert.acknowledgedAt)
    : null;
  const timeToResolve = alert.resolvedAt
    ? formatDuration(alert.createdAt, alert.resolvedAt)
    : null;

  const isAck = !!alert.acknowledgedAt || ["acknowledged", "dispatched", "resolved"].includes(alert.status);
  const isDispatched = ["dispatched", "resolved"].includes(alert.status);
  const isResolved = alert.status === "resolved";
  const isFalseAlarm = alert.status === "false_alarm";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(2px)",
        zIndex: 2500,
        display: "grid",
        placeItems: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-timeline-title"
        style={{
          backgroundColor: "var(--color-bg-card, #ffffff)",
          border: "1px solid var(--color-border, #e2e8f0)",
          borderRadius: "8px",
          padding: "1.5rem",
          width: "90%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.75rem" }}>{icon}</span>
            <div>
              <h3
                id="sos-timeline-title"
                style={{
                  margin: 0,
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "var(--color-text, #1b2430)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>SOS Incident Lifecycle</span>
                <StatusChip status={alert.status} />
              </h3>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "var(--cbms-muted, #64748b)" }}>
                Alert #{alert.id.slice(0, 8)} · {alert.kind.toUpperCase()}
                {alert.isTest && " (TEST DRILL)"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "var(--cbms-muted, #64748b)",
              padding: "2px 6px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Overview Banner */}
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            fontSize: "12px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <span style={{ color: "var(--cbms-muted, #64748b)" }}>Caller: </span>
            <strong>
              {alert.inhabitant
                ? `${alert.inhabitant.firstName} ${alert.inhabitant.lastName}`
                : "Unregistered Resident"}
            </strong>
          </div>
          <div>
            <span style={{ color: "var(--cbms-muted, #64748b)" }}>Total Turnaround: </span>
            <strong style={{ color: isResolved ? "#166534" : "#b45309" }}>
              {isResolved && timeToResolve ? timeToResolve : "Active / Ongoing"}
            </strong>
          </div>
        </div>

        {/* Chronological Timeline Track */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "relative", paddingLeft: "1.5rem" }}>
          {/* Vertical Connecting Line */}
          <div
            style={{
              position: "absolute",
              left: "7px",
              top: "8px",
              bottom: "8px",
              width: "2px",
              backgroundColor: "#e2e8f0",
            }}
          />

          {dbHistory && dbHistory.length > 0 ? (
            dbHistory.map((item, idx) => {
              const getActionColor = (act: string) => {
                switch (act) {
                  case "TRIGGERED":
                    return "#dc2626";
                  case "ACKNOWLEDGED":
                    return "#d97706";
                  case "DISPATCHED":
                    return "#0a2463";
                  case "RESOLVED":
                    return "#166534";
                  case "FALSE_ALARM":
                    return "#475569";
                  default:
                    return "#2563eb";
                }
              };
              const col = getActionColor(item.action);
              return (
                <div key={item.id || idx} style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "-1.5rem",
                      top: "2px",
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: col,
                      border: "3px solid #ffffff",
                      boxShadow: `0 0 0 1px ${col}`,
                    }}
                  />
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "13px", color: col }}>
                        {idx + 1}. {item.action.replace("_", " ")}
                      </strong>
                      <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                        {dateTime(item.createdAt)}
                      </span>
                    </div>
                    {item.officerName && (
                      <div style={{ fontSize: "11.5px", color: "var(--cbms-muted, #64748b)", marginTop: 2 }}>
                        Action by: <strong>{item.officerName}</strong>
                      </div>
                    )}
                    {item.notes && (
                      <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--color-text, #1b2430)" }}>
                        “{item.notes}”
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <>
              {/* Stage 1: Triggered / Created */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "-1.5rem",
                    top: "2px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "#dc2626",
                    border: "3px solid #ffffff",
                    boxShadow: "0 0 0 1px #dc2626",
                  }}
                />
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "13px", color: "#dc2626" }}>1. Beacon Triggered</strong>
                    <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                      {dateTime(alert.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "var(--color-text, #1b2430)" }}>
                    “{alert.note}”
                  </p>
                  {alert.latitude != null && alert.longitude != null && (
                    <div style={{ fontSize: "11px", color: "#0369a1", marginTop: 2 }}>
                      📍 Coordinates: {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                    </div>
                  )}
                </div>
              </div>

              {/* Stage 2: Acknowledged */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "-1.5rem",
                    top: "2px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: isAck ? "#d97706" : "#cbd5e1",
                    border: "3px solid #ffffff",
                    boxShadow: `0 0 0 1px ${isAck ? "#d97706" : "#cbd5e1"}`,
                  }}
                />
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "13px", color: isAck ? "#d97706" : "var(--cbms-muted, #64748b)" }}>
                      2. Alert Acknowledged
                    </strong>
                    {alert.acknowledgedAt && (
                      <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                        {dateTime(alert.acknowledgedAt)}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text, #1b2430)", marginTop: 2 }}>
                    {isAck ? (
                      <span>
                        Officer acknowledged beacon {timeToAck ? `(${timeToAck} after report)` : ""}.
                      </span>
                    ) : (
                      <span style={{ color: "var(--cbms-muted, #64748b)", fontStyle: "italic" }}>
                        Pending desk acknowledgment...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage 3: Dispatched */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "-1.5rem",
                    top: "2px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: isDispatched ? "#0a2463" : "#cbd5e1",
                    border: "3px solid #ffffff",
                    boxShadow: `0 0 0 1px ${isDispatched ? "#0a2463" : "#cbd5e1"}`,
                  }}
                />
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "13px", color: isDispatched ? "#0a2463" : "var(--cbms-muted, #64748b)" }}>
                      3. Tanod / Responder Dispatched
                    </strong>
                    {alert.updatedAt && isDispatched && (
                      <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                        {dateTime(alert.updatedAt)}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text, #1b2430)", marginTop: 2 }}>
                    {isDispatched ? (
                      <span>Response team mobilized and en route to incident location.</span>
                    ) : (
                      <span style={{ color: "var(--cbms-muted, #64748b)", fontStyle: "italic" }}>
                        Awaiting responder unit dispatch...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stage 4: Resolution / Outcome */}
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "-1.5rem",
                    top: "2px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: isResolved ? "#166534" : isFalseAlarm ? "#64748b" : "#cbd5e1",
                    border: "3px solid #ffffff",
                    boxShadow: `0 0 0 1px ${isResolved ? "#166534" : isFalseAlarm ? "#64748b" : "#cbd5e1"}`,
                  }}
                />
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong
                      style={{
                        fontSize: "13px",
                        color: isResolved ? "#166534" : isFalseAlarm ? "#475569" : "var(--cbms-muted, #64748b)",
                      }}
                    >
                      4. Incident Resolution
                    </strong>
                    {alert.resolvedAt && (
                      <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                        {dateTime(alert.resolvedAt)}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text, #1b2430)", marginTop: 2 }}>
                    {isResolved ? (
                      <div>
                        <div>Emergency neutralized and incident safely resolved.</div>
                        {alert.responseNote && (
                          <div
                            style={{
                              marginTop: 6,
                              padding: "6px 10px",
                              borderRadius: 4,
                              background: "#f0fdf4",
                              border: "1px solid #bbf7d0",
                              color: "#166534",
                              fontSize: "11.5px",
                            }}
                          >
                            <strong>Resolution Note:</strong> {alert.responseNote}
                          </div>
                        )}
                      </div>
                    ) : isFalseAlarm ? (
                      <div style={{ color: "#64748b" }}>Incident verified as false alarm or drill.</div>
                    ) : (
                      <span style={{ color: "var(--cbms-muted, #64748b)", fontStyle: "italic" }}>
                        Incident remains active.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem" }}>
          <button
            type="button"
            className="cbms-button"
            onClick={onClose}
            style={{
              padding: "0.45rem 1.25rem",
              borderRadius: "6px",
              border: "1px solid var(--color-border, #cbd5e1)",
              background: "#ffffff",
              fontWeight: 600,
              fontSize: "12.5px",
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
