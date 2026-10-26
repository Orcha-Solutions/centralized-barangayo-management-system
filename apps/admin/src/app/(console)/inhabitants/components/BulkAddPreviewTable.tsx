"use client";

import * as React from "react";

export interface ParsedInhabitantRow {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  sex: "male" | "female";
  birthDate: string;
  civilStatus: string;
  purok?: string;
  philsysNo?: string;
}

interface BulkAddPreviewTableProps {
  parsedRows: ParsedInhabitantRow[];
}

export function BulkAddPreviewTable({ parsedRows }: BulkAddPreviewTableProps) {
  if (parsedRows.length === 0) return null;

  return (
    <div style={{ marginTop: "1.25rem" }}>
      <div
        style={{
          padding: "10px 14px",
          borderRadius: 6,
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          fontSize: "0.82rem",
          color: "#166534",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>✓ Ready to import {parsedRows.length} inhabitant record(s)</span>
        <span style={{ fontSize: "0.75rem", color: "#15803d" }}>
          Previewing first {Math.min(parsedRows.length, 5)}
        </span>
      </div>

      <div
        style={{
          marginTop: "0.75rem",
          border: "1px solid #e2e8f0",
          borderRadius: 6,
          overflow: "hidden",
          fontSize: "0.75rem",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "6px 10px" }}>Name</th>
              <th style={{ padding: "6px 8px" }}>Sex</th>
              <th style={{ padding: "6px 8px" }}>Birth Date</th>
              <th style={{ padding: "6px 8px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {parsedRows.slice(0, 5).map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: idx < 4 ? "1px solid #f1f5f9" : "none",
                  background: idx % 2 === 1 ? "#fafafa" : "#ffffff",
                }}
              >
                <td style={{ padding: "6px 10px", fontWeight: 600 }}>
                  {row.lastName}, {row.firstName} {row.middleName || ""}
                </td>
                <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{row.sex}</td>
                <td style={{ padding: "6px 8px" }}>{row.birthDate}</td>
                <td style={{ padding: "6px 8px", textTransform: "capitalize" }}>{row.civilStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
