"use client";

import * as React from "react";
import { DataTable, Chip, StatusChip, date, pesoAmount, titleize } from "@cbms/ui";
import type { RptPropertyItem, RptTaxDueItem } from "../../../../lib/rpt-queries";

export interface RptTableProps {
  properties: RptPropertyItem[];
  dues: RptTaxDueItem[];
  loading: boolean;
  total: number;
  maxHeight?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onRowClick?: (prop: RptPropertyItem) => void;
}

export function RptTable({
  properties,
  dues,
  loading,
  total,
  maxHeight = "clamp(420px, calc(100vh - 350px), 720px)",
  sortBy = "taxDeclarationNo",
  sortOrder = "asc",
  onSort,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRowClick,
}: RptTableProps) {
  const sentinelRef = React.useRef<HTMLTableRowElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Map propertyId -> latest RptTaxDueItem for O(1) lookup
  const dueByPropertyId = React.useMemo(() => {
    const map = new Map<string, RptTaxDueItem>();
    for (const d of dues) {
      const existing = map.get(d.rptPropertyId);
      if (!existing || d.taxYear >= existing.taxYear) {
        map.set(d.rptPropertyId, d);
      }
    }
    return map;
  }, [dues]);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || !hasNextPage || isFetchingNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      onLoadMore();
    }
  };

  const columns = [
    {
      key: "taxDeclarationNo",
      header: "Tax Declaration #",
      width: "14%",
      sortable: true,
      render: (r: RptPropertyItem) => (
        <>
          <div className="cbms-table__primary" style={{ fontWeight: 600, fontFamily: "monospace" }}>
            {r.taxDeclarationNo}
          </div>
          <div className="cbms-table__muted">
            {r.lotNo ? `Lot ${r.lotNo}` : "Lot —"}
            {r.blockNo ? `, Blk ${r.blockNo}` : ""}
          </div>
        </>
      ),
    },
    {
      key: "ownerName",
      header: "Property Owner & Location",
      width: "24%",
      sortable: true,
      render: (r: RptPropertyItem) => (
        <>
          <div className="cbms-table__primary" style={{ fontWeight: 600 }}>
            {r.ownerName}
          </div>
          <div className="cbms-table__muted">
            {r.addressLine}
            {r.purok ? ` · ${r.purok}` : ""}
          </div>
        </>
      ),
    },
    {
      key: "propertyType",
      header: "Classification",
      width: "12%",
      sortable: true,
      render: (r: RptPropertyItem) => {
        const toneMap: Record<string, "blue" | "gold" | "green" | "gray"> = {
          residential: "blue",
          commercial: "gold",
          industrial: "gray",
          agricultural: "green",
          special: "gray",
        };
        return <Chip tone={toneMap[r.propertyType] || "gray"}>{titleize(r.propertyType)}</Chip>;
      },
    },
    {
      key: "assessedValueCentavos",
      header: "Assessed Value",
      width: "14%",
      sortable: true,
      render: (r: RptPropertyItem) => (
        <>
          <div className="cbms-table__primary" style={{ fontFamily: "monospace", fontWeight: 700 }}>
            {pesoAmount(r.assessedValue)}
          </div>
          <div className="cbms-table__muted" style={{ fontFamily: "monospace", fontSize: "11px" }}>
            MV: {pesoAmount(r.marketValue)}
          </div>
        </>
      ),
    },
    {
      key: "barangayShare",
      header: "25% Brgy Share / Due",
      width: "14%",
      sortable: false,
      render: (r: RptPropertyItem) => {
        const due = dueByPropertyId.get(r.id);
        const brgyShare = due ? due.barangayShareAmount : Math.round(r.assessedValue * 0.01 * 0.25);
        const totalDue = due ? due.totalAmount : Math.round(r.assessedValue * 0.02);
        return (
          <>
            <div
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#0b7a5e",
                fontSize: "13px",
              }}
            >
              +{pesoAmount(brgyShare)}
            </div>
            <div className="cbms-table__muted" style={{ fontSize: "11px" }}>
              Total Due: {pesoAmount(totalDue)} {due ? `(FY ${due.taxYear})` : ""}
            </div>
          </>
        );
      },
    },
    {
      key: "createdAt",
      header: "Declared Date",
      width: "10%",
      sortable: true,
      render: (r: RptPropertyItem) => (
        <div className="cbms-table__muted" style={{ fontWeight: 500 }}>
          {r.createdAt ? date(r.createdAt) : "—"}
        </div>
      ),
    },
    {
      key: "paymentStatus",
      header: "Status",
      width: "8%",
      sortable: false,
      render: (r: RptPropertyItem) => {
        const due = dueByPropertyId.get(r.id);
        const status = due?.paymentStatus || "unpaid";
        return (
          <div>
            <StatusChip status={status} />
            {due?.orNumber && (
              <div className="cbms-table__muted" style={{ fontSize: "10.5px", marginTop: 2, fontFamily: "monospace" }}>
                {due.orNumber}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      width: "6%",
      sortable: false,
      render: (r: RptPropertyItem) => (
        <div
          style={{ display: "flex", gap: 6, alignItems: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            title="View Property Tax Dossier"
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
    <div id="tour-rpt-table">
      <DataTable
        columns={columns}
        rows={properties}
        rowKey={(r, i) => (r.id ? `${r.id}-${i}` : `row-${i}`)}
        loading={loading}
        skeletonRows={20}
        empty={loading ? "Loading RPT declarations..." : "No Real Property Tax declarations found."}
        onRowClick={onRowClick}
        stickyHeader
        maxHeight={maxHeight}
        minWidth={860}
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
          Showing <strong>{properties.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> RPT declaration(s)
          {properties.length > 0 && total > properties.length && (
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

          {!hasNextPage && properties.length > 0 && (
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
