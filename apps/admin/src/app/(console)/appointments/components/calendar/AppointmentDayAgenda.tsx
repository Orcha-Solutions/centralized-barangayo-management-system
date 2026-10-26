"use client";

import * as React from "react";
import { StatusChip } from "@cbms/ui";
import type { Appointment } from "../../../../../lib/types";
import { formatDateHeading, formatTime, getStatusStyle } from "./calendar-utils";

export interface AppointmentDayAgendaProps {
  selectedDate: Date;
  appointments: Appointment[];
  canManage: boolean;
  transactingId: string | null;
  onBookDate: (d: Date) => void;
  onEdit: (a: Appointment) => void;
  onDelete: (a: Appointment) => void;
  onMoveStatus: (a: Appointment, nextStatus: string) => void;
}

export function AppointmentDayAgenda({
  selectedDate,
  appointments = [],
  canManage,
  transactingId,
  onBookDate,
  onEdit,
  onDelete,
  onMoveStatus,
}: AppointmentDayAgendaProps) {
  // Sort appointments chronologically by scheduledAt
  const sorted = React.useMemo(() => {
    return [...appointments].sort((a, b) => {
      const ta = new Date(a.scheduledAt).getTime();
      const tb = new Date(b.scheduledAt).getTime();
      return ta - tb;
    });
  }, [appointments]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--cbms-white, #ffffff)",
        border: "1px solid var(--cbms-line, #e2e8f0)",
        borderRadius: "0.5rem",
        overflow: "hidden",
      }}
    >
      {/* Agenda Header */}
      <div
        style={{
          padding: "1rem",
          backgroundColor: "var(--color-bg-subtle, #f8fafc)",
          borderBottom: "1px solid var(--cbms-line, #e2e8f0)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.5rem",
        }}
      >
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
            {formatDateHeading(selectedDate)}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: 2 }}>
            {sorted.length} transaction{sorted.length === 1 ? "" : "s"} scheduled
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            className="cbms-btn cbms-btn--primary"
            onClick={() => onBookDate(selectedDate)}
            style={{
              padding: "4px 8px",
              fontSize: "0.76rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>➕</span>
            <span>Book</span>
          </button>
        )}
      </div>

      {/* Appointment Timeline List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {sorted.length === 0 ? (
          <div
            style={{
              padding: "2.5rem 1rem",
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
            <div style={{ fontWeight: 600, color: "#64748b", fontSize: "0.88rem" }}>
              No Appointments Scheduled
            </div>
            <div style={{ fontSize: "0.78rem", marginTop: 4, maxWidth: 220, margin: "4px auto 12px" }}>
              No citizen visits booked for this date yet.
            </div>
            {canManage && (
              <button
                type="button"
                className="cbms-btn cbms-btn--secondary"
                onClick={() => onBookDate(selectedDate)}
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              >
                Schedule Appointment
              </button>
            )}
          </div>
        ) : (
          sorted.map((appt) => {
            const isTransacting = transactingId === appt.id;
            const timeLabel = formatTime(appt.scheduledAt);
            const statusStyle = getStatusStyle(appt.status);

            return (
              <div
                key={appt.id}
                style={{
                  border: `1px solid ${statusStyle.border}`,
                  borderRadius: "0.375rem",
                  padding: "0.75rem",
                  backgroundColor: statusStyle.bg,
                  position: "relative",
                  transition: "box-shadow 0.15s",
                }}
              >
                {/* Top Row: Time & Queue Pill & Status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.35rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        color: "var(--cbms-navy, #0a2463)",
                      }}
                    >
                      🕒 {timeLabel}
                    </span>
                    {appt.queueNumber && (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          backgroundColor: "rgba(10, 36, 99, 0.08)",
                          color: "var(--cbms-navy, #0a2463)",
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {appt.queueNumber}
                      </span>
                    )}
                  </div>
                  <StatusChip status={appt.status} />
                </div>

                {/* Service Name */}
                <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--cbms-ink, #1b2430)" }}>
                  {appt.service}
                </div>

                {/* Citizen / Inhabitant */}
                {appt.inhabitant && (
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                    👤 {appt.inhabitant.firstName} {appt.inhabitant.lastName}
                  </div>
                )}

                {/* Notes */}
                {appt.notes && (
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "#64748b",
                      marginTop: 4,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      padding: "4px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    📝 {appt.notes}
                  </div>
                )}

                {/* Actions Row */}
                {canManage && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "0.6rem",
                      paddingTop: "0.5rem",
                      borderTop: `1px solid ${statusStyle.border}`,
                    }}
                  >
                    {/* Status Transitions */}
                    <div style={{ display: "flex", gap: "0.3rem" }}>
                      {appt.status === "booked" && (
                        <button
                          type="button"
                          className="cbms-btn cbms-btn--secondary"
                          disabled={isTransacting}
                          onClick={() => onMoveStatus(appt, "checked_in")}
                          style={{ padding: "2px 6px", fontSize: "0.7rem", fontWeight: 600 }}
                        >
                          {isTransacting ? "..." : "Check In"}
                        </button>
                      )}
                      {appt.status === "checked_in" && (
                        <button
                          type="button"
                          className="cbms-btn cbms-btn--secondary"
                          disabled={isTransacting}
                          onClick={() => onMoveStatus(appt, "serving")}
                          style={{ padding: "2px 6px", fontSize: "0.7rem", fontWeight: 600 }}
                        >
                          {isTransacting ? "..." : "Serve"}
                        </button>
                      )}
                      {appt.status === "serving" && (
                        <button
                          type="button"
                          className="cbms-btn cbms-btn--secondary"
                          disabled={isTransacting}
                          onClick={() => onMoveStatus(appt, "completed")}
                          style={{ padding: "2px 6px", fontSize: "0.7rem", fontWeight: 600, color: "#166534" }}
                        >
                          {isTransacting ? "..." : "Complete"}
                        </button>
                      )}
                      {appt.status !== "completed" && appt.status !== "no_show" && appt.status !== "cancelled" && (
                        <button
                          type="button"
                          className="cbms-btn cbms-btn--subtle"
                          disabled={isTransacting}
                          onClick={() => onMoveStatus(appt, "no_show")}
                          style={{ padding: "2px 6px", fontSize: "0.7rem", color: "#dc2626" }}
                        >
                          No-Show
                        </button>
                      )}
                    </div>

                    {/* Edit & Delete Buttons */}
                    <div style={{ display: "flex", gap: "0.3rem" }}>
                      <button
                        type="button"
                        className="cbms-btn cbms-btn--subtle"
                        disabled={isTransacting}
                        onClick={() => onEdit(appt)}
                        title="Edit appointment"
                        style={{ padding: "2px 6px", fontSize: "0.72rem" }}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="cbms-btn cbms-btn--subtle"
                        disabled={isTransacting}
                        onClick={() => onDelete(appt)}
                        title="Delete appointment"
                        style={{ padding: "2px 6px", fontSize: "0.72rem", color: "#dc2626" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
