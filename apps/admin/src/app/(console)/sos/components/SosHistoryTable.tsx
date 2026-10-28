"use client";

import * as React from "react";
import { DataTable, Chip, StatusChip, dateTime } from "@cbms/ui";
import { SOS_KIND_ICON } from "../../../../lib/labels";
import type { SosAlert } from "../../../../lib/types";

export interface SosHistoryTableProps {
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
  onViewTimeline?: (alert: SosAlert) => void;
}

function formatElapsed(startIso: string, endIso?: string | null): string {
  if (!endIso) return "—";
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const mins = Math.max(0, Math.round((end - start) / 60000));
  if (mins < 1) return "< 1m";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m`;
}

export function SosHistoryTable({
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
  onViewTimeline,
}: SosHistoryTableProps) {
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
    <div id="sos-history-table-container">
      <DataTable
        columns={[
          {
            key: "kind",
            header: "Emergency / ID",
            width: "16%",
            sortable: true,
            render: (r: SosAlert) => {
              const icon = SOS_KIND_ICON[r.kind?.toLowerCase()] ?? "🚨";
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.25rem" }}>{icon}</span>
                  <div>
                    <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "12px" }}>
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
            header: "Caller / Resident",
            width: "16%",
            sortable: false,
            render: (r: SosAlert) => (
              <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 600, color: "var(--color-text, #1b2430)" }}>
                  {r.inhabitant
                    ? `${r.inhabitant.firstName} ${r.inhabitant.lastName}`
                    : "Unregistered Resident"}
                </span>
                {r.inhabitant?.contactPhone && (
                  <span style={{ color: "var(--cbms-muted, #64748b)", fontSize: "11px" }}>
                    📞 {r.inhabitant.contactPhone}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "createdAt",
            header: "Triggered / Reported",
            width: "15%",
            sortable: true,
            render: (r: SosAlert) => (
              <div style={{ fontSize: "12px" }}>
                <div style={{ fontWeight: 600, color: "var(--color-text, #1b2430)" }}>
                  {dateTime(r.createdAt)}
                </div>
              </div>
            ),
          },
          {
            key: "acknowledgedAt",
            header: "Acknowledged",
            width: "14%",
            sortable: true,
            render: (r: SosAlert) => {
              if (r.acknowledgedAt) {
                const elapsed = formatElapsed(r.createdAt, r.acknowledgedAt);
                return (
                  <div style={{ fontSize: "12px" }}>
                    <div style={{ fontWeight: 600, color: "#b45309" }}>
                      ⏱ +{elapsed}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                      {dateTime(r.acknowledgedAt)}
                    </div>
                  </div>
                );
              }
              return (
                <span style={{ fontSize: "11.5px", color: "#d97706", fontStyle: "italic" }}>
                  Pending Ack
                </span>
              );
            },
          },
          {
            key: "resolvedAt",
            header: "Resolved (Turnaround)",
            width: "15%",
            sortable: true,
            render: (r: SosAlert) => {
              if (r.resolvedAt) {
                const totalDuration = formatElapsed(r.createdAt, r.resolvedAt);
                return (
                  <div style={{ fontSize: "12px" }}>
                    <div style={{ fontWeight: 600, color: "#166534" }}>
                      ✓ {totalDuration} total
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                      {dateTime(r.resolvedAt)}
                    </div>
                  </div>
                );
              }
              return (
                <span style={{ fontSize: "11.5px", color: "var(--cbms-muted, #64748b)" }}>
                  {r.status === "false_alarm" ? "False Alarm" : "Active / In Progress"}
                </span>
              );
            },
          },
          {
            key: "responseNote",
            header: "Responder Log",
            width: "14%",
            sortable: false,
            render: (r: SosAlert) => (
              <div style={{ fontSize: "11.5px", color: "var(--color-text, #1b2430)" }}>
                {r.responseNote ? (
                  <span title={r.responseNote}>
                    {r.responseNote.length > 45 ? `${r.responseNote.slice(0, 45)}…` : r.responseNote}
                  </span>
                ) : (
                  <span style={{ color: "var(--cbms-muted, #64748b)", fontStyle: "italic" }}>
                    No notes recorded
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "status",
            header: "Outcome",
            width: "10%",
            sortable: true,
            render: (r: SosAlert) => (
              <StatusChip status={r.status || "active"} tone={getStatusTone(r.status) as any} />
            ),
          },
          {
            key: "actions",
            header: "Audit",
            width: "8%",
            sortable: false,
            render: (r: SosAlert) => (
              <button
                type="button"
                onClick={() => onViewTimeline?.(r)}
                style={{
                  background: "var(--color-bg-subtle, #f1f5f9)",
                  border: "1px solid var(--color-border, #cbd5e1)",
                  borderRadius: 4,
                  padding: "4px 8px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  color: "#0a2463",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>📜</span>
                <span>Track</span>
              </button>
            ),
          },
        ]}
        rows={alerts}
        loading={loading}
        rowKey={(row, i) => (row.id ? `hist-${row.id}-${i}` : `sos-hist-${i}`)}
        skeletonRows={20}
        empty={loading ? "Loading dispatch history..." : "No dispatch history records found."}
        stickyHeader
        maxHeight={maxHeight}
        minWidth={940}
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
          <strong>{total.toLocaleString()}</strong> history records
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
              ✓ All {total.toLocaleString()} history records loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
