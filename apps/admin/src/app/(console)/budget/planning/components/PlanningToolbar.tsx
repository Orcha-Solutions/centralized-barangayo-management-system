"use client";

import * as React from "react";
import { Button, Toolbar } from "@cbms/ui";

export interface PlanningToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  sectorFilter: string;
  onSectorFilterChange: (val: string) => void;
  expenseClassFilter: string;
  onExpenseClassFilterChange: (val: string) => void;
  onOpenAddModal: () => void;
  onExportDocument: () => void;
  onOpenEnactModal: () => void;
  totalPlannedCount: number;
  isEnacted?: boolean;
}

export function PlanningToolbar({
  search,
  onSearchChange,
  sectorFilter,
  onSectorFilterChange,
  expenseClassFilter,
  onExpenseClassFilterChange,
  onOpenAddModal,
  onExportDocument,
  onOpenEnactModal,
  totalPlannedCount,
  isEnacted = false,
}: PlanningToolbarProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
      <Toolbar>
        {/* Left: Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, maxWidth: "340px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <span
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.85rem",
                color: "#64748b",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search planned programs..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="cbms-input"
              style={{ paddingLeft: "32px", width: "100%", height: "36px", fontSize: "0.85rem" }}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <select
            value={sectorFilter}
            onChange={(e) => onSectorFilterChange(e.target.value)}
            className="cbms-select"
            style={{ height: "36px", fontSize: "0.825rem", minWidth: "150px" }}
          >
            <option value="all">All Target Sectors</option>
            <option value="bdf">20% Development (BDF)</option>
            <option value="bdrrmf">5% Disaster (BDRRMF)</option>
            <option value="sk">10% SK Youth Fund</option>
            <option value="gad">5% Gender & Dev (GAD)</option>
            <option value="senior">1% Senior Citizens / PWD</option>
            <option value="general">General Administrative</option>
          </select>

          <select
            value={expenseClassFilter}
            onChange={(e) => onExpenseClassFilterChange(e.target.value)}
            className="cbms-select"
            style={{ height: "36px", fontSize: "0.825rem", minWidth: "130px" }}
          >
            <option value="all">All Classes</option>
            <option value="PS">Personal Services (PS)</option>
            <option value="MOOE">MOOE</option>
            <option value="CO">Capital Outlay (CO)</option>
          </select>
        </div>

        {/* Right Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
          <Button
            variant="default"
            size="sm"
            onClick={onExportDocument}
            title="Export DILG/DBM LBP Forms 1 & 2 Proposal Document"
          >
            📄 Export LBP Document
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenAddModal}
            disabled={isEnacted}
          >
            + Add Planned Item
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenEnactModal}
            disabled={totalPlannedCount === 0 || isEnacted}
            style={{ backgroundColor: isEnacted ? "#16a34a" : "#0284c7" }}
          >
            {isEnacted ? "✓ Enacted" : "🏛️ Enact into Statutory"}
          </Button>
        </div>
      </Toolbar>
    </div>
  );
}
