"use client";

import * as React from "react";
import { Alert } from "@cbms/ui";
import { useBulkCreateHouseholdsMutation } from "../../../../lib/households-queries";
import type { Household } from "../../../../lib/types";

export interface BulkAddHouseholdsDrawerProps {
  open: boolean;
  onClose: () => void;
  puroksList: string[];
  onSuccess: (count: number) => void;
}

interface DraftHousehold {
  householdNo: string;
  householdName: string;
  purok: string;
  street: string;
  householdType: string;
  tenureStatus: string;
  housingUnit: string;
  monthlyIncome: string;
}

export function BulkAddHouseholdsDrawer({
  open,
  onClose,
  puroksList,
  onSuccess,
}: BulkAddHouseholdsDrawerProps) {
  const defaultPurok = puroksList[0] || "Purok 1";

  const createInitialRows = (): DraftHousehold[] => [
    { householdNo: "", householdName: "", purok: defaultPurok, street: "", householdType: "nuclear", tenureStatus: "owner", housingUnit: "single_house", monthlyIncome: "" },
    { householdNo: "", householdName: "", purok: defaultPurok, street: "", householdType: "nuclear", tenureStatus: "owner", housingUnit: "single_house", monthlyIncome: "" },
    { householdNo: "", householdName: "", purok: defaultPurok, street: "", householdType: "nuclear", tenureStatus: "owner", housingUnit: "single_house", monthlyIncome: "" },
  ];

  const [rows, setRows] = React.useState<DraftHousehold[]>(createInitialRows);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const bulkMutation = useBulkCreateHouseholdsMutation();
  const busy = bulkMutation.isPending;

  React.useEffect(() => {
    if (open) {
      setErrorMsg(null);
      setRows(createInitialRows());
    }
  }, [open, defaultPurok]);

  if (!open) return null;

  const handleRowChange = (index: number, field: keyof DraftHousehold, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { householdNo: "", householdName: "", purok: defaultPurok, street: "", householdType: "nuclear", tenureStatus: "owner", housingUnit: "single_house", monthlyIncome: "" },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Filter filled rows
    const validRows = rows.filter((r) => r.householdNo.trim().length > 0);
    if (validRows.length === 0) {
      setErrorMsg("Please provide at least one household number.");
      return;
    }

    // Check in-form duplicates
    const seenNos = new Set<string>();
    for (const r of validRows) {
      const trimmed = r.householdNo.trim();
      if (seenNos.has(trimmed.toLowerCase())) {
        setErrorMsg(`Duplicate household number '${trimmed}' detected in the batch.`);
        return;
      }
      seenNos.add(trimmed.toLowerCase());
    }

    const payload: Partial<Household>[] = validRows.map((r) => ({
      householdNo: r.householdNo.trim(),
      householdName: r.householdName.trim() || undefined,
      purok: r.purok,
      street: r.street.trim() || undefined,
      householdType: r.householdType,
      tenureStatus: r.tenureStatus,
      housingUnit: r.housingUnit,
      monthlyIncome: r.monthlyIncome ? parseFloat(r.monthlyIncome) : 0,
      addressLine: `${r.street.trim() ? r.street.trim() + ", " : ""}${r.purok}`,
    }));

    try {
      const res = await bulkMutation.mutateAsync(payload);
      onSuccess(res.count || validRows.length);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to execute bulk household registration.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        zIndex: 2000,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: "860px",
          height: "100%",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          boxShadow: "-8px 0 25px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--cbms-navy, #0a2463)" }}>
              👥 Bulk Add Households
            </h2>
            <p style={{ margin: "3px 0 0 0", fontSize: "0.82rem", color: "var(--cbms-muted, #64748b)" }}>
              Batch atomic registration (DILG BIMS Form A1)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              lineHeight: 1,
              cursor: busy ? "not-allowed" : "pointer",
              color: "#94a3b8",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
            {errorMsg && <Alert tone="danger">{errorMsg}</Alert>}

            <div style={{ overflowX: "auto" }}>
              <table className="cbms-table" style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                    <th style={{ padding: "8px 6px", width: "18%" }}>Household No.*</th>
                    <th style={{ padding: "8px 6px", width: "18%" }}>Family / Head Name</th>
                    <th style={{ padding: "8px 6px", width: "16%" }}>Purok</th>
                    <th style={{ padding: "8px 6px", width: "18%" }}>Street / Address</th>
                    <th style={{ padding: "8px 6px", width: "14%" }}>Type</th>
                    <th style={{ padding: "8px 6px", width: "12%" }}>Monthly Inc.</th>
                    <th style={{ padding: "8px 6px", width: "4%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "6px" }}>
                        <input
                          className="cbms-input"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          placeholder="e.g. HH-01"
                          value={row.householdNo}
                          disabled={busy}
                          onChange={(e) => handleRowChange(idx, "householdNo", e.target.value)}
                        />
                      </td>
                      <td style={{ padding: "6px" }}>
                        <input
                          className="cbms-input"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          placeholder="Family name"
                          value={row.householdName}
                          disabled={busy}
                          onChange={(e) => handleRowChange(idx, "householdName", e.target.value)}
                        />
                      </td>
                      <td style={{ padding: "6px" }}>
                        <select
                          className="cbms-select"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          value={row.purok}
                          disabled={busy}
                          onChange={(e) => handleRowChange(idx, "purok", e.target.value)}
                        >
                          {puroksList.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "6px" }}>
                        <input
                          className="cbms-input"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          placeholder="Street"
                          value={row.street}
                          disabled={busy}
                          onChange={(e) => handleRowChange(idx, "street", e.target.value)}
                        />
                      </td>
                      <td style={{ padding: "6px" }}>
                        <select
                          className="cbms-select"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          value={row.householdType}
                          disabled={busy}
                          onChange={(e) => handleRowChange(idx, "householdType", e.target.value)}
                        >
                          <option value="nuclear">Nuclear</option>
                          <option value="extended">Extended</option>
                          <option value="single">Single</option>
                          <option value="composite">Composite</option>
                        </select>
                      </td>
                      <td style={{ padding: "6px" }}>
                        <input
                          type="number"
                          className="cbms-input"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          placeholder="₱"
                          value={row.monthlyIncome}
                          disabled={busy}
                          onChange={(e) => handleRowChange(idx, "monthlyIncome", e.target.value)}
                        />
                      </td>
                      <td style={{ padding: "6px", textAlign: "center" }}>
                        <button
                          type="button"
                          disabled={busy || rows.length <= 1}
                          onClick={() => handleRemoveRow(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: rows.length <= 1 ? "not-allowed" : "pointer",
                            fontSize: "14px",
                          }}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <button
                type="button"
                onClick={handleAddRow}
                disabled={busy}
                className="cbms-btn"
                style={{ fontSize: "12px", padding: "4px 12px" }}
              >
                + Add Another Row
              </button>
            </div>
          </div>

          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="cbms-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="cbms-btn cbms-btn--primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                opacity: busy ? 0.75 : 1,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {busy ? (
                <>
                  <svg
                    style={{
                      width: 14,
                      height: 14,
                      animation: "cbms-spin 0.75s linear infinite",
                      flexShrink: 0,
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeOpacity="0.3"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving Bulk Records…</span>
                </>
              ) : (
                <span>Save All Households</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
