"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Chip, DataTable, StatusChip, date, num } from "@cbms/ui";
import { DeadlineCell } from "../../../../components/common";
import type { KpCase } from "../../../../lib/types";

export interface KpTableProps {
  cases: KpCase[];
  total?: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (columnKey: string) => void;
  canManage: boolean;
  onDelete: (c: KpCase) => void;
  transactingId: string | null;
}

export function KpTable({
  cases,
  total: totalProp,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  sortBy,
  sortOrder,
  onSort,
  canManage,
  onDelete,
  transactingId,
}: KpTableProps) {
  const router = useRouter();
  const total = totalProp ?? cases.length;
  const sentinelRef = React.useRef<HTMLTableRowElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Auto-trigger infinite lazy load when scrolling near the end
  React.useEffect(() => {
    if (!fetchNextPage || !hasNextPage || isFetchingNextPage || isLoading) return;

    const sentinelEl = sentinelRef.current;
    const containerEl = containerRef.current;
    if (!sentinelEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading]);

  // Fallback scroll listener for scroll container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!fetchNextPage || !hasNextPage || isFetchingNextPage || isLoading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      fetchNextPage();
    }
  };

  return (
    <div
      style={{
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "0.5rem",
        overflow: "hidden",
        backgroundColor: "var(--color-bg-card, #ffffff)",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      }}
    >
      <DataTable
        columns={[
          {
            key: "caseNo",
            header: "Case Docket",
            width: "20%",
            sortable: true,
            render: (r: KpCase) => (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="cbms-table__primary" style={{ fontWeight: 600 }}>
                    {r.caseNo}
                  </span>
                  {r.isLocked && <Chip tone="red">🔒 Locked</Chip>}
                  {r.isConfidential && <Chip tone="red">🔒 Confidential</Chip>}
                </div>
                <div
                  className="cbms-table__muted"
                  style={{
                    fontSize: "11px",
                    marginTop: 2,
                    maxWidth: 240,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={r.subject}
                >
                  {r.isConfidential ? "[Restricted VAWC/VAC Track]" : r.subject}
                </div>
              </div>
            ),
          },
          {
            key: "parties",
            header: "Dispute Parties",
            width: "24%",
            sortable: false,
            render: (r: KpCase) => (
              <div style={{ fontSize: "12px", display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 260 }}>
                {(r.parties ?? []).map((p) => {
                  const partyName = p.inhabitant
                    ? `${p.inhabitant.firstName} ${p.inhabitant.lastName}`
                    : (p.nameOverride ?? "—");
                  const isComp = p.role === "complainant";
                  return (
                    <Chip key={p.id} tone={isComp ? "blue" : "gray"}>
                      <span style={{ fontWeight: 600, fontSize: "10.5px", marginRight: 3 }}>
                        {isComp ? "C:" : "R:"}
                      </span>
                      {partyName}
                    </Chip>
                  );
                })}
                {(r.parties ?? []).length === 0 && <span className="cbms-table__muted">—</span>}
              </div>
            ),
          },
          {
            key: "stage",
            header: "Statutory Stage",
            width: "15%",
            sortable: true,
            render: (r: KpCase) => <StatusChip status={r.stage} />,
          },
          {
            key: "filedAt",
            header: "Date Filed",
            width: "13%",
            sortable: true,
            render: (r: KpCase) => (
              <div style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--color-text, #1b2430)" }}>
                {date(r.filedAt)}
              </div>
            ),
          },
          {
            key: "mediationDueAt",
            header: "Statutory Clock",
            width: "16%",
            sortable: true,
            render: (r: KpCase) => (
              <DeadlineCell
                dueAt={r.deadline?.dueAt}
                daysRemaining={r.deadline?.daysRemaining}
                breached={r.deadline?.breached}
              />
            ),
          },
          {
            key: "hearings",
            header: "Hearings",
            width: "6%",
            align: "right",
            sortable: false,
            render: (r: KpCase) => (
              <span style={{ fontSize: "12.5px", fontWeight: 600 }}>
                {num(r._count?.hearings ?? r.hearings?.length ?? 0)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Action",
            width: "8%",
            align: "right",
            sortable: false,
            render: (r: KpCase) => (
              <div
                style={{ display: "inline-flex", gap: 4, alignItems: "center" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  title="Open Case Docket"
                  onClick={() => router.push(`/kp/${r.id}`)}
                  style={{
                    background: "var(--color-bg-subtle, #f1f5f9)",
                    border: "1px solid var(--color-border, #cbd5e1)",
                    borderRadius: 4,
                    padding: "3px 8px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "var(--cbms-navy, #0a2463)",
                    cursor: "pointer",
                  }}
                >
                  📂 Open
                </button>
                {canManage && (
                  <button
                    type="button"
                    title={r.isLocked ? "Case docket is locked. Unlock it before deleting." : "Delete Case Record"}
                    disabled={transactingId === r.id || Boolean(r.isLocked)}
                    onClick={() => onDelete(r)}
                    style={{
                      background: r.isLocked ? "#f1f5f9" : "#fef2f2",
                      border: `1px solid ${r.isLocked ? "#e2e8f0" : "#fee2e2"}`,
                      borderRadius: 4,
                      padding: "3px 6px",
                      fontSize: "11.5px",
                      color: r.isLocked ? "#94a3b8" : "#dc2626",
                      cursor: r.isLocked ? "not-allowed" : "pointer",
                    }}
                  >
                    {transactingId === r.id ? "..." : r.isLocked ? "🔒" : "🗑️"}
                  </button>
                )}
              </div>
            ),
          },
        ]}
        rows={cases}
        loading={isLoading && cases.length === 0}
        rowKey={(row, i) => (row.id ? `${row.id}-${i}` : `kp-${i}`)}
        skeletonRows={20}
        empty={isLoading ? "Loading KP cases..." : "No Katarungang Pambarangay cases match this filter."}
        onRowClick={(r) => router.push(`/kp/${r.id}`)}
        stickyHeader
        maxHeight="calc(100vh - 280px)"
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
          Showing <strong>{cases.length.toLocaleString()}</strong> of{" "}
          <strong>{total.toLocaleString()}</strong> cases
          {cases.length > 0 && total > cases.length && (
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
          {!hasNextPage && cases.length > 0 && !isLoading && (
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
              ✓ All {total.toLocaleString()} cases loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
