"use client";

import * as React from "react";
import { Button, Field } from "@cbms/ui";
import type { BlotterEntry } from "../../../../lib/types";

export interface BulkAddBlotterDrawerProps {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (entries: Partial<BlotterEntry>[]) => Promise<void>;
}

export function BulkAddBlotterDrawer({
  open,
  busy,
  onClose,
  onSubmit,
}: BulkAddBlotterDrawerProps) {
  const [csvText, setCsvText] = React.useState("");
  const [parseError, setParseError] = React.useState<string | null>(null);

  const sampleCsv = `Category,IncidentAt,Location,ReportedBy,RespondentName,Narrative,IsConfidential
dispute,2026-10-26T14:30,Purok 1 Covered Court,Juan Dela Cruz,Pedro Santos,Property fence encroachment dispute,false
theft,2026-10-25T21:00,Katipunan St.,Maria Clara,Unknown,Unattended motorcycle helmet taken,false
noise,2026-10-25T23:15,Purok 2 Alley,Ricardo Dalisay,Neighbor,Loud stereo past barangay curfew,false`;

  if (!open) return null;

  const handleParseAndSubmit = async () => {
    setParseError(null);
    const lines = csvText.trim().split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      setParseError("Please provide header and at least one data row.");
      return;
    }

    const rows: Partial<BlotterEntry>[] = [];
    const dataLines = lines.slice(1);

    for (let i = 0; i < dataLines.length; i++) {
      const parts = dataLines[i].split(",").map((p) => p.trim());
      if (parts.length < 6) {
        setParseError(`Row ${i + 1} has insufficient columns (expected at least 6).`);
        return;
      }

      const [category, incidentAt, location, reportedBy, respondentName, narrative, isConfidential] = parts;

      if (!location || !reportedBy || !narrative) {
        setParseError(`Row ${i + 1} is missing required fields (Location, ReportedBy, or Narrative).`);
        return;
      }

      rows.push({
        category: category || "other",
        incidentAt: incidentAt ? new Date(incidentAt).toISOString() : new Date().toISOString(),
        location,
        reportedBy,
        respondentName: respondentName || "",
        narrative,
        isConfidential: isConfidential?.toLowerCase() === "true",
        status: "active",
      });
    }

    try {
      await onSubmit(rows);
    } catch (err: any) {
      setParseError(err?.message || "Failed to submit bulk blotters.");
    }
  };

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
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-blotter-title"
        style={{
          width: "100%",
          maxWidth: "720px",
          height: "100%",
          backgroundColor: "var(--color-bg-card, #ffffff)",
          borderLeft: "1px solid var(--color-border, #e2e8f0)",
          boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--color-border, #e2e8f0)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--color-bg-hover, #f8fafc)",
          }}
        >
          <div>
            <h2
              id="bulk-blotter-title"
              style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "var(--color-text, #1b2430)" }}
            >
              📦 Bulk Ingest Blotter Incidents
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--cbms-muted, #64748b)" }}>
              Paste CSV records to create multiple incident logs transactionally.
            </p>
          </div>
          <button
            type="button"
            className="cbms-btn"
            disabled={busy}
            onClick={onClose}
            style={{ padding: "0.25rem 0.6rem", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {parseError && (
            <div
              style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                color: "#b91c1c",
                fontSize: "12.5px",
                fontWeight: 500,
              }}
            >
              ⚠️ {parseError}
            </div>
          )}

          <div
            style={{
              padding: "10px 14px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#1e40af",
            }}
          >
            <strong>CSV Column Order:</strong>
            <br />
            <code>Category, IncidentAt, Location, ReportedBy, RespondentName, Narrative, IsConfidential</code>
          </div>

          <Field label="CSV Data" hint="Paste CSV rows including the header row">
            <textarea
              className="cbms-input"
              rows={12}
              placeholder={sampleCsv}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              disabled={busy}
              style={{ fontFamily: "monospace", fontSize: "12px", resize: "vertical" }}
            />
          </Field>

          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => setCsvText(sampleCsv)}
            style={{ alignSelf: "flex-start", fontSize: "11.5px" }}
          >
            📋 Load Sample Data Template
          </Button>

          <div
            style={{
              marginTop: "auto",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--color-border, #e2e8f0)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
            }}
          >
            <Button variant="secondary" type="button" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <button
              type="button"
              className="cbms-btn cbms-btn--primary"
              disabled={busy || !csvText.trim()}
              onClick={handleParseAndSubmit}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "0.5rem 1.25rem",
                fontWeight: 600,
              }}
            >
              {busy ? (
                <>
                  <span className="cbms-spinner" style={{ width: 14, height: 14 }} />
                  <span>Ingesting Batch…</span>
                </>
              ) : (
                <span>Ingest Batch</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
