"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@cbms/ui";
import { CERT_STATUSES } from "../../../../lib/labels";
import type { CertificateType } from "../../../../lib/types";

export interface CertificateToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  typeId: string;
  onTypeIdChange: (typeId: string) => void;
  certificateTypes: CertificateType[];
  totalRecords: number;
  onNewRequest: () => void;
  canCreate: boolean;
}

export function CertificateToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  typeId,
  onTypeIdChange,
  certificateTypes,
  totalRecords,
  onNewRequest,
  canCreate,
}: CertificateToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(search);

  // Sync internal search input if parent changes
  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleInputChange = (val: string) => {
    setSearchInput(val);
    // If empty or >= 3 chars, trigger immediately
    if (val.trim().length === 0 || val.trim().length >= 3) {
      onSearchChange(val.trim());
    }
  };

  const isTypingUnderThreshold = searchInput.trim().length > 0 && searchInput.trim().length < 3;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        padding: "1rem",
        borderBottom: "1px solid var(--color-border, #e2e8f0)",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Search Input with 3-char rule */}
      <div style={{ position: "relative", minWidth: 280, flex: "1 1 280px" }}>
        <input
          type="text"
          className="cbms-input cbms-input--search"
          placeholder="Search reference, purpose or resident (min 3 chars)..."
          value={searchInput}
          onChange={(e) => handleInputChange(e.target.value)}
          style={{ width: "100%", paddingRight: "2rem" }}
        />
        {isTypingUnderThreshold && (
          <span
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.75rem",
              color: "#eab308",
              fontWeight: 600,
            }}
            title="Type at least 3 characters to search server-side"
          >
            {3 - searchInput.trim().length} more
          </span>
        )}
      </div>

      {/* Status Filter */}
      <select
        className="cbms-select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{ minWidth: 150 }}
      >
        <option value="all">All statuses</option>
        {CERT_STATUSES.map((st) => (
          <option key={st} value={st}>
            {st.replace(/_/g, " ").toUpperCase()}
          </option>
        ))}
      </select>

      {/* Certificate Type Filter */}
      <select
        className="cbms-select"
        value={typeId}
        onChange={(e) => onTypeIdChange(e.target.value)}
        style={{ minWidth: 180 }}
      >
        <option value="all">All document types</option>
        {certificateTypes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: "0.85rem", color: "var(--cbms-muted, #64748b)", whiteSpace: "nowrap" }}>
        <strong>{totalRecords}</strong> record{totalRecords === 1 ? "" : "s"}
      </span>

      {/* Actions Dropdown */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="cbms-btn cbms-btn--primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ⚙️ Actions ▾
        </button>

        {dropdownOpen && (
          <>
            <div
              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
              onClick={() => setDropdownOpen(false)}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "115%",
                backgroundColor: "#ffffff",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "0.375rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                zIndex: 50,
                minWidth: "220px",
                display: "flex",
                flexDirection: "column",
                padding: "0.35rem 0",
              }}
            >
              {canCreate && (
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onNewRequest();
                  }}
                  style={{
                    padding: "0.65rem 1rem",
                    textAlign: "left",
                    border: "none",
                    background: "none",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--color-text, #1b2430)",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  📄 New Clearance Request
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  window.print();
                }}
                style={{
                  padding: "0.65rem 1rem",
                  textAlign: "left",
                  border: "none",
                  background: "none",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--color-text, #1b2430)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                🖨️ Print Roster / Summary
              </button>

              <Link
                href="/certificates/stats"
                style={{
                  padding: "0.65rem 1rem",
                  textAlign: "left",
                  border: "none",
                  background: "none",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "var(--color-text, #1b2430)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                📊 Analytics & SLA Scorecard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
