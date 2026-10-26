"use client";

import * as React from "react";
import { BLOTTER_CATEGORIES } from "../../../../lib/labels";

export interface BlotterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (columnKey: string, order: "asc" | "desc") => void;
  total: number;
  mayEncode: boolean;
  onOpenCreate: () => void;
  onOpenBulkAdd: () => void;
  onToggleTour?: (next?: boolean) => void;
  tourEnabled?: boolean;
}

export function BlotterToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
  total,
  mayEncode,
  onOpenCreate,
  onOpenBulkAdd,
  onToggleTour,
  tourEnabled,
}: BlotterToolbarProps) {
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);
  const isSearchActive = search.trim().length >= 3;
  const isSearchPending = search.trim().length > 0 && search.trim().length < 3;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginBottom: "1rem",
        backgroundColor: "var(--color-bg-card, #ffffff)",
        padding: "1rem",
        borderRadius: "0.5rem",
        border: "1px solid var(--color-border, #e2e8f0)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flex: 1, minWidth: "280px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type="text"
              placeholder="🔍 Search entry no., complainant, respondent, narrative… (min 3 chars)"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="cbms-input"
              style={{
                width: "100%",
                paddingRight: isSearchPending ? "120px" : "2rem",
              }}
            />
            {isSearchPending && (
              <span
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "10.5px",
                  color: "#d97706",
                  fontWeight: 600,
                  backgroundColor: "#fef3c7",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                Type {3 - search.trim().length} more
              </span>
            )}
            {search && !isSearchPending && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--cbms-muted, #64748b)",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="cbms-select"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}
          >
            <option value="all">All Categories</option>
            {BLOTTER_CATEGORIES.map((c) => (
              <option key={c} value={c} style={{ textTransform: "capitalize" }}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="cbms-select"
            style={{ fontSize: "0.85rem", padding: "0.4rem 0.6rem" }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
            <option value="endorsed">Endorsed to Lupon</option>
            <option value="dismissed">Dismissed</option>
          </select>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <button
                id="blotter-actions-btn"
                type="button"
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="cbms-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.45rem 0.85rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor: "var(--color-bg-card, #fff)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                }}
              >
                ⚙️ Actions ▾
              </button>
              {showActionsDropdown && (
                <>
                  <div
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                    onClick={() => setShowActionsDropdown(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "110%",
                      backgroundColor: "var(--color-bg-card, #ffffff)",
                      border: "1px solid var(--color-border, #e2e8f0)",
                      borderRadius: "0.375rem",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                      zIndex: 50,
                      minWidth: "190px",
                      display: "flex",
                      flexDirection: "column",
                      padding: "0.3rem 0",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onOpenCreate();
                        setShowActionsDropdown(false);
                      }}
                      style={{
                        padding: "0.6rem 1rem",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--color-text, #1b2430)",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      📋 Log Incident
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenBulkAdd();
                        setShowActionsDropdown(false);
                      }}
                      style={{
                        padding: "0.6rem 1rem",
                        textAlign: "left",
                        border: "none",
                        background: "none",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--color-text, #1b2430)",
                        fontWeight: 500,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      📦 Bulk Ingest
                    </button>
                    {onToggleTour && (
                      <>
                        <div style={{ height: "1px", backgroundColor: "var(--color-border, #e2e8f0)", margin: "0.25rem 0" }} />
                        <button
                          type="button"
                          onClick={() => {
                            onToggleTour();
                            setShowActionsDropdown(false);
                          }}
                          style={{
                            padding: "0.6rem 1rem",
                            textAlign: "left",
                            border: "none",
                            background: "none",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "var(--color-text, #1b2430)",
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                          }
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          🧭 {tourEnabled ? "Exit Walkthrough Guide" : "Guide"}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: "var(--cbms-muted, #64748b)",
          borderTop: "1px solid var(--color-border, #f1f5f9)",
          paddingTop: "0.5rem",
        }}
      >
        <span>
          Showing <strong>{total}</strong> official blotter incident{total === 1 ? "" : "s"}
          {isSearchActive && ` matching "${search.trim()}"`}
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value, sortOrder)}
            className="cbms-select"
            style={{ fontSize: "11.5px", padding: "2px 6px" }}
          >
            <option value="incidentAt">Incident Date</option>
            <option value="entryNo">Entry Number</option>
            <option value="status">Status</option>
            <option value="category">Category</option>
            <option value="reportedBy">Complainant</option>
            <option value="createdAt">Date Recorded</option>
          </select>
          <button
            type="button"
            className="cbms-btn cbms-btn--sm"
            onClick={() => onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
            title={`Toggle sort order (current: ${sortOrder.toUpperCase()})`}
            style={{ padding: "2px 8px", fontSize: "11px" }}
          >
            {sortOrder === "asc" ? "▲ Asc" : "▼ Desc"}
          </button>
        </div>
      </div>
    </div>
  );
}
