"use client";

import * as React from "react";
import { DataTable, StatusChip, pesoAmount, type Column } from "@cbms/ui";

export interface ObligationItem {
  id: string;
  ppaCode: string;
  title: string;
  fund: "bdf" | "bdrrmf" | "sk" | "gad" | "general" | string;
  particulars: string;
  payee: string;
  allotmentAmount: number;
  obligatedAmount: number;
  balanceAmount: number;
  status: "obligated" | "disbursed" | "pending";
  date: string;
}

export interface BudgetTableProps {
  items: ObligationItem[];
  loading?: boolean;
  total?: number;
  maxHeight?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (item: ObligationItem) => void;
  onSelectDelete?: (item: ObligationItem) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  mayDelete?: boolean;
  busyId?: string | null;
}

export function BudgetTable({
  items,
  loading = false,
  total = 0,
  maxHeight = "clamp(420px, calc(100vh - 350px), 720px)",
  sortBy = "date",
  sortOrder = "desc",
  onSort,
  onRowClick,
  onSelectDelete,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  mayDelete = false,
  busyId,
}: BudgetTableProps) {
  const sentinelRef = React.useRef<HTMLTableRowElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // IntersectionObserver for auto-triggering lazy loading when scrolling near the end
  React.useEffect(() => {
    if (!onLoadMore || !hasNextPage || isFetchingNextPage) return;

    const sentinelEl = sentinelRef.current;
    const containerEl = containerRef.current;
    if (!sentinelEl) return;

    const observer = new IntersectionObserver(
      (entriesList) => {
        if (entriesList[0]?.isIntersecting) {
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

  const columns: Column<ObligationItem>[] = [
    {
      key: "ppaCode",
      header: "PPA / Ref Code",
      sortable: true,
      width: "15%",
      render: (r) => (
        <div>
          <strong style={{ fontFamily: "monospace", color: "var(--cbms-navy, #0a2463)" }}>
            {r.ppaCode}
          </strong>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.date}</div>
        </div>
      ),
    },
    {
      key: "title",
      header: "Program / Project / Activity",
      sortable: true,
      width: "25%",
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a" }}>{r.title}</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Payee: {r.payee}</div>
        </div>
      ),
    },
    {
      key: "fund",
      header: "Statutory Fund",
      sortable: true,
      width: "14%",
      render: (r) => {
        const labels: Record<string, string> = {
          bdf: "20% BDF",
          bdrrmf: "5% BDRRMF",
          sk: "10% SK Fund",
          gad: "5% GAD",
          general: "General Fund",
        };
        return (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              backgroundColor:
                r.fund === "bdf"
                  ? "#eff6ff"
                  : r.fund === "bdrrmf"
                  ? "#fef2f2"
                  : r.fund === "sk"
                  ? "#fefce8"
                  : r.fund === "gad"
                  ? "#f5f3ff"
                  : "#f1f5f9",
              color:
                r.fund === "bdf"
                  ? "#1d4ed8"
                  : r.fund === "bdrrmf"
                  ? "#b91c1c"
                  : r.fund === "sk"
                  ? "#854d0e"
                  : r.fund === "gad"
                  ? "#6d28d9"
                  : "#334155",
            }}
          >
            {labels[r.fund] || r.fund.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "allotmentAmount",
      header: "Allotment",
      align: "right",
      sortable: true,
      width: "12%",
      render: (r) => (
        <span style={{ fontFamily: "monospace" }}>{pesoAmount(r.allotmentAmount)}</span>
      ),
    },
    {
      key: "obligatedAmount",
      header: "Obligated",
      align: "right",
      sortable: true,
      width: "12%",
      render: (r) => (
        <strong style={{ fontFamily: "monospace", color: "#1d4ed8" }}>
          {pesoAmount(r.obligatedAmount)}
        </strong>
      ),
    },
    {
      key: "balanceAmount",
      header: "Unobligated Balance",
      align: "right",
      sortable: true,
      width: "12%",
      render: (r) => (
        <span style={{ fontFamily: "monospace", color: "#059669", fontWeight: 600 }}>
          {pesoAmount(r.balanceAmount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      sortable: true,
      width: "10%",
      render: (r) => <StatusChip status={r.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      width: "8%",
      sortable: false,
      render: (r) => (
        <div
          style={{ display: "flex", gap: 6, alignItems: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="View Obligation Details"
            onClick={() => onRowClick?.(r)}
            className="cbms-btn"
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              fontWeight: 600,
              color: "var(--cbms-navy, #0a2463)",
              cursor: "pointer",
            }}
          >
            View
          </button>
          {mayDelete && onSelectDelete && (
            <button
              type="button"
              title="Cancel / Delete Obligation"
              onClick={() => onSelectDelete(r)}
              disabled={busyId === r.id}
              className="cbms-btn"
              style={{
                fontSize: "11px",
                padding: "3px 8px",
                fontWeight: 600,
                color: "#b91c1c",
                cursor: busyId === r.id ? "not-allowed" : "pointer",
                border: "1px solid #fecaca",
                backgroundColor: "#fff5f5",
                borderRadius: "4px",
              }}
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div id="tour-budget-table">
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(r, i) => (r.id ? `${r.id}-${i}` : `row-${i}`)}
        loading={loading}
        skeletonRows={20}
        empty={loading ? "Loading statutory obligations..." : "No statutory obligations found."}
        onRowClick={onRowClick}
        stickyHeader
        maxHeight={maxHeight}
        minWidth={850}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        containerRef={containerRef}
        sentinelRef={sentinelRef}
        onScroll={handleScroll}
        loadingMore={isFetchingNextPage}
      />

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
          Showing <strong>{items.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> RAAO statutory obligation(s)
          {items.length > 0 && total > items.length && (
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

          {!hasNextPage && items.length > 0 && (
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
              ✓ All {total.toLocaleString()} obligations loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
