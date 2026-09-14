"use client";

import * as React from "react";
import { Alert, Chip, DataTable, PageHead, Panel, ParityBadge } from "@cbms/ui";
import type { Column } from "@cbms/ui";

interface ParityRow {
  id: string;
  module: string;
  acronym: string;
  subsystem: string;
  role: string;
}

const PARITY_ROWS: ParityRow[] = [
  {
    id: "bips",
    module: "Inhabitants & households",
    acronym: "BIPS",
    subsystem: "Barangay Inhabitants Profiling System",
    role: "Mirrors the Registry of Barangay Inhabitants (RBI) record set; CBMS adds consent tracking and completeness scoring.",
  },
  {
    id: "bcis",
    module: "Certificates & clearances",
    acronym: "BCIS",
    subsystem: "Barangay Certificate Issuance System",
    role: "Same document types and approval chain, plus a public QR verification endpoint.",
  },
  {
    id: "kpisbh",
    module: "Blotter & Katarungang Pambarangay",
    acronym: "KPISBH",
    subsystem: "Katarungang Pambarangay Information System & Barangay Hearings",
    role: "Case stages, hearings and the statutory KP deadline clock.",
  },
  {
    id: "bams",
    module: "Property & assets",
    acronym: "BAMS",
    subsystem: "Barangay Assets Management System",
    role: "Asset register, condition status and materials inventory.",
  },
  {
    id: "bdris",
    module: "Disaster risk & response",
    acronym: "BDRIS",
    subsystem: "Barangay Disaster Risk Information System",
    role: "Hazard profile, evacuation centres and incident events.",
  },
  {
    id: "bgadpbms",
    module: "Gender & development",
    acronym: "BGADPBMS",
    subsystem: "Barangay GAD Plan & Budget Monitoring System",
    role: "GAD plans and budget utilisation tracking.",
  },
  {
    id: "boris",
    module: "Legislation",
    acronym: "BORIS",
    subsystem: "Barangay Ordinances & Resolutions Information System",
    role: "Ordinances and resolutions with their enactment lifecycle.",
  },
  {
    id: "bfms",
    module: "Finance",
    acronym: "BFMS",
    subsystem: "Barangay Financial Management System",
    role: "Budgets, ledger by fund and official receipts.",
  },
];

const PARITY_COLUMNS: Column<ParityRow>[] = [
  {
    key: "module",
    header: "CBMS module",
    render: (r) => <span className="cbms-table__primary">{r.module}</span>,
  },
  {
    key: "acronym",
    header: "BIMS sub-system",
    width: 170,
    render: (r) => <ParityBadge bims={r.acronym} />,
  },
  {
    key: "subsystem",
    header: "Full name",
    render: (r) => <span style={{ fontSize: 12.5 }}>{r.subsystem}</span>,
  },
  {
    key: "role",
    header: "What CBMS does",
    render: (r) => (
      <span className="cbms-table__muted" style={{ fontSize: 12.5 }}>
        {r.role}
      </span>
    ),
  },
];

const EXCLUSIVE = [
  {
    title: "Barangay e-wallet",
    body: "Resident wallets, merchant acceptance, cash-in/out agents, maker-checker disbursement batches and fee payment. There is no LGUSS-BIMS counterpart — this is the adoption programme the scorecard measures.",
  },
  {
    title: "AI assistance layer",
    body: "Drafting help, triage of concerns and summarisation over barangay records. Advisory only: a human officer approves every issued document or decision.",
  },
  {
    title: "Resident self-service",
    body: "Mobile requests for certificates, concern reporting with SLA tracking, SOS alerts, appointments, feedback (CSM) and personal data export under RA 10173.",
  },
  {
    title: "Multi-barangay oversight",
    body: "This hub: city-wide roll-ups, the adoption scorecard and quarterly reporting across every onboarded barangay.",
  },
];

export default function HubAboutPage() {
  return (
    <>
      <PageHead
        title="About CBMS & DILG Parity"
        breadcrumb="Hub / About"
        subtitle="How the Centralized Barangay Management System relates to the DILG's mandated barangay information system."
      />

      <div style={{ marginBottom: 18 }}>
        <Alert tone="warn">
          <strong>CBMS is a companion to LGUSS-BIMS — never a replacement.</strong> The DILG
          Local Government Unit Support System — Barangay Information Management System
          (LGUSS-BIMS) remains the system of record for every barangay that operates in{" "}
          <Chip tone="blue">Companion</Chip> mode. CBMS reads from and annotates that record; it
          does not overwrite it, and it does not discharge any reporting duty owed to the DILG.
        </Alert>
      </div>

      <div className="cbms-grid-2" style={{ marginBottom: 18 }}>
        <Panel title="Policy basis">
          <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            <p style={{ marginTop: 0 }}>
              <strong>DILG Memorandum Circular No. 2025-104</strong> — mandates the adoption of
              the LGUSS-BIMS by barangays nationwide and sets the onboarding and LGU approval
              process. CBMS mirrors its sub-system boundaries so that data captured here maps
              cleanly onto the mandated system rather than competing with it.
            </p>
            <p style={{ marginBottom: 0 }}>
              <strong>DILG Memorandum Circular No. 2020-117</strong> — cited as the basis for the
              Registry of Barangay Inhabitants (RBI) data set. The CBMS inhabitants module keeps
              RBI-compatible fields and can export the registry in RBI form.
            </p>
          </div>
        </Panel>

        <Panel title="Operating modes">
          <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            <p style={{ marginTop: 0 }}>
              <Chip tone="blue">Companion</Chip> — the default. LGUSS-BIMS is authoritative;
              records sourced from it are read-only in CBMS and carry their BIMS provenance.
            </p>
            <p style={{ marginBottom: 0 }}>
              <Chip tone="navy">Standalone</Chip> — for pilots and demonstrations only, where a
              barangay is not yet onboarded to LGUSS-BIMS. CBMS records are authoritative until
              the barangay is migrated across.
            </p>
          </div>
        </Panel>
      </div>

      <Panel title="Group A — modules with LGUSS-BIMS parity" padded={false}>
        <DataTable columns={PARITY_COLUMNS} rows={PARITY_ROWS} rowKey={(r) => r.id} />
      </Panel>

      <div style={{ marginTop: 18 }}>
        <Panel
          title="Group B — CBMS-exclusive capabilities"
          actions={<ParityBadge />}
        >
          <div className="cbms-grid-2">
            {EXCLUSIVE.map((e) => (
              <div key={e.title} style={{ marginBottom: 4 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: "var(--cbms-navy)",
                    marginBottom: 4,
                  }}
                >
                  {e.title}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--cbms-muted)" }}>
                  {e.body}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <p
        style={{
          fontSize: 11.5,
          color: "var(--cbms-muted)",
          marginTop: 16,
          maxWidth: "85ch",
          lineHeight: 1.6,
        }}
      >
        Sub-system names follow the LGUSS-BIMS module list. This deployment is a demonstration
        environment: the BIMS, PhilSys and e-money integrations are mock adapters and no live
        DILG connection exists. Personal data handling follows the Data Privacy Act of 2012 (RA
        10173); the DILG viewer role receives aggregates only.
      </p>
    </>
  );
}
