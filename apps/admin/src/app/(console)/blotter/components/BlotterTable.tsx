"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DataTable, Chip, StatusChip, dateTime } from "@cbms/ui";
import type { BlotterEntry } from "../../../../lib/types";

export interface BlotterTableProps {
  blotters: BlotterEntry[];
  loading: boolean;
  total: number;
  maxHeight?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onSelectDelete?: (entry: BlotterEntry) => void;
  onSelectEdit?: (entry: BlotterEntry) => void;
  mayEncode?: boolean;
}

export function BlotterTable({
  blotters,
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
  onSelectEdit,
  mayEncode,
}: BlotterTableProps) {
  const router = useRouter();
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
      case "resolved":
        return "success";
      case "endorsed":
        return "navy";
      case "dismissed":
        return "neutral";
      default:
        return "warn";
    }
  };

  return (
    <div id="blotter-table-container">
      <DataTable
        columns={[
          {
            key: "entryNo",
            header: "Entry No. & Confidentiality",
            width: "20%",
            sortable: true,
            render: (r: BlotterEntry) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span className="cbms-table__primary" style={{ fontWeight: 600 }}>
                  📋 {r.entryNo}
                </span>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {r.isConfidential ? (
                    <Chip tone="red">🔒 Confidential (RA 9262)</Chip>
                  ) : (
                    <span style={{ fontSize: "11px", color: "var(--cbms-muted, #64748b)" }}>
                      Public Incident
                    </span>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "incidentAt",
            header: "Incident Date & Location",
            width: "20%",
            sortable: true,
            render: (r: BlotterEntry) => (
              <div>
                <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--color-text, #1b2430)" }}>
                  {dateTime(r.incidentAt)}
                </div>
                <div className="cbms-table__muted" style={{ fontSize: "11px", marginTop: 2 }}>
                  📍 {r.location || "Location not stated"}
                </div>
              </div>
            ),
          },
          {
            key: "category",
            header: "Category",
            width: "15%",
            sortable: true,
            render: (r: BlotterEntry) => (
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 4,
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {r.category?.replace("_", " ") || "Other"}
              </span>
            ),
          },
          {
            key: "reportedBy",
            header: "Parties Involved",
            width: "22%",
            sortable: true,
            render: (r: BlotterEntry) => (
              <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: 2 }}>
                <div>
                  <strong style={{ color: "#0369a1" }}>Comp:</strong> {r.reportedBy || "Anonymous"}
                </div>
                {r.respondentName && (
                  <div style={{ color: "var(--cbms-muted, #64748b)" }}>
                    <strong style={{ color: "#b91c1c" }}>Resp:</strong> {r.respondentName}
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            width: "11%",
            sortable: true,
            render: (r: BlotterEntry) => (
              <StatusChip status={r.status || "active"} tone={getStatusTone(r.status) as any} />
            ),
          },
          {
            key: "actions",
            header: "Action",
            width: "8%",
            sortable: false,
            render: (r: BlotterEntry) => (
              <div
                style={{ display: "flex", gap: 6, alignItems: "center" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  title="View Incident Docket"
                  onClick={() => router.push(`/blotter/${r.id}`)}
                  style={{
                    background: "var(--color-bg-subtle, #f1f5f9)",
                    border: "1px solid var(--color-border, #cbd5e1)",
                    borderRadius: 4,
                    padding: "4px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--cbms-navy, #0a2463)",
                    cursor: "pointer",
                  }}
                >
                  👁️ View
                </button>
              </div>
            ),
          },
        ]}
        rows={blotters}
        loading={loading}
        rowKey={(row, i) => (row.id ? `${row.id}-${i}` : `blotter-${i}`)}
        skeletonRows={20}
        empty={loading ? "Loading incident blotters..." : "No incident blotters match this filter."}
        onRowClick={(r) => router.push(`/blotter/${r.id}`)}
        stickyHeader
        maxHeight={maxHeight}
        minWidth={840}
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
          Showing <strong>{blotters.length}</strong> of <strong>{total}</strong> loaded incidents
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isFetchingNextPage && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "var(--cbms-navy, #0a2463)",
                fontWeight: 600,
              }}
            >
              <span className="cbms-spinner" style={{ width: 14, height: 14 }} />
              Loading more records…
            </span>
          )}
          {hasNextPage && !isFetchingNextPage && (
            <button
              type="button"
              className="cbms-btn cbms-btn--sm"
              onClick={onLoadMore}
              style={{ fontSize: "12px", padding: "4px 12px" }}
            >
              Scroll or Click to Load Next 20
            </button>
          )}
          {!hasNextPage && blotters.length > 0 && !loading && (
            <span style={{ color: "#94a3b8", fontSize: "11.5px" }}>
              ✓ All {total} blotter records loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
