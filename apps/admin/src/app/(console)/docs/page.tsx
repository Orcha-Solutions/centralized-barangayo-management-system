"use client";

import * as React from "react";
import Link from "next/link";
import { Alert, Chip, PageHead, Panel, StatusChip } from "@cbms/ui";

interface DocSection {
  id: string;
  category: string;
  title: string;
  badge: string;
  summary: string;
  content: React.ReactNode;
}

const DOC_SECTIONS: DocSection[] = [
  {
    id: "overview",
    category: "Architecture & Standards",
    title: "1. System Overview & Legal Framework",
    badge: "Statutory",
    summary: "Mandates, dual-track BIMS companion architecture, and statutory compliance (LGC 1991, DILG MC 2025-104, RA 10173, RA 11032).",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14px", lineHeight: "1.65" }}>
        <p>
          The <strong>Centralized Barangay Online Management System (CBMS)</strong> is an enterprise digital governance and public service
          platform designed specifically for Philippine barangays. It serves as an authorized <em>companion system</em> to the
          <strong> Department of the Interior and Local Government (DILG) LGUSS-BIMS</strong> under <strong>DILG MC 2025-104</strong>,
          fulfilling citizen engagement and digital automation without displacing national reporting repositories.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-card)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>🏛️ RA 7160 (Local Government Code)</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              Digitizes Chapter 7 duties: Katarungang Pambarangay (KP) 15-day dispute resolution, Registry of Barangay Inhabitants (RBI),
              and Barangay Assembly records.
            </div>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-card)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>🔒 RA 10173 (Data Privacy Act)</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              Enforces strict least-privilege RBAC. VAWC/child protection records are isolated in encrypted, zero-leakage vaults.
            </div>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-card)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>⚡ RA 11032 (Ease of Doing Business)</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              Enforces 1–3 business day turnaround on barangay clearances and permits via online document applications with QR verification.
            </div>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-card)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>📑 COA Circular Compliance</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              Maker-checker financial authorization: Barangay Treasurer prepares disbursement vouchers while the Punong Barangay approves.
            </div>
          </div>
        </div>

        <Alert tone="info">
          <strong>Institutional Turnover Resiliency:</strong> Because barangay administrations change every 3 years during Barangay and Sangguniang
          Kabataan Elections (BSKE), this documentation ensures that incoming officials can seamlessly onboard, audit past transactions, and maintain
          unbroken public service continuity.
        </Alert>
      </div>
    ),
  },
  {
    id: "rbac-matrix",
    category: "Security & Access",
    title: "2. Role-Based Access Control (RBAC) Matrix",
    badge: "Security",
    summary: "Detailed matrix of 12 distinct personnel roles, permission scopes, and administrative jurisdictions.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14px" }}>
        <p>
          Access to modules is strictly governed by cryptographic session tokens bearing fine-grained permissions (<code style={{ background: "var(--cbms-bg)", padding: "2px 6px", borderRadius: "4px" }}>module:action</code>).
          Staff accounts cannot access data outside their designated statutory duties.
        </p>

        <div className="cbms-table-wrap">
          <table className="cbms-table" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th style={{ width: "200px" }}>Role Designation</th>
                <th style={{ width: "180px" }}>Primary Modules</th>
                <th>Permissions & Operational Responsibilities</th>
                <th style={{ width: "110px" }}>Scope</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Punong Barangay</strong><br/><span style={{ fontSize: "11px", color: "var(--cbms-muted)" }}>Captain / Executive</span></td>
                <td><Chip tone="navy">All Modules</Chip></td>
                <td>Final executive approvals for clearances, ordinances, annual budgets, and e-wallet disbursement batches. Full oversight.</td>
                <td><Chip tone="green">Barangay</Chip></td>
              </tr>
              <tr>
                <td><strong>Barangay Secretary</strong><br/><span style={{ fontSize: "11px", color: "var(--cbms-muted)" }}>Administrative Chief</span></td>
                <td><Chip tone="blue">Inhabitants, Issuance, CMS</Chip></td>
                <td>Manages RBI records, reviews document clearances, publishes ordinances/announcements, issues summon notices.</td>
                <td><Chip tone="green">Barangay</Chip></td>
              </tr>
              <tr>
                <td><strong>Barangay Treasurer</strong><br/><span style={{ fontSize: "11px", color: "var(--cbms-muted)" }}>Custodian of Funds</span></td>
                <td><Chip tone="gold">Finance, E-Wallet, RPT</Chip></td>
                <td>Maintains cash book, general ledgers, creates payout batches, collects fees, issues official receipts (ORs).</td>
                <td><Chip tone="green">Barangay</Chip></td>
              </tr>
              <tr>
                <td><strong>IT Officer / Auditor</strong><br/><span style={{ fontSize: "11px", color: "var(--cbms-muted)" }}>System Oversight</span></td>
                <td><Chip tone="navy">Audit, Admin, Security</Chip></td>
                <td>Monitors live transaction logs, enforces security, and holds authority to toggle user Create/Read/Update/Delete permissions and lock compromised accounts.</td>
                <td><Chip tone="green">Barangay</Chip></td>
              </tr>
              <tr>
                <td><strong>Lupon Secretary</strong><br/><span style={{ fontSize: "11px", color: "var(--cbms-muted)" }}>KP Conciliator</span></td>
                <td><Chip tone="blue">KP Cases & Hearings</Chip></td>
                <td>Registers amity cases, logs mediation notices, tracks statutory 15-day settlement clocks, issues Certificates to File Action (CFA).</td>
                <td><Chip tone="gold">KP Only</Chip></td>
              </tr>
              <tr>
                <td><strong>VAW Desk Officer</strong><br/><span style={{ fontSize: "11px", color: "var(--cbms-muted)" }}>Confidential Protector</span></td>
                <td><Chip tone="red">VAWC Isolated Vault</Chip></td>
                <td>Confidential intake of gender-based incidents, applications for Barangay Protection Orders (BPO), law enforcement coordination.</td>
                <td><Chip tone="red">Zero-Leak</Chip></td>
              </tr>
              <tr>
                <td><strong>Barangay Tanod</strong><br/><span style={{ fontSize: "11px", color: "var(--cbms-muted)" }}>Public Safety</span></td>
                <td><Chip tone="red">SOS Alerts, Blotter, DRRM</Chip></td>
                <td>Receives resident emergency SOS panics, dispatches patrol units, logs blotter occurrences, assists evacuation.</td>
                <td><Chip tone="blue">Field Ops</Chip></td>
              </tr>
              <tr>
                <td><strong>City / DILG Viewer</strong><br/><span style={{ fontSize: "11px", color: "var(--cbms-muted)" }}>LGU Oversight</span></td>
                <td><Chip tone="gray">Roll-up & Scorecards</Chip></td>
                <td>Aggregated quarterly reporting, adoption scorecards, compliance monitoring (strictly read-only across city barangays).</td>
                <td><Chip tone="navy">City Wide</Chip></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
  {
    id: "sop-inhabitants",
    category: "Standard Operating Procedures (SOP)",
    title: "3. SOP-01: Resident Profiling (RBI) & Consent",
    badge: "SOP-01",
    summary: "Step-by-step procedure for encoding inhabitants, tagging vulnerable sectors, and recording DPA consent.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14px", lineHeight: "1.6" }}>
        <p>
          The <strong>Registry of Barangay Inhabitants (RBI)</strong> is mandated under DILG Memorandum Circulars. The CBMS maintains individual
          profiles, household linkages, and residency validation.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "1rem", padding: "0.85rem", border: "1px solid var(--cbms-line)", borderRadius: "8px" }}>
            <div style={{ fontWeight: 800, color: "var(--cbms-navy)", fontSize: "18px" }}>01</div>
            <div>
              <strong>Intake & Identity Verification:</strong> Verify the resident’s primary government-issued ID (PhilSys National ID, Driver's License, or Voter's ID) or proof of billing showing barangay address.
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", padding: "0.85rem", border: "1px solid var(--cbms-line)", borderRadius: "8px" }}>
            <div style={{ fontWeight: 800, color: "var(--cbms-navy)", fontSize: "18px" }}>02</div>
            <div>
              <strong>Data Privacy Act (DPA) Consent:</strong> Before saving personal data, confirm that the resident has signed the paper DPA consent slip or agreed to the in-app Privacy Policy during resident portal signup. Check the <em>"Consent Recorded"</em> box.
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", padding: "0.85rem", border: "1px solid var(--cbms-line)", borderRadius: "8px" }}>
            <div style={{ fontWeight: 800, color: "var(--cbms-navy)", fontSize: "18px" }}>03</div>
            <div>
              <strong>Vulnerability & Sector Tagging:</strong> Mark relevant classification tags (Senior Citizen, PWD, Solo Parent, 4Ps Beneficiary, Out of School Youth). These tags auto-feed into DILG quarterly census roll-ups and emergency aid rosters.
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", padding: "0.85rem", border: "1px solid var(--cbms-line)", borderRadius: "8px" }}>
            <div style={{ fontWeight: 800, color: "var(--cbms-navy)", fontSize: "18px" }}>04</div>
            <div>
              <strong>Household Association:</strong> Link the resident to an existing Household Head or register a new household unit with Purok/Sitio designation.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-issuance",
    category: "Standard Operating Procedures (SOP)",
    title: "4. SOP-02: Certificate Issuance & QR Verification",
    badge: "SOP-02",
    summary: "Clearance processing lifecycle: application, derogatory blotter check, fee payment, and digital QR seal.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14px", lineHeight: "1.6" }}>
        <p>
          Barangay Clearances, Certificates of Residency, Indigency, and Business Permits are generated through an anti-forgery pipeline
          with cryptographic QR verification.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", borderRadius: "8px", background: "var(--cbms-card)", border: "1px solid var(--cbms-line)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>Step 1: Application Review</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              Secretary opens <Link href="/certificates" style={{ color: "var(--cbms-navy)", fontWeight: 600 }}>Document Requests</Link>. Inspect requested purpose, residency status, and attached requirements.
            </div>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", background: "var(--cbms-card)", border: "1px solid var(--cbms-line)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>Step 2: Derogatory Check</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              The system automatically queries the active Blotter and KP Case logs. If pending unconciliated criminal complaints exist, flag for Captain review before approval.
            </div>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", background: "var(--cbms-card)", border: "1px solid var(--cbms-line)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>Step 3: Fee & Payment</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              Paid through citizen e-wallet, online EMI rail, or Over-the-Counter (OTC) at Treasurer counter with Official Receipt (OR) issuance. Indigency certificates waive fees.
            </div>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", background: "var(--cbms-card)", border: "1px solid var(--cbms-line)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>Step 4: Approval & QR</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              Punong Barangay signs digitally. A dynamic QR code is embedded. Employers, banks, and DFA can scan the code to verify authentic provenance.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-kp",
    category: "Standard Operating Procedures (SOP)",
    title: "5. SOP-03: Katarungang Pambarangay (KP) Mediation",
    badge: "SOP-03",
    summary: "Statutory conciliation workflows, 15-day mediation timelines, summons issuance, and CFA certification.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14px", lineHeight: "1.6" }}>
        <p>
          The Katarungang Pambarangay system provides community-level alternative dispute resolution under the Local Government Code.
          Strict statutory countdown clocks govern every proceeding.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ padding: "1rem", borderRadius: "8px", borderLeft: "4px solid var(--cbms-navy)", background: "var(--cbms-card)" }}>
            <strong>Phase 1 — Punong Barangay Mediation (Days 1–15):</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--cbms-muted)" }}>
              Upon complaint filing, Lupon Secretary enters docket details. Punong Barangay issues KP Form 7 (Notice of Hearing) and summons respondent within 3 business days. The system begins the 15-day statutory conciliation countdown.
            </p>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", borderLeft: "4px solid var(--cbms-gold)", background: "var(--cbms-card)" }}>
            <strong>Phase 2 — Pangkat Tagapagkasundo (Days 16–30):</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--cbms-muted)" }}>
              If mediation fails, a 3-member Pangkat Tagapagkasundo is constituted. The system schedules conciliation hearings within an additional 15 calendar days.
            </p>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", borderLeft: "4px solid var(--cbms-red)", background: "var(--cbms-card)" }}>
            <strong>Phase 3 — Resolution or Certificate to File Action (CFA):</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--cbms-muted)" }}>
              If settled: Execute KP Form 16 (Amicable Settlement), which carries force of court judgment after 10 days. If conciliation fails: Issue KP Form 20 (Certificate to File Action / CFA) enabling the complainant to file in Municipal Trial Court.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-audit",
    category: "System Administration",
    title: "6. SOP-04: IT Security, Audit Logs & User CRUD Lockdown",
    badge: "Security Ops",
    summary: "Protocols for IT Officers monitoring transaction trails and disabling CRUD actions during security incidents.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14px", lineHeight: "1.6" }}>
        <p>
          The <strong>IT Officer / Systems Auditor</strong> provides independent integrity oversight. Every data creation, modification,
          status override, and login attempt is written to an immutable Audit Log.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-white)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "6px" }}>🔍 Real-time Transaction Monitoring</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              Inspect <Link href="/audit" style={{ color: "var(--cbms-navy)", fontWeight: 600 }}>Audit Log</Link> daily for anomalous spikes in clearance approvals, off-hour logins, failed auth attempts, or mass profile exports.
            </div>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-white)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "6px" }}>🎛️ Granular CRUD Permission Controls</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              In the <em>User CRUD & Security Management</em> tab, the IT Officer can toggle individual Create, Read, Update, or Delete authorizations per operator without deleting their user record.
            </div>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-white)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "6px" }}>🚨 Immediate Account Quarantine</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              In the event of lost staff credentials or suspected compromise, click <strong>Lock Account</strong> immediately. This revokes session validity across all terminals.
            </div>
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-white)" }}>
            <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "6px" }}>💾 Database & Off-Site Backups</div>
            <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
              Automated PostgreSQL backups run daily at 02:00 PHT with AES-256 encryption. Stored locally and replicated to secure LGU offsite cold storage.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-disaster",
    category: "Emergency & Public Safety",
    title: "7. SOP-05: Emergency SOS Dispatch & DRRM Incident Response",
    badge: "SOP-05",
    summary: "Protocols for incoming resident SOS panic alerts, Tanod dispatching, and evacuation center management.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14px", lineHeight: "1.6" }}>
        <p>
          During typhoons, earthquakes, fires, or medical emergencies, the Barangay Disaster Risk Reduction and Management Committee (BDRRMC)
          and Barangay Tanod operate the SOS Dispatch desk.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ padding: "0.85rem", borderRadius: "8px", background: "var(--cbms-card)", border: "1px solid var(--cbms-line)" }}>
            <strong>1. SOS Alert Ingestion:</strong> Resident presses the emergency SOS button on the mobile portal. GPS coordinates, household roster, and contact numbers instantly trigger audio-visual alarms in the <Link href="/sos" style={{ color: "var(--cbms-navy)", fontWeight: 600 }}>SOS Dispatch</Link> console.
          </div>
          <div style={{ padding: "0.85rem", borderRadius: "8px", background: "var(--cbms-card)", border: "1px solid var(--cbms-line)" }}>
            <strong>2. Tanod Mobilization:</strong> Desk operator dispatches the nearest patrol team via radio, marking the alert status as <StatusChip status="dispatched" /> with assigned Tanod leader names.
          </div>
          <div style={{ padding: "0.85rem", borderRadius: "8px", background: "var(--cbms-card)", border: "1px solid var(--cbms-line)" }}>
            <strong>3. Evacuation Center Headcount:</strong> In natural disasters, evacuees arriving at registered evacuation shelters (schools, covered courts) are scanned in by BHW/Tanod, auto-calculating real-time relief food pack requirements.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "faq-troubleshooting",
    category: "Troubleshooting",
    title: "8. FAQ & System Troubleshooting",
    badge: "Troubleshoot",
    summary: "Common operational questions, session errors, offline modes, and printer configurations.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "14px" }}>
        <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-card)" }}>
          <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>Q: What should we do if the barangay hall loses internet connectivity?</div>
          <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
            The CBMS Admin Console runs as an offline-first Progressive Web App (PWA). Basic viewing of previously loaded resident profiles remains accessible. Changes are queued in IndexedDB and automatically synced to the server once connection is restored.
          </div>
        </div>
        <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-card)" }}>
          <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>Q: How do we configure official clearance letterheads and dry seals?</div>
          <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
            Navigate to <em>Communication &gt; Website CMS &gt; Barangay Branding</em>. Upload your official Barangay Logo and City Seal in high-resolution PNG format. These automatically format on printable SVG clearance templates.
          </div>
        </div>
        <div style={{ padding: "1rem", borderRadius: "8px", border: "1px solid var(--cbms-line)", background: "var(--cbms-card)" }}>
          <div style={{ fontWeight: 700, color: "var(--cbms-navy)", marginBottom: "4px" }}>Q: An operator's account has been locked. How can it be restored?</div>
          <div style={{ fontSize: "13px", color: "var(--cbms-muted)" }}>
            Only the <strong>IT Officer</strong> or the <strong>Punong Barangay</strong> can unlock an account. In <Link href="/audit" style={{ color: "var(--cbms-navy)", fontWeight: 600 }}>Audit Log &gt; User CRUD & Security</Link>, find the user and click <em>"Unlock Account"</em>. The user will be required to change their password on next login.
          </div>
        </div>
      </div>
    ),
  },
];

