"use client";

import * as React from "react";
import { Panel, StatusChip, dateTime } from "@cbms/ui";
import type { BlotterActionLog } from "../../../../../lib/types";

export interface BlotterActionTimelineProps {
  actions: BlotterActionLog[];
  canLogAction: boolean;
  onOpenLogModal: () => void;
  onEditAction?: (action: BlotterActionLog) => void;
  onDeleteAction?: (action: BlotterActionLog) => void;
  isDeleting?: boolean;
}

export function BlotterActionTimeline({
  actions,
  canLogAction,
  onOpenLogModal,
  onEditAction,
  onDeleteAction,
  isDeleting = false,
}: BlotterActionTimelineProps) {
  return (
    <Panel
      title={`🛡️ Barangay Actions & Intervention History (${actions.length})`}
      actions={
        canLogAction ? (
          <button
            type="button"
            className="cbms-btn cbms-btn--primary"
            style={{ fontSize: "0.82rem", padding: "0.35rem 0.75rem" }}
            onClick={onOpenLogModal}
          >
            ➕ Record Action
          </button>
        ) : undefined
      }
    >
      {actions.length === 0 ? (
        <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "2.2rem", marginBottom: "0.5rem" }}>📋</div>
          <strong style={{ fontSize: "1rem", color: "#1e293b" }}>No follow-up actions recorded yet.</strong>
          <p style={{ margin: "0.35rem auto 1.25rem auto", fontSize: "0.85rem", maxWidth: 420 }}>
            Track mobile patrols, hearing summons, ocular inspections, referrals, or resolution agreements in this timeline.
          </p>
          {canLogAction && (
            <button
              type="button"
              className="cbms-btn cbms-btn--primary"
              onClick={onOpenLogModal}
            >
              ➕ Record First Barangay Action
            </button>
          )}
        </div>
      ) : (
        <div style={{ padding: "0.5rem 0.25rem" }}>
          {actions.map((act: BlotterActionLog, idx: number) => {
            const isLast = idx === actions.length - 1;

            return (
              <div
                key={act.id || idx}
                style={{
                  display: "flex",
                  gap: "1.1rem",
                  position: "relative",
                }}
              >
                {/* Timeline Left Node & Connector Line */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 32,
                  }}
                >
                  {/* Circular Checkmark / Status Icon */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: "#0284c7",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      boxShadow: "0 2px 4px rgba(2, 132, 199, 0.3)",
                      zIndex: 2,
                    }}
                  >
                    ✓
                  </div>

                  {/* Vertical Connector Line */}
                  {!isLast && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        backgroundColor: "#38bdf8",
                        opacity: 0.7,
                        margin: "4px 0",
                        minHeight: 48,
                      }}
                    />
                  )}
                </div>

                {/* Timeline Content Block */}
                <div
                  style={{
                    flex: 1,
                    paddingBottom: isLast ? "0.5rem" : "1.75rem",
                  }}
                >
                  {/* Header Row: Title & Action Controls */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: "1rem",
                          color: "#0f172a",
                          display: "inline-block",
                        }}
                      >
                        {act.actionTaken}
                      </strong>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "#64748b",
                          marginTop: "0.15rem",
                        }}
                      >
                        👤 <strong>{act.officerName}</strong> &bull; {act.officerRole}
                      </div>
                    </div>

                    {/* Quick CRUD Action Buttons & Status */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      {act.statusAfter && <StatusChip status={act.statusAfter} />}

                      {canLogAction && onEditAction && (
                        <button
                          type="button"
                          className="cbms-btn"
                          title="Edit this action"
                          style={{
                            padding: "0.2rem 0.5rem",
                            fontSize: "0.76rem",
                            borderRadius: "0.375rem",
                          }}
                          onClick={() => onEditAction(act)}
                          disabled={isDeleting}
                        >
                          ✏️ Edit
                        </button>
                      )}

                      {canLogAction && onDeleteAction && (
                        <button
                          type="button"
                          className="cbms-btn cbms-btn--danger"
                          title="Delete this action"
                          style={{
                            padding: "0.2rem 0.5rem",
                            fontSize: "0.76rem",
                            borderRadius: "0.375rem",
                          }}
                          onClick={() => onDeleteAction(act)}
                          disabled={isDeleting}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes / Narrative */}
                  {act.notes && (
                    <div
                      style={{
                        margin: "0.45rem 0",
                        fontSize: "0.875rem",
                        lineHeight: 1.55,
                        color: "#334155",
                      }}
                    >
                      {act.notes}
                    </div>
                  )}

                  {/* Badges / Auxiliary Info Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.5rem",
                      marginTop: "0.4rem",
                    }}
                  >
                    {/* Time Pill Badge */}
                    <span
                      style={{
                        backgroundColor: "#0284c7",
                        color: "#ffffff",
                        padding: "0.2rem 0.65rem",
                        borderRadius: "0.35rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        boxShadow: "0 1px 2px rgba(2, 132, 199, 0.2)",
                      }}
                    >
                      <span>🕒</span>
                      <span>{dateTime(act.timestamp)}</span>
                    </span>

                    {/* Document Reference Pill */}
                    {act.documentRef && (
                      <span
                        style={{
                          backgroundColor: "#f0f9ff",
                          color: "#0369a1",
                          border: "1px solid #bae6fd",
                          padding: "0.2rem 0.65rem",
                          borderRadius: "0.35rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <span>📄</span>
                        <span>{act.documentRef}</span>
                      </span>
                    )}

                    {/* Step indicator */}
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#94a3b8",
                        fontWeight: 600,
                        marginLeft: "auto",
                      }}
                    >
                      Step {idx + 1} of {actions.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
