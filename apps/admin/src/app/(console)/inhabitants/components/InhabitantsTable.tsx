"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DataTable, age, fullName } from "@cbms/ui";
import { SectorChips, SourceChip } from "../../../../components/common";
import type { Inhabitant } from "../../../../lib/types";

interface InhabitantsTableProps {
  inhabitants: Inhabitant[];
  loading: boolean;
  total: number;
  maxHeight?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function InhabitantsTable({
  inhabitants,
  loading,
  total,
  maxHeight = "clamp(420px, calc(100vh - 350px), 720px)",
  sortBy,
  sortOrder,
  onSort,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: InhabitantsTableProps) {
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

  return (
    <div id="tour-inhabitants-table">
      <DataTable
        columns={[
          {
            key: "name",
            header: "Citizen",
            width: "25%",
            sortable: true,
            render: (r: Inhabitant) => (
              <>
                <div className="cbms-table__primary">{fullName(r)}</div>
                <div className="cbms-table__muted">
                  {r.philsysNo ? `PCN ${r.philsysNo}` : "No PhilSys on file"}
                </div>
              </>
            ),
          },
          {
            key: "sexAge",
            header: "Sex / Age",
            width: "12%",
            sortable: true,
            render: (r: Inhabitant) =>
              `${r.sex === "male" ? "M" : "F"} · ${age(r.birthDate) ?? "—"} y/o`,
          },
          {
            key: "household",
            header: "Household / Address",
            width: "28%",
            sortable: true,
            render: (r: Inhabitant) =>
              r.household ? (
                <>
                  <div>{r.household.householdNo}</div>
                  <div className="cbms-table__muted">{r.household.addressLine ?? ""}</div>
                </>
              ) : (
                <span className="cbms-table__muted">Unassigned</span>
              ),
          },
          {
            key: "sectors",
            header: "Sectoral",
            width: "23%",
            sortable: false,
            render: (r: Inhabitant) => <SectorChips row={r} />,
          },
          {
            key: "source",
            header: "Source",
            width: "12%",
            sortable: true,
            render: (r: Inhabitant) => <SourceChip source={r.source} />,
          },
        ]}
        rows={inhabitants}
        loading={loading}
        rowKey={(row, i) => (row.id ? `${row.id}-${i}` : `row-${i}`)}
        skeletonRows={20}
        empty={loading ? "Loading inhabitants..." : "No inhabitants match this filter."}
        onRowClick={(r) => router.push(`/inhabitants/${r.id}/edit`)}
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
          Showing <strong>{inhabitants.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> inhabitants
          {inhabitants.length > 0 && total > inhabitants.length && (
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
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <span>Loading next 20 records...</span>
            </div>
          )}

          {!hasNextPage && inhabitants.length > 0 && (
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
