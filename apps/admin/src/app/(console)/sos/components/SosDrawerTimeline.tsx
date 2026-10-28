"use client";

import * as React from "react";
import { dateTime } from "@cbms/ui";
import type { SosAlert, SosDispatchHistory } from "../../../../lib/types";

export interface SosDrawerTimelineProps {
  alert: SosAlert;
  historyList?: SosDispatchHistory[];
  loading: boolean;
  timeToAck?: string | null;
}

export function SosDrawerTimeline({
  alert,
  historyList,
  loading,
  timeToAck,
}: SosDrawerTimelineProps) {
  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
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

  if (loading) {
    return (
      <div style={{ padding: "1rem", textAlign: "center", color: "var(--cbms-muted, #64748b)", fontSize: "12px" }}>
        Loading dispatch audit logs...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Vertical Timeline Guide Line */}
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

      {historyList && historyList.length > 0 ? (
        historyList.map((item, idx) => {
          const col = getActionColor(item.action);
          return (
            <div key={item.id || idx} style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "-1.5rem",
                  top: "3px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: col,
                  border: "2px solid #ffffff",
                  boxShadow: `0 0 0 1px ${col}`,
                }}
              />
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "12.5px", color: col, textTransform: "uppercase" }}>
                    {idx + 1}. {item.action.replace("_", " ")}
                  </strong>
                  <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                    {dateTime(item.createdAt)}
                  </span>
                </div>
                {item.officerName && (
                  <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)", marginTop: 2 }}>
                    Handled by: <strong>{item.officerName}</strong>
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
        /* Fallback derived from alert timestamps */
        <>
          <div style={{ position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "-1.5rem",
                top: "3px",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                backgroundColor: "#dc2626",
                border: "2px solid #ffffff",
                boxShadow: "0 0 0 1px #dc2626",
              }}
            />
            <div style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "12.5px", color: "#dc2626" }}>1. TRIGGERED</strong>
                <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                  {dateTime(alert.createdAt)}
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>“{alert.note}”</p>
            </div>
          </div>

          {alert.acknowledgedAt && (
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "-1.5rem",
                  top: "3px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "#d97706",
                  border: "2px solid #ffffff",
                  boxShadow: "0 0 0 1px #d97706",
                }}
              />
              <div style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "12.5px", color: "#d97706" }}>2. ACKNOWLEDGED</strong>
                  <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                    {dateTime(alert.acknowledgedAt)}
                  </span>
                </div>
                <p style={{ margin: "2px 0 0 0", fontSize: "11.5px", color: "var(--cbms-muted, #64748b)" }}>
                  Acknowledged {timeToAck ? `(+${timeToAck})` : ""}
                </p>
              </div>
            </div>
          )}

          {alert.resolvedAt && (
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "-1.5rem",
                  top: "3px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "#166534",
                  border: "2px solid #ffffff",
                  boxShadow: "0 0 0 1px #166534",
                }}
              />
              <div style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "12.5px", color: "#166534" }}>3. RESOLVED</strong>
                  <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                    {dateTime(alert.resolvedAt)}
                  </span>
                </div>
                {alert.responseNote && (
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px" }}>
                    {alert.responseNote}
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
