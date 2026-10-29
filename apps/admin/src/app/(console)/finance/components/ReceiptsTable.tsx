"use client";

import * as React from "react";
import { DataTable, dateTime, pesoAmount } from "@cbms/ui";
import type { OfficialReceipt } from "../../../../lib/types";

export interface ReceiptsTableProps {
  receipts: OfficialReceipt[];
  loading: boolean;
  total: number;
  maxHeight?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onCancelReceipt?: (receipt: OfficialReceipt) => void;
  busyId?: string | null;
  mayCancel?: boolean;
}

export function ReceiptsTable({
  receipts,
  loading,
  total,
  maxHeight = "clamp(420px, calc(100vh - 350px), 720px)",
  sortBy = "issuedAt",
  sortOrder = "desc",
  onSort,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onCancelReceipt,
  busyId,
  mayCancel,
}: ReceiptsTableProps) {
  const sentinelRef = React.useRef<HTMLTableRowElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
      { root: containerEl, rootMargin: "200px", threshold: 0.05 }
    );

    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [onLoadMore, hasNextPage, isFetchingNextPage]);

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
      header: "OR Number",
      width: "14%",
      sortable: true,
      render: (r: OfficialReceipt) => (
        <span className="cbms-table__primary" style={{ fontFamily: "monospace", fontWeight: 700 }}>
          {r.orNumber}
        </span>
      ),
    },
    {
      key: "issuedAt",
      header: "Issued Date",
      width: "14%",
      sortable: true,
      render: (r: OfficialReceipt) => (
        <div className="cbms-table__muted" style={{ fontWeight: 500 }}>
          {r.issuedAt ? dateTime(r.issuedAt) : "—"}
        </div>
      ),
    },
    {
      key: "payorName",
      header: "Payor / Citizen",
      width: "24%",
      sortable: true,
      render: (r: OfficialReceipt) => (
        <div className="cbms-table__primary" style={{ fontWeight: 600 }}>
          {r.payorName}
        </div>
      ),
    },
    {
      key: "particulars",
      header: "Particulars",
      width: "20%",
      sortable: false,
      render: (r: OfficialReceipt) => (
        <>
          <div>{r.particulars}</div>
          {r.cancellationReason && (
            <div className="cbms-table__muted" style={{ color: "var(--cbms-red, #b91c1c)" }}>
              Voided: {r.cancellationReason}
            </div>
          )}
        </>
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment",
      width: "10%",
      sortable: true,
      render: (r: OfficialReceipt) => (
        <span className="cbms-table__muted" style={{ textTransform: "uppercase", fontWeight: 600 }}>
          {r.paymentMethod || "CASH"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: "10%",
      sortable: true,
      render: (r: OfficialReceipt) => (
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            fontWeight: 700,
            color: "#0b7a5e",
          }}
        >
          {pesoAmount(r.amount)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "8%",
      sortable: false,
      render: (r: OfficialReceipt) => {
        const isBusy = busyId === r.id;
        const isCancelled = r.status === "cancelled";
        if (isCancelled || !mayCancel) return <span className="cbms-table__muted">—</span>;

        return (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              title="Void Official Receipt"
              onClick={() => onCancelReceipt?.(r)}
              disabled={isBusy}
              className="cbms-btn"
              style={{
                fontSize: "11px",
                padding: "3px 8px",
                fontWeight: 600,
                color: "#dc2626",
                cursor: isBusy ? "not-allowed" : "pointer",
              }}
            >
              {isBusy ? "…" : "Void"}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div id="tour-finance-receipts-table">
      <DataTable
        columns={columns}
        rows={receipts}
        rowKey={(r, i) => (r.id ? `${r.id}-${i}` : `row-${i}`)}
        loading={loading}
        skeletonRows={20}
        empty={loading ? "Loading official receipts..." : "No official receipts found."}
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
          Showing <strong>{receipts.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> receipts
          {receipts.length > 0 && total > receipts.length && (
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

          {!hasNextPage && receipts.length > 0 && (
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
              ✓ All {total.toLocaleString()} receipts loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
