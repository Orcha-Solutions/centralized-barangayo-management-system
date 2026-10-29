"use client";

import * as React from "react";
import { Button, Toolbar, num } from "@cbms/ui";
import {
  RptFilterPopover,
  RPT_TAX_YEARS,
  RPT_PROPERTY_TYPES,
  RPT_PAYMENT_STATUSES,
} from "./RptFilterPopover";
import type { RptFilterState } from "../../../../store/useRptStore";

export interface RptToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: RptFilterState;
  onFiltersChange: (next: RptFilterState) => void;
  onResetFilters: () => void;
  totalCount: number;
  mayDeclare: boolean;
  onOpenDeclare: () => void;
  onExportCsv: () => void;
  tourEnabled?: boolean;
  onToggleTour?: (enabled: boolean) => void;
}

export function RptToolbar({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onResetFilters,
  totalCount,
  mayDeclare,
  onOpenDeclare,
  onExportCsv,
  tourEnabled,
  onToggleTour,
}: RptToolbarProps) {
  const [inputValue, setInputValue] = React.useState(searchQuery);
  const [showFilterPopover, setShowFilterPopover] = React.useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);

  React.useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounced server-side search trigger: requires >= 3 characters or empty string
  React.useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) {
      if (searchQuery !== "") {
        onSearchChange("");
      }
      return;
    }
    if (trimmed.length < 3) {
      return;
    }

    const timer = setTimeout(() => {
      onSearchChange(trimmed);
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue, searchQuery, onSearchChange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed.length === 0 || trimmed.length >= 3) {
      onSearchChange(trimmed);
    }
  };

  const isShortInput = inputValue.trim().length > 0 && inputValue.trim().length < 3;

  const activeFilterCount = [
    filters.year !== "all",
    Boolean(filters.dateFrom),
    Boolean(filters.dateTo),
    filters.propertyType !== "all",
    filters.paymentStatus !== "all",
    filters.purok !== "all",
  ].filter(Boolean).length;

  const currentYearLabel =
    RPT_TAX_YEARS.find((y) => y.value === filters.year)?.label || `FY ${filters.year}`;
  const currentTypeLabel =
    RPT_PROPERTY_TYPES.find((t) => t.value === filters.propertyType)?.label || filters.propertyType;
  const currentStatusLabel =
    RPT_PAYMENT_STATUSES.find((s) => s.value === filters.paymentStatus)?.label ||
    filters.paymentStatus;

  return (
    <div id="tour-rpt-toolbar" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Toolbar>
        {/* Server-Side Search Bar (3-char minimum) */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              className="cbms-input cbms-input--search"
              placeholder="Search TDN #, owner name, address, lot…"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                borderColor: isShortInput ? "#f59e0b" : undefined,
              }}
            />
            {isShortInput && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: "105%",
                  fontSize: "11px",
                  color: "#b45309",
                  background: "#fef3c7",
                  border: "1px solid #fde68a",
                  padding: "2px 8px",
                  borderRadius: 4,
                  zIndex: 20,
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.08)",
                }}
              >
                Type at least 3 characters to search
              </span>
            )}
          </div>
          <Button type="submit" disabled={isShortInput}>
            Search
          </Button>
        </form>

        {/* Filter Pop-up Trigger Button */}
        <div style={{ position: "relative" }}>
          <Button
            id="rpt-filter-btn"
            type="button"
            variant={activeFilterCount > 0 ? "primary" : "secondary"}
            onClick={() => setShowFilterPopover(!showFilterPopover)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <span>🎛️</span>
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  color: "#1d4ed8",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  borderRadius: "10px",
                  padding: "0 6px",
                  minWidth: "18px",
                  textAlign: "center",
                  lineHeight: "18px",
                }}
              >
                {activeFilterCount}
              </span>
            )}
            <span style={{ fontSize: "0.7rem", opacity: 0.85 }}>▾</span>
          </Button>

          <RptFilterPopover
            isOpen={showFilterPopover}
            onClose={() => setShowFilterPopover(false)}
            values={filters}
            onApply={onFiltersChange}
            onReset={onResetFilters}
          />
        </div>

        {/* Clear Filters Quick Link */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted, #64748b)",
              fontSize: "0.8rem",
              textDecoration: "underline",
              cursor: "pointer",
              padding: "4px 6px",
            }}
          >
            Clear filters
          </button>
        )}

        <div className="cbms-toolbar__spacer" />

        <span className="adm-muted" style={{ marginRight: "1rem" }}>
          {num(totalCount)} declaration(s)
        </span>

        {/* Primary Actions ▾ Menu */}
        <div id="tour-rpt-declare-btn" style={{ position: "relative" }}>
          <Button
            type="button"
            variant="primary"
            onClick={() => setShowActionsDropdown(!showActionsDropdown)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ⚙️ Actions ▾
          </Button>

          {showActionsDropdown && (
            <>
              <div
                style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                onClick={() => setShowActionsDropdown(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  zIndex: 100,
                  width: "260px",
                  backgroundColor: "var(--color-bg-card, #ffffff)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                  borderRadius: "0.5rem",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  padding: "0.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                {mayDeclare && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionsDropdown(false);
                      onOpenDeclare();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      width: "100%",
                      padding: "0.625rem 0.75rem",
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      fontSize: "0.875rem",
                      fontWeight: 400,
                      color: "var(--color-text, #1e293b)",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>🏛️</span>
                    <div style={{ fontWeight: 400 }}>Declare Real Property</div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowActionsDropdown(false);
                    onExportCsv();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    width: "100%",
                    padding: "0.625rem 0.75rem",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    color: "var(--color-text, #1e293b)",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>📥</span>
                  <div style={{ fontWeight: 400 }}>Export RPT Assessment Roll</div>
                </button>

                {onToggleTour && (
                  <>
                    <div style={{ height: "1px", backgroundColor: "#e2e8f0", margin: "0.25rem 0" }} />
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsDropdown(false);
                        onToggleTour(!tourEnabled);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        width: "100%",
                        padding: "0.625rem 0.75rem",
                        border: "none",
                        background: "transparent",
                        textAlign: "left",
                        fontSize: "0.875rem",
                        fontWeight: 400,
                        color: "var(--color-text, #1e293b)",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{tourEnabled ? "🟢" : "⚪"}</span>
                      <div style={{ fontWeight: 400 }}>Guide</div>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Toolbar>

      {/* Active Filter Chips Strip */}
      {activeFilterCount > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.45rem 1.15rem",
            backgroundColor: "var(--color-bg-subtle, #f8fafc)",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            fontSize: "0.78rem",
          }}
        >
          <span style={{ fontWeight: 600, color: "#64748b" }}>Active Filters:</span>

          {filters.year !== "all" && (
            <FilterChip
              label={`Tax Year: ${currentYearLabel}`}
              onRemove={() => onFiltersChange({ ...filters, year: "all" })}
            />
          )}

          {(filters.dateFrom || filters.dateTo) && (
            <FilterChip
              label={`Date: ${filters.dateFrom || "Any"} → ${filters.dateTo || "Any"}`}
              onRemove={() => onFiltersChange({ ...filters, dateFrom: "", dateTo: "" })}
            />
          )}

          {filters.propertyType !== "all" && (
            <FilterChip
              label={`Class: ${currentTypeLabel}`}
              onRemove={() => onFiltersChange({ ...filters, propertyType: "all" })}
            />
          )}

          {filters.paymentStatus !== "all" && (
            <FilterChip
              label={`Status: ${currentStatusLabel}`}
              onRemove={() => onFiltersChange({ ...filters, paymentStatus: "all" })}
            />
          )}

          {filters.purok !== "all" && (
            <FilterChip
              label={`Zone: ${filters.purok}`}
              onRemove={() => onFiltersChange({ ...filters, purok: "all" })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        backgroundColor: "#eff6ff",
        border: "1px solid #bfdbfe",
        color: "#1e40af",
        padding: "2px 8px",
        borderRadius: "9999px",
        fontWeight: 500,
      }}
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "#1e40af",
          cursor: "pointer",
          padding: 0,
          fontSize: "0.85rem",
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </span>
  );
}
