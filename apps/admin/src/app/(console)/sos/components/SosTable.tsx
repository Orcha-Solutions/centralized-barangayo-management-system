"use client";

import * as React from "react";
import { DataTable, Chip, StatusChip, dateTime } from "@cbms/ui";
import { SOS_KIND_ICON } from "../../../../lib/labels";
import type { SosAlert } from "../../../../lib/types";

export interface SosTableProps {
  alerts: SosAlert[];
  loading: boolean;
  total: number;
  maxHeight?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onSelectDelete?: (alert: SosAlert) => void;
  onRespond?: (alert: SosAlert, targetStatus: string) => void;
  onRowClick?: (alert: SosAlert) => void;
  busyId?: string | null;
  mayRespond?: boolean;
  mayDelete?: boolean;
}

function minutesSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

export function SosTable({
  alerts,
  loading,
  total,
  maxHeight = "clamp(420px, calc(100vh - 350px), 720px)",
  sortBy,
  sortOrder,
  onSort,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onSelectDelete,
  onRespond,
  onRowClick,
  busyId,
  mayRespond,
  mayDelete,
}: SosTableProps) {
  const sentinelRef = React.useRef<HTMLTableRowElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // IntersectionObserver for auto-triggering lazy loading when scrolling near the end
  React.useEffect(() => {
    if (!onLoadMore || !hasNextPage || isFetchingNextPage) return;

    const sentinelEl = sentinelRef.current;
    const containerEl = containerRef.current;
    if (!sentinelEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: containerEl,
        rootMargin: "200px",
        threshold: 0.05,
      }
    );

    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [onLoadMore, hasNextPage, isFetchingNextPage]);

  // Fallback scroll listener for scroll container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !hasNextPage || isFetchingNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      onLoadMore();
    }
  };

  const getStatusTone = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "danger";
      case "acknowledged":
        return "warn";
      case "dispatched":
        return "navy";
      case "resolved":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <div id="sos-table-container">
      <DataTable
        columns={[
          {
            key: "kind",
            header: "Emergency Type",
            width: "16%",
            sortable: true,
            render: (r: SosAlert) => {
              const icon = SOS_KIND_ICON[r.kind?.toLowerCase()] ?? "🚨";
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.25rem" }}>{icon}</span>
                  <div>
                    <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "12.5px" }}>
                      {r.kind || "GENERAL"}
                    </span>
                    {r.isTest && (
                      <span style={{ marginLeft: 6 }}>
                        <Chip tone="gray">TEST</Chip>
                      </span>
                    )}
                    <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                      #{r.id ? r.id.slice(0, 8) : "—"}
                    </div>
                  </div>
                </div>
              );
            },
          },
          {
            key: "inhabitant",
            header: "Resident / Caller",
            width: "18%",
            sortable: false,
            render: (r: SosAlert) => (
              <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 600, color: "var(--color-text, #1b2430)" }}>
                  {r.inhabitant
                    ? `${r.inhabitant.firstName} ${r.inhabitant.lastName}`
                    : "Unregistered Resident"}
                </span>
                {r.inhabitant?.contactPhone && (
                  <span style={{ color: "var(--cbms-muted, #64748b)" }}>
                    📞 {r.inhabitant.contactPhone}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "location",
            header: "Coordinates / Map",
            width: "16%",
            sortable: false,
            render: (r: SosAlert) => {
              if (r.latitude != null && r.longitude != null) {
                return (
                  <a
                    href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "12px",
                      color: "#0369a1",
                      textDecoration: "underline",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>📍</span>
                    <span>{r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}</span>
                  </a>
                );
              }
              return <span style={{ fontSize: "12px", color: "var(--cbms-muted, #64748b)" }}>No GPS</span>;
            },
          },
          {
            key: "note",
            header: "Emergency Note & Response",
            width: "20%",
            sortable: false,
            render: (r: SosAlert) => (
              <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontWeight: 500, color: "var(--color-text, #1b2430)" }}>
                  “{r.note || "No note provided"}”
                </div>
                {r.responseNote && (
                  <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)", fontStyle: "italic" }}>
                    ↳ Responder: {r.responseNote}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "createdAt",
            header: "Reported Time",
            width: "14%",
            sortable: true,
            render: (r: SosAlert) => {
              const mins = minutesSince(r.createdAt);
              const isUrgent = r.status === "active" && mins >= 5 && !r.isTest;
              return (
                <div style={{ fontSize: "12px" }}>
                  <div style={{ fontWeight: isUrgent ? 700 : 500, color: isUrgent ? "#dc2626" : "inherit" }}>
                    ⏱ {mins < 1 ? "Just now" : `${mins} min ago`}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                    {dateTime(r.createdAt)}
                  </div>
                </div>
              );
            },
          },
          {
            key: "status",
            header: "Status",
            width: "12%",
            sortable: true,
            render: (r: SosAlert) => (
              <StatusChip status={r.status || "active"} tone={getStatusTone(r.status) as any} />
            ),
          },
          {
            key: "actions",
            header: "Dispatch Action",
            width: "14%",
            sortable: false,
            render: (r: SosAlert) => {
              const isBusy = busyId === r.id;
              return (
                <div
                  style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {mayRespond && r.status === "active" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onRespond?.(r, "acknowledged")}
                      style={{
                        background: "#fef3c7",
                        border: "1px solid #fde68a",
                        color: "#92400e",
                        borderRadius: 4,
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: isBusy ? "not-allowed" : "pointer",
                        opacity: isBusy ? 0.6 : 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {isBusy && <span className="cbms-spin-sm" />}
                      <span>Ack</span>
                    </button>
                  )}

                  {mayRespond && ["active", "acknowledged"].includes(r.status) && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onRespond?.(r, "dispatched")}
                      style={{
                        background: "#0a2463",
                        border: "1px solid #0a2463",
                        color: "#ffffff",
                        borderRadius: 4,
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: isBusy ? "not-allowed" : "pointer",
                        opacity: isBusy ? 0.6 : 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {isBusy && <span className="cbms-spin-sm" />}
                      <span>Dispatch</span>
                    </button>
                  )}

                  {mayRespond && !["resolved", "false_alarm"].includes(r.status) && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onRespond?.(r, "resolved")}
                      style={{
                        background: "#dcfce7",
                        border: "1px solid #bbf7d0",
                        color: "#166534",
                        borderRadius: 4,
                        padding: "3px 8px",
                        fontSize: "11px",
                        fontWeight: 600,
                        cursor: isBusy ? "not-allowed" : "pointer",
                        opacity: isBusy ? 0.6 : 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {isBusy && <span className="cbms-spin-sm" />}
                      <span>Resolve</span>
                    </button>
                  )}

                  <button
                    type="button"
                    title="View Dispatch History & Timeline"
                    onClick={() => onRowClick?.(r)}
                    style={{
                      background: "var(--color-bg-subtle, #f1f5f9)",
                      border: "1px solid var(--color-border, #cbd5e1)",
                      borderRadius: 4,
                      padding: "3px 6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#0a2463",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <span>📜</span>
                    <span>History</span>
                  </button>

                  {mayDelete && (
                    <button
                      type="button"
                      disabled={isBusy}
                      title="Delete SOS Alert"
                      onClick={() => onSelectDelete?.(r)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: isBusy ? "not-allowed" : "pointer",
                        opacity: isBusy ? 0.4 : 1,
                        fontSize: "14px",
                        padding: "2px 4px",
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            },
          },
        ]}
        rows={alerts}
        loading={loading}
        rowKey={(row, i) => (row.id ? `${row.id}-${i}` : `sos-${i}`)}
        skeletonRows={20}
        empty={loading ? "Loading emergency alerts..." : "No emergency alerts match this filter."}
        onRowClick={onRowClick}
        stickyHeader
        maxHeight={maxHeight}
        minWidth={880}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        containerRef={containerRef}
        sentinelRef={sentinelRef}
        onScroll={handleScroll}
        loadingMore={isFetchingNextPage}
      />

      {/* Infinite Scroll Status Footer */}
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
          Showing <strong>{alerts.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> alerts
          {alerts.length > 0 && total > alerts.length && (
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
          {!hasNextPage && alerts.length > 0 && !loading && (
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
              ✓ All {total.toLocaleString()} alerts loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
