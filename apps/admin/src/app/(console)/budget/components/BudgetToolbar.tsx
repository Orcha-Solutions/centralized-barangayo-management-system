"use client";

import * as React from "react";
import { Button } from "@cbms/ui";

export interface BudgetFilterValues {
  year: string;
  fund: string;
  status: string;
}

export interface BudgetToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filters: BudgetFilterValues;
  onFiltersChange: (next: BudgetFilterValues) => void;
  onResetFilters: () => void;
  totalCount: number;
  mayObligate?: boolean;
  onOpenCreate: () => void;
  onOpenAddSector?: () => void;
  onExportCsv: () => void;
}

export function BudgetToolbar({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  onResetFilters,
  totalCount,
  mayObligate = true,
  onOpenCreate,
  onOpenAddSector,
  onExportCsv,
}: BudgetToolbarProps) {
  const [localSearch, setLocalSearch] = React.useState(searchQuery);
  const [showFilterPopover, setShowFilterPopover] = React.useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = React.useState(false);

  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch.trim());
  };

  const isShortInput = localSearch.trim().length > 0 && localSearch.trim().length < 3;
  const activeFilterCount =
    (filters.year !== "all" ? 1 : 0) +
    (filters.fund !== "all" ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0);

  return (
    <>
      <div className="cbms-toolbar" style={{ position: "relative", zIndex: 30 }}>
        {/* Search Input (3-char standard rule) */}
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="cbms-input cbms-input--search"
              placeholder="Search PPA code, title, or payee (min 3 chars)..."
              value={localSearch}
              onChange={(e) => {
                const val = e.target.value;
                setLocalSearch(val);
                if (val.trim().length >= 3 || val.trim().length === 0) {
                  onSearchChange(val.trim());
                }
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

        {/* Filter Pop-up Trigger */}
        <div style={{ position: "relative" }}>
          <Button
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

          {/* Centered Filter Popover */}
          {showFilterPopover && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 100 }}
                onClick={() => setShowFilterPopover(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  zIndex: 101,
                  width: "320px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.5rem",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>Filter RAAO Obligations</strong>
                  <button
                    type="button"
                    onClick={onResetFilters}
                    style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                  >
                    Reset
                  </button>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Fiscal Year
                  </label>
                  <select
                    className="cbms-select"
                    value={filters.year}
                    onChange={(e) => onFiltersChange({ ...filters, year: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="all">All Fiscal Years</option>
                    <option value="2026">FY 2026</option>
                    <option value="2025">FY 2025</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Statutory Fund Classification
                  </label>
                  <select
                    className="cbms-select"
                    value={filters.fund}
                    onChange={(e) => onFiltersChange({ ...filters, fund: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="all">All Funds</option>
                    <option value="bdf">20% Development Fund (BDF)</option>
                    <option value="bdrrmf">5% Disaster Management (BDRRMF)</option>
                    <option value="sk">10% Sangguniang Kabataan (SK)</option>
                    <option value="gad">5% Gender & Development (GAD)</option>
                    <option value="general">General Fund (PS / MOOE)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                    Execution Status
                  </label>
                  <select
                    className="cbms-select"
                    value={filters.status}
                    onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                    style={{ width: "100%" }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="obligated">Obligated</option>
                    <option value="disbursed">Disbursed (Settled)</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>

                <Button
                  variant="primary"
                  type="button"
                  onClick={() => setShowFilterPopover(false)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Apply Filters
                </Button>
              </div>
            </>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: "0.8rem",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Clear filters
          </button>
        )}

        <div className="cbms-toolbar__spacer" />

        <span className="adm-muted" style={{ marginRight: "1rem", fontSize: "0.85rem" }}>
          {totalCount.toLocaleString()} statutory obligation(s)
        </span>

        {/* Primary Blue Actions ▾ Dropdown */}
        <div style={{ position: "relative" }}>
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
                style={{ position: "fixed", inset: 0, zIndex: 99 }}
                onClick={() => setShowActionsDropdown(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  right: 0,
                  zIndex: 100,
                  width: "250px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "0.5rem",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  padding: "0.4rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                {mayObligate && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionsDropdown(false);
                      onOpenCreate();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.6rem 0.75rem",
                      border: "none",
                      background: "transparent",
                      fontSize: "0.85rem",
                      color: "#1e293b",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>📝</span>
                    <span>Record Statutory Obligation</span>
                  </button>
                )}
                {onOpenAddSector && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowActionsDropdown(false);
                      onOpenAddSector();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.6rem 0.75rem",
                      border: "none",
                      background: "transparent",
                      fontSize: "0.85rem",
                      color: "#1e293b",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>🏛️</span>
                    <span>Add Sector / Local Program</span>
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
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    border: "none",
                    background: "transparent",
                    fontSize: "0.85rem",
                    color: "#1e293b",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span>📥</span>
                  <span>Export RAAO Form (CSV)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
