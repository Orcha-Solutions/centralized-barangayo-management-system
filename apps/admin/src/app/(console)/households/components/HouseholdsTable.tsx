"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DataTable, Chip, peso } from "@cbms/ui";
import type { Household } from "../../../../lib/types";

export interface HouseholdsTableProps {
  households: Household[];
  loading: boolean;
  total: number;
  maxHeight?: string | number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onSelectDelete?: (household: Household) => void;
  mayEncode?: boolean;
}

export function HouseholdsTable({
  households,
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
  mayEncode,
}: HouseholdsTableProps) {
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
    <div id="households-table-container">
      <DataTable
        columns={[
          {
            key: "householdNo",
            header: "Household No / Family",
            width: "25%",
            sortable: true,
            render: (r: Household) => (
              <>
                <div className="cbms-table__primary" style={{ fontWeight: 600 }}>
                  {r.householdNo}
                </div>
                <div className="cbms-table__muted">
                  {r.householdName || "Unnamed Family"}
                </div>
              </>
            ),
          },
          {
            key: "purok",
            header: "Purok & Address",
            width: "25%",
            sortable: true,
            render: (r: Household) => (
              <>
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "1px 6px",
                      borderRadius: 4,
                      backgroundColor: "#f1f5f9",
                      color: "#334155",
                      fontSize: "11px",
                      fontWeight: 600,
                      marginRight: 6,
                    }}
                  >
                    {r.purok || "Unassigned"}
                  </span>
                </div>
                <div className="cbms-table__muted" style={{ fontSize: "11.5px", marginTop: 2 }}>
                  {r.addressLine || r.street || "No address on file"}
                </div>
              </>
            ),
          },
          {
            key: "householdType",
            header: "Classification",
            width: "18%",
            sortable: true,
            render: (r: Household) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ textTransform: "capitalize", fontSize: "12px", fontWeight: 500 }}>
                  {r.householdType || "Nuclear"}
                </span>
                <span className="cbms-table__muted" style={{ fontSize: "11px", textTransform: "capitalize" }}>
                  {r.tenureStatus || "Owner"} · {r.housingUnit?.replace("_", " ") || "Single"}
                </span>
              </div>
            ),
          },
          {
            key: "numMembers",
            header: "Members",
            width: "10%",
            sortable: true,
            render: (r: Household) => {
              const count = r.members?.length ?? r.numMembers ?? 0;
              return (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 26,
                    height: 22,
                    padding: "0 6px",
                    borderRadius: 999,
                    backgroundColor: count > 0 ? "#eff6ff" : "#f1f5f9",
                    color: count > 0 ? "#1d4ed8" : "#64748b",
                    fontSize: "11.5px",
                    fontWeight: 600,
                  }}
                >
                  {count}
                </span>
              );
            },
          },
          {
            key: "monthlyIncome",
            header: "Income / Mo.",
            width: "12%",
            sortable: true,
            render: (r: Household) => (
              <span style={{ fontSize: "12px", fontWeight: 500 }}>
                {r.monthlyIncome ? peso(r.monthlyIncome) : "₱0.00"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            width: "10%",
            sortable: false,
            render: (r: Household) => (
              <div
                style={{ display: "flex", gap: 6, alignItems: "center" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  title="View / Edit Household"
                  onClick={() => router.push(`/households/${r.id}`)}
                  style={{
                    background: "none",
                    border: "1px solid #cbd5e1",
                    borderRadius: 4,
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--cbms-navy, #0a2463)",
                    cursor: "pointer",
                  }}
                >
                  View
                </button>
                {mayEncode && onSelectDelete && (
                  <button
                    type="button"
                    title="Delete Household"
                    onClick={() => onSelectDelete(r)}
                    style={{
                      background: "none",
                      border: "1px solid #fecaca",
                      borderRadius: 4,
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--cbms-red, #ce1126)",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            ),
          },
        ]}
        rows={households}
        loading={loading}
        rowKey={(row, i) => (row.id ? `${row.id}-${i}` : `row-${i}`)}
        skeletonRows={20}
        empty={loading ? "Loading households..." : "No households match this filter."}
        onRowClick={(r) => router.push(`/households/${r.id}`)}
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
          Showing <strong>{households.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> households
          {households.length > 0 && total > households.length && (
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

          {!hasNextPage && households.length > 0 && (
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
              ✓ All {total.toLocaleString()} households loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
