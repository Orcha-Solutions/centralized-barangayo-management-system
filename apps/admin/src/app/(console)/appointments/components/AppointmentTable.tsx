"use client";

import * as React from "react";
import { StatusChip, dateTime, titleize } from "@cbms/ui";
import type { Appointment } from "../../../../lib/types";

export interface AppointmentTableProps {
  appointments: Appointment[];
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
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Sort indicator icon
  const renderSortArrow = (column: string) => {
    if (sortBy !== column) {
      return <span style={{ opacity: 0.3, marginLeft: "0.25rem", fontSize: "0.75rem" }}>↕</span>;
    }
    return (
      <span style={{ color: "var(--color-primary, #0369a1)", marginLeft: "0.25rem", fontWeight: 700 }}>
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
      ref={containerRef}
      className="cbms-table-wrap cbms-table-wrap--sticky"
      style={{
        width: "100%",
        overflowX: "auto",
        overflowY: "auto",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "0.5rem",
        backgroundColor: "#ffffff",
        maxHeight: "calc(100vh - 280px)",
        position: "relative",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, textAlign: "left", fontSize: "0.875rem" }}>
        {/* Sticky Headers */}
        <thead style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: "#f8fafc" }}>
          <tr>
            <th
              style={{
                ...stickyThBase,
                cursor: "pointer",
                width: 140,
              }}
              onClick={() => onSort("queueNumber")}
            >
              Queue No. {renderSortArrow("queueNumber")}
            </th>
            <th style={stickyThBase}>
              Resident / Citizen
            </th>
            <th
              style={{
                ...stickyThBase,
                cursor: "pointer",
              }}
              onClick={() => onSort("service")}
            >
              Service {renderSortArrow("service")}
            </th>
            <th
              style={{
                ...stickyThBase,
                cursor: "pointer",
              }}
              onClick={() => onSort("scheduledAt")}
            >
              Scheduled Date & Time {renderSortArrow("scheduledAt")}
            </th>
            <th
              style={{
                ...stickyThBase,
                cursor: "pointer",
                width: 130,
              }}
              onClick={() => onSort("status")}
            >
              Status {renderSortArrow("status")}
            </th>
            <th
              style={{
                ...stickyThBase,
                textAlign: "right",
                width: 220,
              }}
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Skeleton Loading State */}
          {isLoading && appointments.length === 0 ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <tr key={`skel-${idx}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 16, width: 85, backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 16, width: 140, backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 16, width: 120, backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 16, width: 150, backgroundColor: "#e2e8f0", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ height: 22, width: 75, backgroundColor: "#e2e8f0", borderRadius: 12, animation: "pulse 1.5s infinite" }} />
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <div style={{ height: 28, width: 120, backgroundColor: "#e2e8f0", borderRadius: 4, marginLeft: "auto", animation: "pulse 1.5s infinite" }} />
                </td>
              </tr>
            ))
          ) : appointments.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: "3rem 1rem", textAlign: "center", color: "#64748b" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📅</div>
                <strong>No appointments found matching this criteria.</strong>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                  Try adjusting filters or scheduling a new citizen appointment.
                </p>
              </td>
            </tr>
          ) : (
            appointments.map((a, idx) => {
              const isBusy = transactingId === a.id;
              const next = NEXT_STATUS[a.status];

              return (
                <tr
                  key={a.id || idx}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fbfcfe",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f9ff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#ffffff" : "#fbfcfe";
                  }}
                >
                  {/* Queue Number */}
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#0369a1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span>🎫</span>
                      <span>{a.queueNumber || "Unassigned"}</span>
                    </div>
                  </td>

                  {/* Resident */}
                  <td style={{ padding: "0.85rem 1rem" }}>
                    {a.inhabitant ? (
                      <div>
                        <strong>{a.inhabitant.firstName} {a.inhabitant.lastName}</strong>
                        {a.notes && (
                          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.15rem" }}>
                            {a.notes}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span style={{ color: "#64748b" }}>Walk-in Citizen</span>
                        {a.notes && (
                          <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.15rem" }}>
                            {a.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Service */}
                  <td style={{ padding: "0.85rem 1rem", fontWeight: 500, color: "#1e293b" }}>
                    {a.service}
                  </td>

                  {/* Scheduled Date & Time */}
                  <td style={{ padding: "0.85rem 1rem", color: "#334155" }}>
                    <div>{dateTime(a.scheduledAt)}</div>
                    {a.checkedInAt && (
                      <div style={{ fontSize: "0.75rem", color: "#0284c7" }}>
                        Clock started: {dateTime(a.checkedInAt)}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: "0.85rem 1rem" }}>
                    <StatusChip status={a.status} />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.35rem" }}>
                      {/* Step Advancement */}
                      {canManage && next && (
                        <button
                          type="button"
                          className="cbms-btn cbms-btn--primary"
                          style={{ fontSize: "0.76rem", padding: "0.25rem 0.55rem" }}
                          disabled={isBusy}
                          onClick={() => onMoveStatus(a, next.value)}
                          title={`Move to ${titleize(next.value)}`}
                        >
                          {isBusy ? "..." : `${next.icon} ${next.label}`}
                        </button>
                      )}

                      {/* No Show */}
                      {canManage && (a.status === "booked" || a.status === "checked_in") && (
                        <button
                          type="button"
                          className="cbms-btn"
                          style={{ fontSize: "0.76rem", padding: "0.25rem 0.45rem", color: "#dc2626" }}
                          disabled={isBusy}
                          onClick={() => onMoveStatus(a, "no_show")}
                          title="Mark as No Show"
                        >
                          🚫
                        </button>
                      )}

                      {/* Edit */}
                      {canManage && (
                        <button
                          type="button"
                          className="cbms-btn"
                          style={{ fontSize: "0.76rem", padding: "0.25rem 0.45rem" }}
                          disabled={isBusy}
                          onClick={() => onEdit(a)}
                          title="Edit Appointment"
                        >
                          ✏️
                        </button>
                      )}

                      {/* Delete */}
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
      <div ref={observerRef} style={{ padding: "1rem", textAlign: "center" }}>
        {isFetchingNextPage && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", color: "#0369a1", fontSize: "0.85rem" }}>
            <span style={{ animation: "spin 1s linear infinite" }}>🔄</span>
            <span>Loading more appointments...</span>
          </div>
        )}
        {!hasNextPage && appointments.length > 0 && (
          <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
            All appointments loaded ({appointments.length} total)
          </div>
        )}
      </div>
    </div>
  );
}
