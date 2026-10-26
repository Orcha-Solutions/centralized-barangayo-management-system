"use client";

import * as React from "react";
import { Alert, DataTable, Panel, date, fullName } from "@cbms/ui";
import type { DuplicateCandidate } from "../types";

interface DuplicateWarningPanelProps {
  dupMessage: string;
  candidates: DuplicateCandidate[];
  busy: boolean;
  onSaveAnyway: () => void;
  onDismiss: () => void;
}

export function DuplicateWarningPanel({
  dupMessage,
  candidates,
  busy,
  onSaveAnyway,
  onDismiss,
}: DuplicateWarningPanelProps) {
  return (
    <Panel title="Possible duplicate detected">
      <Alert tone="warn">{dupMessage}</Alert>
      <DataTable
        columns={[
          {
            key: "name",
            header: "Existing record",
            render: (c: DuplicateCandidate) => fullName(c),
          },
          {
            key: "birthDate",
            header: "Birth date",
            render: (c: DuplicateCandidate) => date(c.birthDate),
          },
          {
            key: "open",
            header: "",
            align: "right",
            render: (c: DuplicateCandidate) => (
              <a className="cbms-btn cbms-btn--sm" href={`/inhabitants/${c.id}`}>
                Open record
              </a>
            ),
          },
        ]}
        rows={candidates}
        empty="No candidates returned."
      />
      <div className="adm-row" style={{ marginTop: 14 }}>
        <button
          type="button"
          onClick={onSaveAnyway}
          disabled={busy}
          className="cbms-btn cbms-btn--gold"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.85 : 1,
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
              <span>Saving duplicate…</span>
            </>
          ) : (
            <span>Save anyway — this is a different person</span>
          )}
        </button>
        <button
          type="button"
          className="cbms-btn"
          disabled={busy}
          onClick={onDismiss}
        >
          Cancel and Review
        </button>
      </div>
    </Panel>
  );
}
