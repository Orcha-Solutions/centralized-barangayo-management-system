"use client";

import * as React from "react";
import { Chip, dateTime, pesoAmount } from "@cbms/ui";
import { getAccountTitle } from "../../../../lib/chart-of-accounts";
import type { LedgerEntry } from "../../../../lib/types";

export interface LedgerDetailDrawerProps {
  open: boolean;
  entry: LedgerEntry | null;
  onClose: () => void;
  onDeleteClick?: (entry: LedgerEntry) => void;
  mayDelete?: boolean;
}

export function LedgerDetailDrawer({
  open,
  entry,
  onClose,
  onDeleteClick,
  mayDelete,
}: LedgerDetailDrawerProps) {
  if (!open || !entry) return null;

  const isCredit = entry.direction === "credit";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(2px)",
        zIndex: 2200,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ledger Entry Details"
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          backgroundColor: "#ffffff",
          boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          animation: "slideInRight 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0a2463" }}>
              Transaction Dossier
            </h3>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>ID: {entry.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Amount Hero Banner */}
          <div
            style={{
              backgroundColor: isCredit ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${isCredit ? "#bbf7d0" : "#fecaca"}`,
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: isCredit ? "#166534" : "#991b1b",
              }}
            >
              {isCredit ? "🟢 Revenue Collection (Credit)" : "🔴 Spending / Disbursement (Debit)"}
            </span>
            <div
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                fontFamily: "monospace",
                color: isCredit ? "#15803d" : "#b91c1c",
                marginTop: "4px",
              }}
            >
              {isCredit ? "+" : "-"}
              {pesoAmount(entry.amount)}
            </div>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              Posted on: {entry.postedAt ? dateTime(entry.postedAt) : "—"}
            </span>
          </div>

          {/* Details Table */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              backgroundColor: "#f8fafc",
              padding: "14px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Fund Account:</span>
              <strong style={{ color: "#0f172a" }}>{entry.fund.toUpperCase()} FUND</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ color: "#64748b" }}>Accounting Title:</span>
              <strong style={{ color: "#0a2463", textAlign: "right" }}>
                {getAccountTitle(entry.accountCode, entry.description)}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>COA Code:</span>
              <code style={{ fontWeight: 700, color: "#0a2463" }}>{entry.accountCode}</code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Transaction Flow:</span>
              <strong>{isCredit ? "Collection" : "Disbursement"}</strong>
            </div>
            {entry.orNumber && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Official Receipt:</span>
                <strong style={{ color: "#0a2463" }}>🧾 {entry.orNumber}</strong>
              </div>
            )}
            {entry.dvNumber && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Disbursement Voucher:</span>
                <strong style={{ color: "#7c2d12" }}>📋 {entry.dvNumber}</strong>
              </div>
            )}
            {entry.checkNumber && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Check Number:</span>
                <strong>{entry.checkNumber}</strong>
              </div>
            )}
            {entry.payorPayee && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Party:</span>
                <strong style={{ color: "#0f172a" }}>{entry.payorPayee}</strong>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Status:</span>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  backgroundColor: entry.status === "posted" ? "#dcfce7" : "#fee2e2",
                  color: entry.status === "posted" ? "#15803d" : "#b91c1c",
                }}
              >
                {(entry.status ?? "posted").toUpperCase()}
              </span>
            </div>
          </div>

          {/* Description Block */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155" }}>
              Particulars & Description
            </span>
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "12px",
                fontSize: "0.875rem",
                color: "#1e293b",
                lineHeight: 1.5,
              }}
            >
              {entry.description}
            </div>
          </div>

          {/* Actions at bottom */}
          {mayDelete && (
            <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDeleteClick?.(entry);
                }}
                className="cbms-btn cbms-btn--danger"
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  borderRadius: "6px",
                }}
              >
                🗑️ Delete Record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
