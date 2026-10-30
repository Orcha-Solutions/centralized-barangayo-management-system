"use client";

import * as React from "react";
import { Button, Toolbar, num } from "@cbms/ui";
import { FinanceFilterPopover, FilterValues, FUNDS, FISCAL_YEARS } from "./FinanceFilterPopover";

export interface FinanceToolbarProps {
  activeTab: "ledger" | "receipts";
  searchQuery: string;
  onSearchChange: (query: string) => void;
  year: string;
  onYearChange: (year: string) => void;
  dateFrom: string;
  onDateFromChange: (dateFrom: string) => void;
  dateTo: string;
  onDateToChange: (dateTo: string) => void;
  fund: string;
  onFundChange: (fund: string) => void;
  direction: string;
  onDirectionChange: (direction: string) => void;
  onResetFilters: () => void;
  totalCount: number;
  mayCollect: boolean;
  mayDisburse: boolean;
  onOpenCreateLedger: () => void;
  onOpenCreateReceipt: () => void;
  tourEnabled?: boolean;
  onToggleTour?: (enabled: boolean) => void;
}

export function FinanceToolbar({
  activeTab,
  searchQuery,
  onSearchChange,
  year,
  onYearChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  fund,
  onFundChange,
  direction,
  onDirectionChange,
  onResetFilters,
  totalCount,
  mayCollect,
  mayDisburse,
  onOpenCreateLedger,
  onOpenCreateReceipt,
  tourEnabled,
  onToggleTour,
}: FinanceToolbarProps) {
  const [inputValue, setInputValue] = React.useState(searchQuery);
  const [showFilterPopover, setShowFilterPopover] = React.useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);

  // Sync internal input when external searchQuery changes (e.g. cleared)
  React.useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Debounced trigger: requires at least 3 characters or empty string to reset
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

  // Calculate active filter count
  const activeFilterCount = [
    year !== "all",
    Boolean(dateFrom),
    Boolean(dateTo),
    activeTab === "ledger" && fund !== "all",
    activeTab === "ledger" && direction !== "all",
  ].filter(Boolean).length;

  const handleApplyFilters = (next: FilterValues) => {
    onYearChange(next.year);
    onDateFromChange(next.dateFrom);
    onDateToChange(next.dateTo);
    onFundChange(next.fund);
    onDirectionChange(next.direction);
  };

  const currentYearLabel = FISCAL_YEARS.find((y) => y.value === year)?.label || `FY ${year}`;
  const currentFundLabel = FUNDS.find((f) => f.value === fund)?.label || fund;

  return (
    <div id="tour-finance-toolbar" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Toolbar>
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <input
              className="cbms-input cbms-input--search"
              placeholder={
                activeTab === "ledger"
                  ? "Search particulars, OR#, DV#, payee…"
                  : "Search OR#, payor, particulars…"
              }
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
            id="finance-filter-btn"
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

          {/* Filter Popover */}
          <FinanceFilterPopover
            isOpen={showFilterPopover}
            onClose={() => setShowFilterPopover(false)}
            activeTab={activeTab}
            values={{ year, dateFrom, dateTo, fund, direction }}
            onApply={handleApplyFilters}
            onReset={onResetFilters}
          />
        </div>

        {/* Clear Filters Quick Link if any active */}
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
          {num(totalCount)} {activeTab === "ledger" ? "transaction(s)" : "receipt(s)"}
        </span>

        {/* Primary Actions ▾ Menu */}
        <div style={{ position: "relative" }}>
          <Button
            id="finance-actions-btn"
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
                {activeTab === "ledger" && (mayCollect || mayDisburse) && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCreateLedger();
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
                    📝 Record Journal Entry
                  </button>
                )}

                {activeTab === "receipts" && mayCollect && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenCreateReceipt();
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
                    🧾 Issue Official Receipt
                  </button>
                )}

                {onToggleTour && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleTour(!tourEnabled);
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
                      borderTop: "1px solid var(--color-border, #f1f5f9)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--color-bg-hover, #f8fafc)")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    🗺️ {tourEnabled ? "Hide Tour Guide" : "Start Tour Guide"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </Toolbar>

      {/* Active Filter Pills Bar */}
      {activeFilterCount > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", alignItems: "center", paddingLeft: "0.25rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Active filters:</span>
          {year !== "all" && (
            <span style={pillStyle("#eff6ff", "#1d4ed8", "#bfdbfe")}>
              Year: {currentYearLabel}
              <button type="button" onClick={() => onYearChange("all")} style={pillCloseBtn("#1d4ed8")}>✕</button>
            </span>
          )}
          {dateFrom && (
            <span style={pillStyle("#f0fdf4", "#15803d", "#bbf7d0")}>
              From: {dateFrom}
              <button type="button" onClick={() => onDateFromChange("")} style={pillCloseBtn("#15803d")}>✕</button>
            </span>
          )}
          {dateTo && (
            <span style={pillStyle("#f0fdf4", "#15803d", "#bbf7d0")}>
              To: {dateTo}
              <button type="button" onClick={() => onDateToChange("")} style={pillCloseBtn("#15803d")}>✕</button>
            </span>
          )}
          {fund !== "all" && (
            <span style={pillStyle("#fdf4ff", "#86198f", "#f5d0fe")}>
              Fund: {currentFundLabel}
              <button type="button" onClick={() => onFundChange("all")} style={pillCloseBtn("#86198f")}>✕</button>
            </span>
          )}
          {activeTab === "ledger" && direction !== "all" && (
            <span style={pillStyle("#fffbeb", "#b45309", "#fde68a")}>
              Flow: {direction === "credit" ? "Collections (Credit)" : "Disbursements (Debit)"}
              <button type="button" onClick={() => onDirectionChange("all")} style={pillCloseBtn("#b45309")}>✕</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

const pillStyle = (bg: string, color: string, border: string): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  backgroundColor: bg,
  color,
  border: `1px solid ${border}`,
  borderRadius: "14px",
  padding: "2px 8px",
  fontSize: "0.75rem",
  fontWeight: 500,
});

const pillCloseBtn = (color: string): React.CSSProperties => ({
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  color,
  fontWeight: 700,
});
