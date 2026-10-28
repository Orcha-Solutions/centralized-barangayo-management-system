"use client";

import * as React from "react";
import { StatusChip, dateTime, titleize } from "@cbms/ui";
import type { Appointment } from "../../../../lib/types";

export interface AppointmentTableProps {
  appointments: Appointment[];
  total?: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (columnKey: string) => void;
  canManage: boolean;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  onMoveStatus: (appointment: Appointment, newStatus: string) => void;
  transactingId?: string | null;
}

const NEXT_STATUS: Record<string, { value: string; label: string; icon: string }> = {
  booked: { value: "checked_in", label: "Check In", icon: "📥" },
  checked_in: { value: "serving", label: "Serve", icon: "🧍" },
  serving: { value: "completed", label: "Complete", icon: "✅" },
};

export function AppointmentTable({
  appointments,
  total: totalProp,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  sortBy,
  sortOrder,
  onSort,
  canManage,
  onEdit,
  onDelete,
  onMoveStatus,
  transactingId,
}: AppointmentTableProps) {
  const total = totalProp ?? appointments.length;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  // Intersection Observer for Infinite Scrolling
  const observerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const container = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      { root: container, threshold: 0.1, rootMargin: "150px" }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Sort indicator helper
  const renderSortIndicator = (columnKey: string) => {
    if (sortBy !== columnKey) return null;
    return (
      <span style={{ color: "#0284c7", marginLeft: "0.25rem", fontWeight: 700 }}>
        {sortOrder === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const stickyThBase: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: "#f8fafc",
    padding: "0.75rem 1rem",
    fontWeight: 600,
    color: "#475569",
    borderBottom: "2px solid #cbd5e1",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        width: "100%",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "0.5rem",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
      <div
        ref={containerRef}
        className="cbms-table-wrap cbms-table-wrap--sticky"
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "auto",
          maxHeight: "calc(100vh - 320px)",
          position: "relative",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, textAlign: "left", fontSize: "0.875rem" }}>
          {/* Sticky Headers with Server-side Sorting */}
          <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <tr>
              <th
                style={{ ...stickyThBase, cursor: "pointer", width: 130 }}
                onClick={() => onSort("queueNumber")}
              >
                Ticket / Queue # {renderSortIndicator("queueNumber")}
              </th>
              <th
                style={{ ...stickyThBase, cursor: "pointer", width: 190 }}
                onClick={() => onSort("scheduledAt")}
              >
                Schedule {renderSortIndicator("scheduledAt")}
              </th>
              <th
                style={{ ...stickyThBase, cursor: "pointer" }}
                onClick={() => onSort("service")}
              >
                Service / Purpose {renderSortIndicator("service")}
              </th>
              <th style={stickyThBase}>
                Resident / Inhabitant
              </th>
              <th
                style={{ ...stickyThBase, cursor: "pointer", width: 140 }}
                onClick={() => onSort("status")}
              >
                Status {renderSortIndicator("status")}
              </th>
              <th style={stickyThBase}>
                Internal Notes
              </th>
              <th style={{ ...stickyThBase, width: 220, textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && appointments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  <div style={{ display: "inline-block", animation: "spin 1s linear infinite", fontSize: "1.5rem" }}>🔄</div>
                  <div style={{ marginTop: "0.5rem" }}>Loading appointments registry...</div>
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
                  <div>No scheduled appointments match the current filters.</div>
                </td>
              </tr>
            ) : (
              appointments.map((a) => {
                const residentName = a.inhabitant
                  ? `${a.inhabitant.firstName} ${a.inhabitant.lastName}`
                  : "Walk-in Guest";
                const nextAction = NEXT_STATUS[a.status];
                const isBusy = transactingId === a.id;

                return (
                  <tr
                    key={a.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      transition: "background-color 0.15s ease",
                      opacity: isBusy ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Ticket / Queue # */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#0369a1",
                          fontFamily: "monospace",
                          fontSize: "0.95rem",
                          backgroundColor: "#f0f9ff",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "0.25rem",
                          border: "1px solid #bae6fd",
                        }}
                      >
                        {a.queueNumber || "No Ticket"}
                      </span>
                    </td>

                    {/* Schedule */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>
                        {dateTime(a.scheduledAt)}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {new Date(a.scheduledAt) < new Date() && !["completed", "cancelled", "no_show"].includes(a.status) ? (
                          <span style={{ color: "#b91c1c", fontWeight: 600 }}>⚠️ Past due</span>
                        ) : (
                          "Desk appointment"
                        )}
                      </div>
                    </td>

                    {/* Service / Purpose */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <span
                        style={{
                          display: "inline-block",
                          fontWeight: 600,
                          color: "#0f172a",
                          maxWidth: "260px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={a.service}
                      >
                        {a.service}
                      </span>
                    </td>

                    {/* Resident */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 500, color: "#1e293b" }}>{residentName}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {"Verified Citizen"}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <StatusChip status={a.status} />
                    </td>

                    {/* Notes */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {a.notes || "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
                        {canManage && nextAction && (
                          <button
                            type="button"
                            className="cbms-btn cbms-btn--secondary"
                            style={{
                              fontSize: "0.76rem",
                              padding: "0.25rem 0.6rem",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontWeight: 600,
                            }}
                            disabled={isBusy}
                            onClick={() => onMoveStatus(a, nextAction.value)}
                            title={`Advance ticket to ${nextAction.label}`}
                          >
                            <span>{nextAction.icon}</span>
                            <span>{nextAction.label}</span>
                          </button>
                        )}
                        {canManage && (
                          <button
                            type="button"
                            className="cbms-btn"
                            style={{ fontSize: "0.76rem", padding: "0.25rem 0.5rem" }}
                            disabled={isBusy}
                            onClick={() => onEdit(a)}
                            title="Edit Appointment"
                          >
                            ✏️ Edit
                          </button>
                        )}
                        {canManage && (
                          <button
                            type="button"
                            className="cbms-btn cbms-btn--danger"
                            style={{ fontSize: "0.76rem", padding: "0.25rem 0.45rem" }}
                            disabled={isBusy}
                            onClick={() => onDelete(a)}
                            title="Delete Appointment"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Infinite Scroll Trigger Sentinel */}
        <div ref={observerRef} style={{ height: 1 }} />
      </div>

      {/* Infinite Scroll & Lazy Loading Status Footer */}
      <div
        className="cbms-pagination"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 18px",
          borderTop: "1px solid var(--cbms-line, #e2e8f0)",
          fontSize: "12.5px",
          color: "var(--cbms-muted, #64748b)",
          background: "var(--cbms-white, #ffffff)",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          Showing <strong>{appointments.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> appointments
          {appointments.length > 0 && total > appointments.length && (
            <span style={{ marginLeft: 8, fontSize: "11.5px", opacity: 0.8 }}>
              (Scroll down to lazy load more)
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isFetchingNextPage && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--cbms-navy, #0a2463)",
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 13,
                  height: 13,
                  border: "2px solid rgba(10, 36, 99, 0.25)",
                  borderTopColor: "var(--cbms-navy, #0a2463)",
                  borderRadius: "50%",
                  animation: "cbms-spin 0.8s linear infinite",
                }}
              />
              <span>Loading next 20 records...</span>
            </div>
          )}

          {!hasNextPage && appointments.length > 0 && (
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                color: "#166534",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "2px 8px",
                borderRadius: 999,
              }}
            >
              ✓ All {total.toLocaleString()} appointments loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