export default function DocumentationPage() {
  const [activeSectionId, setActiveSectionId] = React.useState("overview");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredSections = React.useMemo(() => {
    if (!searchQuery.trim()) return DOC_SECTIONS;
    const q = searchQuery.toLowerCase();
    return DOC_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeSection = DOC_SECTIONS.find((s) => s.id === activeSectionId) || DOC_SECTIONS[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHead
        title="Operations Manual & Documentation"
        subtitle="Standard operating procedures, governance compliance, statutory timelines, and role-based operational guides for the Centralized Barangay Management System."
        breadcrumb="Admin / Documentation & SOPs"
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              className="cbms-btn cbms-btn--secondary cbms-btn--sm"
              onClick={handlePrint}
              title="Print or Save as PDF"
            >
              🖨️ Export PDF / Print
            </button>
            <Link href="/audit" className="cbms-btn cbms-btn--primary cbms-btn--sm">
              🛡️ IT Audit & User Controls
            </Link>
          </div>
        }
      />

      {/* Top Search & Filter Bar */}
      <Panel>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
            <input
              type="text"
              className="cbms-input"
              style={{ width: "100%", paddingLeft: "2.25rem" }}
              placeholder="Search SOPs, legal codes, roles, procedures, or troubleshooting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--cbms-muted)" }}>
              🔍
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", fontSize: "13px", color: "var(--cbms-muted)" }}>
            <span>Version: <strong>2026.1 (LGU-Ready)</strong></span>
            <span>•</span>
            <span>Accreditation: <strong>DILG MC 2025-104</strong></span>
          </div>
        </div>
      </Panel>

      {/* Main Documentation Split View */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Navigation Table of Contents */}
        <Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--cbms-muted)", paddingBottom: "0.5rem", borderBottom: "1px solid var(--cbms-line)" }}>
              Table of Contents
            </div>
            {filteredSections.map((sec) => {
              const isSelected = sec.id === activeSection.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSectionId(sec.id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "4px",
                    padding: "0.65rem 0.75rem",
                    borderRadius: "6px",
                    border: isSelected ? "1px solid var(--cbms-navy)" : "1px solid transparent",
                    background: isSelected ? "rgba(10, 36, 99, 0.06)" : "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--cbms-card)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: isSelected ? "var(--cbms-navy)" : "var(--cbms-muted)" }}>
                      {sec.category}
                    </span>
                    <Chip tone={isSelected ? "navy" : "gray"}>{sec.badge}</Chip>
                  </div>
                  <div style={{ fontSize: "13.5px", fontWeight: isSelected ? 700 : 500, color: isSelected ? "var(--cbms-navy)" : "var(--cbms-ink)" }}>
                    {sec.title}
                  </div>
                </button>
              );
            })}
            {filteredSections.length === 0 && (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--cbms-muted)", fontSize: "13px" }}>
                No documentation topics match "{searchQuery}".
              </div>
            )}
          </div>
        </Panel>

        {/* Selected Section Content Viewer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <Panel>
            <div style={{ paddingBottom: "1rem", borderBottom: "1px solid var(--cbms-line)", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <Chip tone="navy">{activeSection.category}</Chip>
                <Chip tone="gold">{activeSection.badge}</Chip>
              </div>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--cbms-navy)" }}>
                {activeSection.title}
              </h2>
              <p style={{ margin: "6px 0 0", color: "var(--cbms-muted)", fontSize: "13.5px" }}>
                {activeSection.summary}
              </p>
            </div>

            <div>{activeSection.content}</div>
          </Panel>

          {/* Quick Action Navigation Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0" }}>
            {(() => {
              const currIdx = DOC_SECTIONS.findIndex((s) => s.id === activeSection.id);
              const prev = currIdx > 0 ? DOC_SECTIONS[currIdx - 1] : null;
              const next = currIdx < DOC_SECTIONS.length - 1 ? DOC_SECTIONS[currIdx + 1] : null;

              return (
                <>
                  {prev ? (
                    <button
                      type="button"
                      className="cbms-btn cbms-btn--secondary cbms-btn--sm"
                      onClick={() => setActiveSectionId(prev.id)}
                    >
                      ← {prev.title.split(":")[0]}
                    </button>
                  ) : <div />}

                  {next ? (
                    <button
                      type="button"
                      className="cbms-btn cbms-btn--primary cbms-btn--sm"
                      onClick={() => setActiveSectionId(next.id)}
                    >
                      {next.title.split(":")[0]} →
                    </button>
                  ) : <div />}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
