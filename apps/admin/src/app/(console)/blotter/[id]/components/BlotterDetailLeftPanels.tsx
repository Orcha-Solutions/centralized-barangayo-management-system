"use client";

import * as React from "react";
import Link from "next/link";
import { Chip, KeyValue, Panel, StatusChip, dateTime } from "@cbms/ui";
import type { BlotterEntry } from "../../../../../lib/types";

export interface BlotterDetailLeftPanelsProps {
  entry: BlotterEntry;
  isConfidentialAndHidden: boolean;
  onIssueBpo: () => void;
}

export function BlotterDetailLeftPanels({
  entry,
  isConfidentialAndHidden,
  onIssueBpo,
}: BlotterDetailLeftPanelsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* 1. Complainant, Respondent & Incident Location */}
      <Panel title="Parties & Incident Location">
        <KeyValue
          items={[
            ["Docket Entry No.", <strong>{entry.entryNo}</strong>],
            ["Complainant / Reporter", entry.reportedBy],
            ["Complainant Contact", entry.complainantPhone || "Not provided"],
            ["Respondent / Alleged Person", entry.respondentName || "Unknown / Not identified"],
            ["Incident Location", entry.location],
            ["Incident Timestamp", dateTime(entry.incidentAt)],
            ["Date Officially Logged", entry.createdAt ? dateTime(entry.createdAt) : "N/A"],
            ["Recording Desk Officer", entry.recordedBy || "Desk Officer"],
            [
              "VAWC / Child Protection",
              entry.isConfidential ? (
                <Chip tone="red">Confidential VAWC Record</Chip>
              ) : (
                "Standard Public Record"
              ),
            ],
          ]}
        />
      </Panel>

      {/* 2. Dispute Resolution Stage / KP Mediation Linkage */}
      <Panel title="Katarungang Pambarangay (KP) Status">
        {entry.kpCase ? (
          <div>
            <p style={{ margin: "0 0 1rem 0", fontSize: 13.5, lineHeight: 1.6 }}>
              This blotter entry has been formally endorsed to the <strong>Lupong Tagapamayapa</strong> for amicable settlement under the Katarungang Pambarangay Law (RA 7160).
            </p>
            <KeyValue
              items={[
                ["KP Docket No.", entry.kpCase.caseNo],
                ["Current KP Stage", <StatusChip key="stg" status={entry.kpCase.stage} />],
              ]}
            />
            <div style={{ marginTop: 14 }}>
              <Link href={`/kp/${entry.kpCase.id}`} className="cbms-btn cbms-btn--primary">
                ⚖️ View Full KP Case Docket →
              </Link>
            </div>
          </div>
        ) : entry.category === "vawc" ? (
          <div>
            <p style={{ margin: "0 0 0.85rem 0", fontSize: 13.5, lineHeight: 1.6 }}>
              <strong>Statutory Note on VAWC Cases:</strong> Under Section 410 of the Local Government Code and Republic Act 9262, offenses involving violence against women and children are <strong>non-mediable</strong>.
            </p>
            <ul style={{ margin: "0 0 1rem 0", paddingLeft: "1.25rem", fontSize: "0.85rem", lineHeight: 1.7, color: "#475569" }}>
              <li>No conciliation or confrontation between victim and perpetrator shall be required.</li>
              <li>VAW Desk officer coordinates with PNP Women&apos;s Desk and City Social Welfare (CSWD).</li>
              <li>Barangay Protection Orders (BPO) can be requested from the Punong Barangay.</li>
            </ul>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="cbms-btn cbms-btn--primary"
                onClick={onIssueBpo}
              >
                🛡️ Issue Barangay Protection Order (BPO)
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ margin: "0 0 1rem 0", fontSize: 13.5, lineHeight: 1.6 }}>
              This incident is logged in the Official Barangay Blotter Record. It has not been endorsed to a formal KP conciliation docket.
            </p>
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
              💡 If the parties request amicable dispute settlement, this entry can be elevated into a Katarungang Pambarangay case by the Lupon Secretary.
            </div>
          </div>
        )}
      </Panel>

      {/* 3. Detailed Narrative */}
      <Panel title="Incident Narrative & Initial Intake">
        {isConfidentialAndHidden ? (
          <div style={{ padding: "1.5rem", textAlign: "center", backgroundColor: "#fef2f2", borderRadius: "0.5rem" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🔒</div>
            <strong style={{ color: "#991b1b" }}>Confidential Record Redacted</strong>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#7f1d1d" }}>
              The incident narrative is protected under RA 9262 and cannot be displayed without VAW Desk Officer or Punong Barangay credentials.
            </p>
          </div>
        ) : (
          <div>
            <div
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 14,
                lineHeight: 1.75,
                padding: "1rem 1.25rem",
                backgroundColor: "var(--color-bg-subtle, #f8fafc)",
                borderRadius: "0.375rem",
                border: "1px solid var(--color-border, #e2e8f0)",
                fontFamily: "inherit",
              }}
            >
              {entry.narrative}
            </div>
            <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "#64748b" }}>
              🔒 All blotter entries are recorded with tamper-evident cryptographic hashes and immutable timestamps.
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
