"use client";

import * as React from "react";
import { DataTable, Chip, dateTime, pesoAmount } from "@cbms/ui";
import { getAccountTitle } from "../../../../lib/chart-of-accounts";
import type { LedgerEntry } from "../../../../lib/types";

export interface LedgerTableProps {
  entries: LedgerEntry[];
  loading: boolean;
  total: number;
  maxHeight?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onSelectDelete?: (entry: LedgerEntry) => void;
  onRowClick?: (entry: LedgerEntry) => void;
  busyId?: string | null;
  mayDelete?: boolean;
}

export function LedgerTable({
  entries,
  loading,
  total,
  maxHeight = "clamp(420px, calc(100vh - 350px), 720px)",
  sortBy = "postedAt",
  sortOrder = "desc",
  onSort,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onSelectDelete,
  onRowClick,
  busyId,
  mayDelete,
}: LedgerTableProps) {
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

  const columns = [
    {
      key: "orNumber",
      header: "Reference / OR",
      width: "14%",
      sortable: true,
      render: (r: LedgerEntry) => (
        <div className="cbms-table__primary" style={{ fontWeight: 600, fontFamily: "monospace" }}>
          {r.orNumber ? `OR ${r.orNumber}` : r.dvNumber ? `DV ${r.dvNumber}` : `Ref: ${r.id.slice(0, 8)}`}
        </div>
      ),
    },
    {
      key: "postedAt",
      header: "Posted Date",
      width: "14%",
      sortable: true,
      render: (r: LedgerEntry) => (
        <div className="cbms-table__muted" style={{ fontWeight: 500 }}>
          {r.postedAt ? dateTime(r.postedAt) : "—"}
        </div>
      ),
    },
    {
      key: "description",
      header: "Particulars & Account",
      width: "26%",
      sortable: true,
      render: (r: LedgerEntry) => {
        const title = getAccountTitle(r.accountCode, r.description);
        return (
          <>
            <div className="cbms-table__primary" style={{ fontWeight: 600 }}>
              {title}
            </div>
            <div className="cbms-table__muted">
              {r.description && r.description !== title ? `${r.description} · ` : ""}
              {r.payorPayee ? `Party: ${r.payorPayee} · ` : ""}
              <code style={{ fontSize: "11px", opacity: 0.85 }}>{r.accountCode}</code>
            </div>
          </>
        );
      },
    },
    {
      key: "fund",
      header: "Fund",
      width: "14%",
      sortable: true,
      render: (r: LedgerEntry) => {
        const fundLabels: Record<string, string> = {
          general: "General Fund",
          bdrrmf: "BDRRMF (5%)",
          development: "Dev Fund (20%)",
          sk: "SK Fund (10%)",
          gad: "GAD (5%)",
        };
        return <Chip tone="gray">{fundLabels[r.fund] ?? r.fund.toUpperCase()}</Chip>;
      },
    },
    {
      key: "direction",
      header: "Flow",
      width: "11%",
      sortable: true,
      render: (r: LedgerEntry) => {
        const isCredit = r.direction === "credit";
        return (
          <Chip tone={isCredit ? "green" : "red"}>
            {isCredit ? "Collection" : "Disbursement"}
          </Chip>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      width: "13%",
      sortable: true,
      render: (r: LedgerEntry) => {
        const isCredit = r.direction === "credit";
        return (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              fontWeight: 700,
              color: isCredit ? "#0b7a5e" : "#b91c1c",
            }}
          >
            {isCredit ? "+" : "-"}
            {pesoAmount(r.amount)}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "8%",
      sortable: false,
      render: (r: LedgerEntry) => (
        <div
          style={{ display: "flex", gap: 6, alignItems: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="View Transaction Dossier"
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
        </div>
      ),
    },
  ];

  return (
    <div id="tour-finance-ledger-table">
      <DataTable
        columns={columns}
        rows={entries}
        rowKey={(r, i) => (r.id ? `${r.id}-${i}` : `row-${i}`)}
        loading={loading}
        skeletonRows={20}
        empty={loading ? "Loading transactions..." : "No financial ledger transactions found."}
        onRowClick={onRowClick}
        stickyHeader
        maxHeight={maxHeight}
        minWidth={780}
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
          Showing <strong>{entries.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> transactions
          {entries.length > 0 && total > entries.length && (
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

          {!hasNextPage && entries.length > 0 && (
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
              ✓ All {total.toLocaleString()} records loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
