"use client";

import * as React from "react";
import { Alert, Field } from "@cbms/ui";
import { useBulkCreateInhabitantsMutation } from "../../../../lib/inhabitants-queries";
import { BulkAddPreviewTable, type ParsedInhabitantRow } from "./BulkAddPreviewTable";

interface BulkAddInhabitantsDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkAddInhabitantsDrawer({
  open,
  onClose,
  onSuccess,
}: BulkAddInhabitantsDrawerProps) {
  const [csvText, setCsvText] = React.useState("");
  const [parsedRows, setParsedRows] = React.useState<ParsedInhabitantRow[]>([]);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [progress, setProgress] = React.useState({ current: 0, total: 0 });

  const bulkCreateMutation = useBulkCreateInhabitantsMutation();

  React.useEffect(() => {
    if (open) {
      setCsvText("");
      setParsedRows([]);
      setParseError(null);
      setIsImporting(false);
      setProgress({ current: 0, total: 0 });
    }
  }, [open]);

  if (!open) return null;

  function cleanCsvValue(val?: string): string {
    if (!val) return "";
    let s = val.trim();
    while (
      (s.startsWith('"') && s.endsWith('"')) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      s = s.slice(1, -1).trim();
    }
    const lower = s.toLowerCase();
    if (!s || lower === "n/a" || s === "-" || lower === "none" || s === '""') {
      return "";
    }
    return s;
  }

  function parseCsvData(raw: string) {
    setParseError(null);
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      setParsedRows([]);
      return;
    }

    const rows: ParsedInhabitantRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      const firstName = cleanCsvValue(parts[0]);
      const lastName = cleanCsvValue(parts[2]);

      if (parts.length >= 3 && firstName && lastName) {
        const middleName = cleanCsvValue(parts[1]);
        const suffix = cleanCsvValue(parts[3]);
        const rawSex = cleanCsvValue(parts[4] || "male").toLowerCase();
        const sex = rawSex.startsWith("f") ? "female" : "male";
        const birthDate = cleanCsvValue(parts[5]) || "2000-01-01";
        const civilStatus = cleanCsvValue(parts[6]) || "single";
        const philsysNo = cleanCsvValue(parts[7]);
        const purok = cleanCsvValue(parts[8]);

        rows.push({
          firstName,
          middleName,
          lastName,
          suffix,
          sex,
          birthDate,
          civilStatus,
          philsysNo,
          purok,
        });
      }
    }

    if (rows.length === 0) {
      setParseError("Could not find any valid inhabitant rows. Please verify CSV columns.");
    }
    setParsedRows(rows);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || "";
      setCsvText(text);
      parseCsvData(text);
    };
    reader.readAsText(file);
  }

  function downloadSampleCsv() {
    const sample =
      "FirstName,MiddleName,LastName,Suffix,Sex,BirthDate,CivilStatus,PhilSysNo,Purok\n" +
      "Juan,Santos,Dela Cruz,Jr.,male,1990-05-15,married,1234-5678-9012,Purok 1\n" +
      "Maria,Reyes,Santos,,female,1992-08-20,married,9876-5432-1098,Purok 2\n" +
      "Carlos,Luna,Aquino,,male,2005-11-03,single,,Purok 3";

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "inhabitants_bulk_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleImport() {
    if (parsedRows.length === 0 || isImporting) return;
    setIsImporting(true);
    setParseError(null);
    setProgress({ current: 0, total: parsedRows.length });

    try {
      const payload = parsedRows.map((row) => ({
        firstName: cleanCsvValue(row.firstName),
        middleName: cleanCsvValue(row.middleName) || undefined,
        lastName: cleanCsvValue(row.lastName),
        suffix: cleanCsvValue(row.suffix) || undefined,
        sex: row.sex,
        birthDate: row.birthDate,
        civilStatus: row.civilStatus,
        philsysNo: cleanCsvValue(row.philsysNo) || undefined,
      }));

      await bulkCreateMutation.mutateAsync(payload);
      setProgress({ current: parsedRows.length, total: parsedRows.length });

      onSuccess();
      onClose();
    } catch (err: any) {
      setParseError(err?.message || "Error occurred during batch import.");
    } finally {
      setIsImporting(false);
    }
  }

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
        zIndex: 1500,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={() => {
        if (!isImporting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bulk Add Inhabitants"
        style={{
          width: "100%",
          maxWidth: "560px",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          height: "100%",
          boxShadow: "-6px 0 24px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--cbms-surface-subtle, #f8fafc)",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.15rem",
                fontWeight: "bold",
                color: "var(--color-text, #1b2430)",
              }}
            >
              👥 Bulk Add Inhabitants
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--cbms-muted, #64748b)" }}>
              Batch Import via CSV Upload or Direct Text
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              lineHeight: 1,
              cursor: isImporting ? "not-allowed" : "pointer",
              color: "var(--cbms-muted, #64748b)",
              padding: "4px 8px",
            }}
            aria-label="Close bulk entry drawer"
          >
            ×
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {parseError && (
            <div style={{ marginBottom: "1rem" }}>
              <Alert tone="danger">{parseError}</Alert>
            </div>
          )}

          {/* Sample CSV Download banner */}
          <div
            style={{
              padding: "12px 14px",
              background: "#f1f5f9",
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.25rem",
              gap: 12,
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "#334155" }}>
              <strong>Need the CSV template?</strong>
              <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                FirstName, MiddleName, LastName, Suffix, Sex, BirthDate, CivilStatus...
              </div>
            </div>
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="cbms-btn cbms-btn--sm"
              style={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
            >
              📥 Sample CSV
            </button>
          </div>

          {/* File Upload Input */}
          <Field label="Upload CSV File">
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={isImporting}
              onChange={handleFileSelect}
              className="cbms-input"
              style={{ padding: "8px", width: "100%" }}
            />
          </Field>

          {/* Direct Paste Area */}
          <div style={{ marginTop: "1rem" }}>
            <Field label="Or Paste CSV Data Directly">
              <textarea
                rows={5}
                className="cbms-input"
                disabled={isImporting}
                placeholder={
                  "FirstName,MiddleName,LastName,Suffix,Sex,BirthDate,CivilStatus,PhilSysNo,Purok\n" +
                  "Juan,Santos,Dela Cruz,,male,1990-01-01,single,,Purok 1"
                }
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  parseCsvData(e.target.value);
                }}
                style={{ fontFamily: "monospace", fontSize: "0.8rem", width: "100%" }}
              />
            </Field>
          </div>

          {/* Parsed Rows Preview Table */}
          <BulkAddPreviewTable parsedRows={parsedRows} />

          {/* Importing Progress Bar */}
          {isImporting && (
            <div style={{ marginTop: "1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  marginBottom: 6,
                  fontWeight: 600,
                  color: "#0f172a",
                }}
              >
                <span>Importing records…</span>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: 8,
                  backgroundColor: "#e2e8f0",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(progress.current / (progress.total || 1)) * 100}%`,
                    backgroundColor: "#0284c7",
                    transition: "width 0.2s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            background: "var(--cbms-surface-subtle, #f8fafc)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="cbms-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isImporting}
            onClick={handleImport}
            className="cbms-btn cbms-btn--primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              cursor: parsedRows.length === 0 || isImporting ? "not-allowed" : "pointer",
              opacity: parsedRows.length === 0 || isImporting ? 0.75 : 1,
              minWidth: 170,
              justifyContent: "center",
            }}
          >
            {isImporting ? (
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
                <span>Importing ({progress.current}/{progress.total})…</span>
              </>
            ) : (
              <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Inhabitants` : "Inhabitants"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Keep export alias for backwards-compatibility
export const BulkAddInhabitantsModal = BulkAddInhabitantsDrawer;
