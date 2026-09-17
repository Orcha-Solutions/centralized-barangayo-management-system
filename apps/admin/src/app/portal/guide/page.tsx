"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

interface GuideSection {
  id: string;
  category: string;
  title: string;
  badge: string;
  summary: string;
  content: React.ReactNode;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "overview",
    category: "Legal Framework & Mandates",
    title: "1. Statutory Framework, BPS/BIS & BIMS Companion Architecture",
    badge: "DILG Statutory",
    summary: "Statutory grounding under RA 7160, RA 6975, DILG MC 2020-117 (Barangay Profile System / BIS-BPS), DILG MC 2025-104 (LGUSS-BIMS), RA 10173, and RA 11032.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7", color: "var(--site-ink)" }}>
        <p>
          The <strong>Centralized Barangay Online Management System (CBMS)</strong> is an enterprise digital governance, administration,
          and public service platform purpose-built for the Philippines' ~42,000 barangays. Operating under statutory mandates from the
          <strong> Department of the Interior and Local Government (DILG)</strong>, the <strong>Commission on Audit (COA)</strong>, and the
          <strong> Bangko Sentral ng Pilipinas (BSP)</strong>, the CBMS serves as a dual-track <em>companion system</em> alongside national platforms.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff", boxShadow: "0 2px 8px rgba(10,36,99,0.04)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px", fontSize: "15px" }}>📋 DILG MC 2020-117 (BIS & BPS)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Pursuant to RA 6975 Rule III Sec. 12(c)(4) and NBOO directives, establishes the <strong>Barangay Profile System (BPS)</strong> module under the Barangay Information System (BIS) Intranet for socio-economic, physical, and demographic profiling.
            </div>
          </div>
          <div style={{ padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff", boxShadow: "0 2px 8px rgba(10,36,99,0.04)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px", fontSize: "15px" }}>🏛️ DILG MC 2025-104 (LGUSS-BIMS)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Mandates DILG-hosted LGUSS-BIMS as the official national repository of record (BIPS, BCIS, KPISBH, BAMS, BDRIS, BGADPBMS, BORIS, BDP, BBI, BFMS). CBMS acts as the citizen-facing digital companion.
            </div>
          </div>
          <div style={{ padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff", boxShadow: "0 2px 8px rgba(10,36,99,0.04)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px", fontSize: "15px" }}>🔒 RA 10173 (Data Privacy Act)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Governs all resident profiling (RBI). Requires explicit household consent records, cryptographic data protection, zero-leakage VAWC registries, and initials-only public verification.
            </div>
          </div>
          <div style={{ padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff", boxShadow: "0 2px 8px rgba(10,36,99,0.04)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px", fontSize: "15px" }}>⚡ RA 11032 & COA Standards</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Ease of Doing Business mandates 1–3 business day turnaround on clearances with Client Satisfaction Measurement (CSM). COA regulations enforce maker-checker financial disbursement controls.
            </div>
          </div>
        </div>

        <div style={{ padding: "1rem 1.25rem", borderRadius: "8px", background: "#eef3fc", borderLeft: "4px solid var(--site-navy)", color: "var(--site-navy-deep)", fontSize: "13.5px" }}>
          <strong>The Dual-Track Architecture Rule:</strong> Under <em>ADR 0002</em>, CBMS runs in <code>companion</code> mode (mirroring BIMS via adapters and preserving statutory records without overwriting) or <code>standalone</code> mode (authoritative for pilot LGUs, exporting directly into standardized BPS DCF No. 1 and BIMS formats).
        </div>
      </div>
    ),
  },
  {
    id: "bps-dcf1",
    category: "DILG MC 2020-117 Compliance",
    title: "2. SOP-BPS: Barangay Profile Data Capture (BPS DCF No. 1)",
    badge: "MC 2020-117",
    summary: "Standard operational procedure for accomplishing, certifying, and uploading Annex A (BPS DCF No. 1) across its 6 statutory information areas.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          Under <strong>DILG Memorandum Circular No. 2020-117</strong>, every barangay must systematically gather and update its master socioeconomic and institutional profile using <strong>Barangay Profile Data Capture Form No. 1 (BPS DCF No. 1)</strong>.
          CBMS automates the extraction and validation of these indicators directly from active operational modules.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px" }}>Area I: Physical Information</div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "13px", color: "var(--site-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li><strong>Land Area:</strong> Total square hectares; urban vs. rural classification linked to PSGC.</li>
              <li><strong>Land Classification:</strong> Upland, Lowland, Coastal, Landlocked terrain tags.</li>
              <li><strong>Location Type:</strong> Tabing-Ilog, Tabing-Dagat, Tabing-Bundok, Poblacion.</li>
              <li><strong>Economic Drivers:</strong> Agricultural, Fishing, Commercial, Industrial sectors.</li>
            </ul>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px" }}>Area II: Political & BBI Functionality</div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "13px", color: "var(--site-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li><strong>Creation & Precincts:</strong> Legal basis of creation, plebiscite date, and COMELEC precincts.</li>
              <li><strong>Officials Roster:</strong> Auto-linked to BOPS (Barangay Officials Profiling System) and IPMRA.</li>
              <li><strong>Appointed Workers:</strong> Tanods, BHWs, BNS, Day Care, VAW Desk, BADAC clusters.</li>
              <li><strong>BBI Ratings:</strong> Functionality matrices for BDC, BPOC, BCPC, VAW Desk, and BADAC.</li>
            </ul>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px" }}>Area III: Fiscal Information (Q1 Update)</div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "13px", color: "var(--site-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li><strong>External Sources:</strong> National Tax Allotment (NTA/IRA), donations, national wealth share.</li>
              <li><strong>Local Revenue:</strong> Real Property Tax (RPT) share, local fees, regulatory charges.</li>
              <li><strong>Formula Balance:</strong> General Fund = External + Local Revenue (auto-computed).</li>
              <li><strong>SK Statutory Allocation:</strong> Exact 10% statutory share from General Fund.</li>
            </ul>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px" }}>Area IV: Demographic Breakdown (Semestral)</div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "13px", color: "var(--site-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li><strong>Census Counts:</strong> Registered voters, total inhabitants, household and family counts.</li>
              <li><strong>Age Cohorts:</strong> 0-5 yrs, 6-12 yrs, 13-17 yrs, 18-35 yrs, 36-50 yrs, 51-65 yrs, 66+ yrs.</li>
              <li><strong>Sector Flags:</strong> Labor force, unemployed, OSY, OSC, PWD, OFW, Solo Parents, IPs.</li>
              <li><strong>Semestral Cycle:</strong> 1st Semester due within July; 2nd Semester due within January.</li>
            </ul>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px" }}>Area V: Facilities & Property Inventory</div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "13px", color: "var(--site-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li><strong>Physical Facilities:</strong> Hall, Health Station, Day Care, Covered Court, MRF.</li>
              <li><strong>Public Safety & DRR Assets:</strong> Service vehicles, patrol multicabs, rescue boats, radios, sirens.</li>
              <li><strong>IT Equipment & Furniture:</strong> Desktop sets, webcams, biometric scanners, printers.</li>
              <li><strong>Potable Water Levels:</strong> Level 1 (spring/well), Level 2 (public faucet), Level 3 (household faucet).</li>
            </ul>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px" }}>Area VI: Institutional Recognitions</div>
            <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "13px", color: "var(--site-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li><strong>Annual Accreditations:</strong> National, Regional, and Local awards received during the year.</li>
              <li><strong>Sign-off Hierarchy:</strong> Jointly prepared by Barangay Secretary & Treasurer; certified correct by Punong Barangay.</li>
              <li><strong>LGOO Validation:</strong> Verified and encoded by the DILG City/Municipal Field Officer.</li>
            </ul>
          </div>
        </div>

        <div style={{ padding: "1rem 1.25rem", borderRadius: "8px", background: "#fff", borderTop: "1px solid var(--site-line)", borderRight: "1px solid var(--site-line)", borderBottom: "1px solid var(--site-line)", borderLeft: "4px solid var(--site-gold)" }}>
          <strong style={{ color: "#8a5a00" }}>Statutory Flow (Annex C - Process Flow):</strong>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
            Barangay Secretary & Treasurer accomplish BPS DCF 1 → Punong Barangay signs & certifies → DILG Field Office (LGOO) validates completeness → Encoded into DILG Intranet BIS-BPS → Monitored by DILG Provincial & Regional RICTU → National roll-up by NBOO & ISTMS.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "rbac-matrix",
    category: "Governance & Security",
    title: "3. Role-Based Access Control (RBAC) & Duty Segregation",
    badge: "Security",
    summary: "Personnel roles, jurisdictional boundaries, module authorizations, and administrative separation of duties.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14px" }}>
        <p style={{ color: "var(--site-ink)", lineHeight: 1.6 }}>
          Administrative access requires authenticated credentials with fine-grained cryptographic permission tokens (<code style={{ background: "#eef3fc", padding: "2px 6px", borderRadius: "4px", color: "var(--site-navy)" }}>module:action</code>).
          Personnel cannot access records outside their statutory mandates.
        </p>

        <div style={{ overflowX: "auto", border: "1px solid var(--site-line)", borderRadius: "10px", background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid var(--site-line)" }}>
                <th style={{ padding: "12px 16px", color: "var(--site-navy)", fontWeight: 700, width: "190px" }}>Role Designation</th>
                <th style={{ padding: "12px 16px", color: "var(--site-navy)", fontWeight: 700, width: "180px" }}>Module Jurisdiction</th>
                <th style={{ padding: "12px 16px", color: "var(--site-navy)", fontWeight: 700 }}>Operational Mandate & SOP Responsibility</th>
                <th style={{ padding: "12px 16px", color: "var(--site-navy)", fontWeight: 700, width: "110px" }}>Scope</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--site-line)" }}>
                <td style={{ padding: "12px 16px" }}><strong>Punong Barangay</strong><br/><span style={{ fontSize: "11px", color: "var(--site-muted)" }}>Captain / Executive</span></td>
                <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "999px", background: "#0a2463", color: "#fff", fontSize: "11px", fontWeight: 600 }}>All Modules</span></td>
                <td style={{ padding: "12px 16px" }}>Final approvals for clearances, ordinances, annual investment plans, and disbursement batches. Full oversight.</td>
                <td style={{ padding: "12px 16px" }}><span style={{ color: "var(--site-green)", fontWeight: 700 }}>Barangay</span></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--site-line)" }}>
                <td style={{ padding: "12px 16px" }}><strong>Barangay Secretary</strong><br/><span style={{ fontSize: "11px", color: "var(--site-muted)" }}>Administrative Officer</span></td>
                <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "999px", background: "#eef3fc", color: "#0a2463", fontSize: "11px", fontWeight: 600 }}>RBI, Issuance, CMS</span></td>
                <td style={{ padding: "12px 16px" }}>Manages Inhabitant Registry (RBI), accomplishes BPS DCF No. 1, processes certificate applications, publishes transparency boards.</td>
                <td style={{ padding: "12px 16px" }}><span style={{ color: "var(--site-green)", fontWeight: 700 }}>Barangay</span></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--site-line)" }}>
                <td style={{ padding: "12px 16px" }}><strong>Barangay Treasurer</strong><br/><span style={{ fontSize: "11px", color: "var(--site-muted)" }}>Custodian of Funds</span></td>
                <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "999px", background: "#fff6e0", color: "#8a5a00", fontSize: "11px", fontWeight: 600 }}>Finance, E-Wallet, RPT</span></td>
                <td style={{ padding: "12px 16px" }}>Maintains cash book, accomplishes BPS fiscal section, issues official receipts (ORs), prepares disbursement vouchers.</td>
                <td style={{ padding: "12px 16px" }}><span style={{ color: "var(--site-green)", fontWeight: 700 }}>Barangay</span></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--site-line)" }}>
                <td style={{ padding: "12px 16px" }}><strong>IT Officer / Auditor</strong><br/><span style={{ fontSize: "11px", color: "var(--site-muted)" }}>System Oversight</span></td>
                <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "999px", background: "#0a2463", color: "#fff", fontSize: "11px", fontWeight: 600 }}>Audit, Admin, Security</span></td>
                <td style={{ padding: "12px 16px" }}>Monitors transaction audit logs, toggles user CRUD buttons (Create, Read, Update, Delete) and triggers emergency account lockouts.</td>
                <td style={{ padding: "12px 16px" }}><span style={{ color: "var(--site-green)", fontWeight: 700 }}>Barangay</span></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--site-line)" }}>
                <td style={{ padding: "12px 16px" }}><strong>Lupon Secretary</strong><br/><span style={{ fontSize: "11px", color: "var(--site-muted)" }}>Amicable Conciliation</span></td>
                <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "999px", background: "#eef3fc", color: "#0a2463", fontSize: "11px", fontWeight: 600 }}>KP Cases & Hearings</span></td>
                <td style={{ padding: "12px 16px" }}>Enters dispute cases, serves summons, monitors 15-day statutory conciliation clock, issues Certificates to File Action (CFA).</td>
                <td style={{ padding: "12px 16px" }}><span style={{ color: "#a97400", fontWeight: 700 }}>KP Track</span></td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--site-line)" }}>
                <td style={{ padding: "12px 16px" }}><strong>VAW Desk Officer</strong><br/><span style={{ fontSize: "11px", color: "var(--site-muted)" }}>Confidential Protector</span></td>
                <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "999px", background: "#fdeaec", color: "#ce1126", fontSize: "11px", fontWeight: 600 }}>VAWC Isolated Track</span></td>
                <td style={{ padding: "12px 16px" }}>Confidential intake of domestic abuse & child cases, Barangay Protection Orders (BPO), PNP coordination. Isolated from public logs.</td>
                <td style={{ padding: "12px 16px" }}><span style={{ color: "var(--site-red)", fontWeight: 700 }}>Encrypted</span></td>
              </tr>
              <tr>
                <td style={{ padding: "12px 16px" }}><strong>Barangay Tanod</strong><br/><span style={{ fontSize: "11px", color: "var(--site-muted)" }}>Public Safety</span></td>
                <td style={{ padding: "12px 16px" }}><span style={{ padding: "3px 8px", borderRadius: "999px", background: "#fdeaec", color: "#ce1126", fontSize: "11px", fontWeight: 600 }}>SOS Alerts, Blotter</span></td>
                <td style={{ padding: "12px 16px" }}>Field patrol coordination, emergency SOS panic dispatching, incident blotter intake, disaster evacuation support.</td>
                <td style={{ padding: "12px 16px" }}><span style={{ color: "var(--site-navy)", fontWeight: 700 }}>Field Ops</span></td>
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
    title: "4. SOP-01: Inhabitant Profiling (RBI) & Consent Lifecycle",
    badge: "SOP-01 (BIPS)",
    summary: "Field intake, national identity verification, Data Privacy Act consent collection, and demographic sector tagging.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          The <strong>Registry of Barangay Inhabitants (RBI)</strong> is mandated under DILG MC 2008-144 and reiterated by Advisory dated Sept. 10, 2019.
          The CBMS captures inhabitant data once and propagates it across all administrative modules without redundant encoding.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", gap: "1rem", padding: "1rem", border: "1px solid var(--site-line)", borderRadius: "8px", background: "#fff" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", fontSize: "20px" }}>01</div>
            <div>
              <strong style={{ color: "var(--site-navy)" }}>ID Verification & Deduplication:</strong> Verify applicant with PhilSys National ID, ePhilID, or Voter's ID. Automated deduplication checks prevent duplicate registration across puroks using fuzzy name + birthdate matching.
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", padding: "1rem", border: "1px solid var(--site-line)", borderRadius: "8px", background: "#fff" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", fontSize: "20px" }}>02</div>
            <div>
              <strong style={{ color: "var(--site-navy)" }}>Data Privacy Act (DPA) Consent Record:</strong> Mandatory recording of household consent artifacts (who consented, when, specific purpose, signed document attachment). Under RA 10173, no data is shared with third parties without on-file consent.
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", padding: "1rem", border: "1px solid var(--site-line)", borderRadius: "8px", background: "#fff" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", fontSize: "20px" }}>03</div>
            <div>
              <strong style={{ color: "var(--site-navy)" }}>BPS Sector & Vulnerability Tagging:</strong> Mark classifications matching BPS DCF No. 1 (Senior Citizen 60+, PWD, Solo Parent, 4Ps Beneficiary, OSY, Overseas Filipino Worker / OFW, and Indigenous Peoples / IP).
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", padding: "1rem", border: "1px solid var(--site-line)", borderRadius: "8px", background: "#fff" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", fontSize: "20px" }}>04</div>
            <div>
              <strong style={{ color: "var(--site-navy)" }}>Household Linking & Export:</strong> Assign household head, register street and purok address, and export standardized BIMS Form B CSV files for semestral compliance submission.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-issuance",
    category: "Standard Operating Procedures (SOP)",
    title: "5. SOP-02: Certificate Issuance, Fees & Public QR Verification",
    badge: "SOP-02 (BCIS)",
    summary: "Clearance application review, derogatory database checks, official fee collections, and anti-forgery QR code validation.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          Barangay Clearances, Residency Certificates, Indigency Certifications, and Business Clearances (LGC §152(c)) are processed with full transparency,
          preventing illegal fixers through published ordinance fee schedules and instant QR authentication.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Step 1: Application Intake</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Applicant applies online via portal or OTC at the barangay hall. First-time Jobseekers (RA 11261) and Indigents receive 100% statutory fee waivers.
            </div>
          </div>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Step 2: Derogatory Check</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              System checks active Blotter and KP Case logs. Applicants with unresolved criminal complaints require captain review before approval.
            </div>
          </div>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Step 3: Cashiering & OR</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Treasurer assesses fees based on published fee schedules. Official Receipt (OR) is generated and automatically recorded in the General Ledger (A10).
            </div>
          </div>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Step 4: Cryptographic QR Seal</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Punong Barangay signs. Document renders with dynamic QR code verifiable through the portal's <Link href="/portal/verify" style={{ color: "var(--site-navy)", fontWeight: 700 }}>QR Verification Tool</Link>.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-kp",
    category: "Standard Operating Procedures (SOP)",
    title: "6. SOP-03: Katarungang Pambarangay (KP) Conciliation Timelines",
    badge: "SOP-03 (KPISBH)",
    summary: "Statutory 15-day conciliation timeline clocks, mediation notices, amity agreements, and CFA certifications.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          The Katarungang Pambarangay (KP) system provides community dispute resolution under Title One, Book III of RA 7160.
          Strict statutory deadlines protect disputants from administrative delays.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ padding: "1rem 1.25rem", borderRadius: "8px", background: "#fff", borderTop: "1px solid var(--site-line)", borderRight: "1px solid var(--site-line)", borderBottom: "1px solid var(--site-line)", borderLeft: "4px solid var(--site-navy)" }}>
            <strong style={{ color: "var(--site-navy)" }}>Phase 1 — Punong Barangay Mediation (Days 1–15):</strong>
            <div style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              Complainant files docket. Lupon Secretary issues KP Form 7 (Notice of Hearing) and summons respondent within 3 business days. The 15-day statutory conciliation countdown timer starts.
            </div>
          </div>
          <div style={{ padding: "1rem 1.25rem", borderRadius: "8px", background: "#fff", borderTop: "1px solid var(--site-line)", borderRight: "1px solid var(--site-line)", borderBottom: "1px solid var(--site-line)", borderLeft: "4px solid var(--site-gold)" }}>
            <strong style={{ color: "#a97400" }}>Phase 2 — Pangkat Tagapagkasundo (Days 16–30):</strong>
            <div style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              If mediation fails before the Punong Barangay, a 3-member Pangkat panel is chosen by the parties. Conciliation hearings continue for an additional 15 calendar days.
            </div>
          </div>
          <div style={{ padding: "1rem 1.25rem", borderRadius: "8px", background: "#fff", borderTop: "1px solid var(--site-line)", borderRight: "1px solid var(--site-line)", borderBottom: "1px solid var(--site-line)", borderLeft: "4px solid var(--site-red)" }}>
            <strong style={{ color: "var(--site-red)" }}>Phase 3 — Settlement or Certificate to File Action (CFA):</strong>
            <div style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              If settled, execute KP Form 16 (Amicable Settlement), which attains the legal force of a court judgment after 10 days. If conciliation fails, issue KP Form 20 (Certificate to File Action / CFA) allowing court filing.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-finance",
    category: "Financial Administration",
    title: "7. SOP-04: Treasury, E-Wallet & COA Maker-Checker Controls",
    badge: "COA & BSP Rail",
    summary: "Dual-entry accounting ledger, BigInt centavo currency precision, BSP-regulated EMI e-wallet disbursements, and ayuda protection.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          Governed by <strong>ADR 0003</strong> and COA Circulars, the financial engine enforces double-entry posting between the barangay e-wallet
          and the accounting General Ledger. CBMS integrates with BSP-licensed EMIs and never directly holds public funds.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>🔢 BigInt Centavos Precision</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              All wallet balances and transactions are stored as integer centavos (e.g. ₱500.00 = 50000n). Floating-point math is strictly forbidden.
            </div>
          </div>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>⚖️ Structural Maker-Checker</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Barangay Treasurer creates disbursement batches (honoraria, ayuda, supplier vouchers). Punong Barangay must approve. The system strictly rejects self-approval.
            </div>
          </div>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>🛡️ Zero-Deduction Ayuda Rule</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Government financial relief is legally protected: <code>feeCentavos = 0n</code> and cash-out charges are waived. No transaction fee may diminish beneficiary aid.
            </div>
          </div>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>💵 Over-The-Counter (OTC) Fallback</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Recipients without smartphones or unbanked residents automatically generate an OTC claim voucher, ensuring no resident is excluded from financial aid.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-audit",
    category: "System Administration",
    title: "8. SOP-05: IT Officer Audit Logs, Security & CRUD Controls",
    badge: "Security Ops",
    summary: "Independent audit monitoring, transaction trail verification, and granular user CRUD permission controls.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          The <strong>IT Officer / Systems Auditor</strong> operates independently to ensure platform integrity and compliance with statutory audit rules. Every creation, edit, deletion, or login is recorded in an immutable audit ledger.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>🔍 Real-time Transaction Auditing</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Continuous inspection of clearance volumes, certificate approvals, off-hour logins, and data exports to prevent unauthorized changes.
            </div>
          </div>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>🎛️ Granular CRUD Authorization</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Dedicated operational controls allow IT Officers to toggle individual Create, Read, Update, and Delete rights per operator without deleting user accounts.
            </div>
          </div>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>🚨 Immediate Account Lockdown</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              In the event of staff credential loss or suspected intrusion, IT Officers can trigger instant account suspension, terminating active JWT sessions.
            </div>
          </div>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>💾 Encrypted Database Backups</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Daily automated PostgreSQL pg_dump exports at 02:00 PHT with AES-256 encryption, archived locally and replicated to secure LGU off-site storage.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-disaster",
    category: "Public Safety & DRRM",
    title: "9. SOP-06: Emergency SOS & Disaster Response (BDRIS)",
    badge: "SOP-06 (BDRIS)",
    summary: "Real-time emergency SOS panic ingestion, Tanod patrol dispatching, and evacuation headcount logistics.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          During typhoons, earthquakes, fires, or medical crises, the Barangay Disaster Risk Reduction and Management Committee (BDRRMC)
          and Barangay Tanod desk coordinate through the SOS dispatch console.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ padding: "1rem", borderRadius: "8px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)" }}>1. Panic Alert Ingestion:</strong> Resident triggers panic alert via resident app. GPS pin coordinates, household emergency roster, and medical flags display on the Tanod command dashboard.
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)" }}>2. First Responder Dispatch:</strong> Desk operator dispatches nearest mobile patrol or barangay ambulance, logging status as Dispatched with team leader contact details.
          </div>
          <div style={{ padding: "1rem", borderRadius: "8px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)" }}>3. Evacuation Shelter Logistics:</strong> Evacuees arriving at registered evacuation shelters (gymnasiums, schools) are scanned in, dynamically tallying food pack relief needs.
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "faq-troubleshooting",
    category: "Troubleshooting & Support",
    title: "10. FAQ, Offline Operation & Troubleshooting",
    badge: "Help & FAQ",
    summary: "Connectivity loss, offline PWA synchronization, official clearance letterhead configuration, and citizen support.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "14px" }}>
        <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
          <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Q: What happens if the barangay hall loses internet connectivity?</div>
          <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
            The CBMS operates with Progressive Web App (PWA) offline caching. Staff can continue viewing cached inhabitant records and drafting entries in local IndexedDB. Data syncs automatically once connectivity resumes.
          </div>
        </div>
        <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
          <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Q: How do citizens verify whether a clearance is authentic?</div>
          <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
            Anyone (employers, DFA, banks) can scan the QR code printed on the physical clearance or enter the 12-character document serial code at the <Link href="/portal/verify" style={{ color: "var(--site-navy)", fontWeight: 700 }}>Portal Verification Page</Link>. In compliance with RA 10173, only the holder's initials and issue date are displayed.
          </div>
        </div>
        <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
          <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Q: An operator's account has been locked. How is it recovered?</div>
          <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
            Only the <strong>IT Officer</strong> or <strong>Punong Barangay</strong> can unlock an account. In the Admin Console under <em>Audit Log &gt; User CRUD & Security</em>, locate the operator and select <em>"Unlock Account"</em>. The operator will be required to change their password on next sign-in.
          </div>
        </div>
      </div>
    ),
  },
];

export default function OperationalGuidePage() {
  const [activeSectionId, setActiveSectionId] = React.useState("overview");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredSections = React.useMemo(() => {
    if (!searchQuery.trim()) return GUIDE_SECTIONS;
    const q = searchQuery.toLowerCase();
    return GUIDE_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeSection = GUIDE_SECTIONS.find((s) => s.id === activeSectionId) || GUIDE_SECTIONS[0];

  return (
    <div className="site-page">
      <SiteHeader />

      <main id="main" className="site-body">
        {/* Header Hero Banner */}
        <section className="site-hero" style={{ padding: "36px 0 32px" }}>
          <div className="site-wrap">
            <span className="site-hero__eyebrow">Official Governance & Operations Manual</span>
            <h1 className="site-hero__title" style={{ fontSize: "28px", margin: "6px 0 10px" }}>
              Barangay Operations Manual & Guide
            </h1>
            <p className="site-hero__sub" style={{ maxWidth: "75ch", fontSize: "14.5px" }}>
              Standard operating procedures (SOPs), statutory conciliation timelines, DILG MC 2020-117 (BPS DCF No. 1), DILG MC 2025-104 (BIMS Companion), COA financial controls, and Data Privacy Act protocols.
            </p>
            <div className="site-hero__meta" style={{ marginTop: "16px" }}>
              <span>📖 Version 2026.1</span>
              <span>📋 DILG MC 2020-117 & MC 2025-104</span>
              <span>🏛️ RA 7160 & RA 6975 Compliant</span>
              <span>🔒 RA 10173 & COA Governed</span>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="site-section" style={{ background: "var(--site-bg)" }}>
          <div className="site-wrap">
            {/* Search and Action Bar */}
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginBottom: "24px" }}>
              <div style={{ position: "relative", flex: 1, minWidth: "280px", maxWidth: "540px" }}>
                <input
                  type="text"
                  className="site-verify__input"
                  style={{ height: "42px", fontSize: "13.5px", paddingLeft: "38px", textTransform: "none", letterSpacing: "normal" }}
                  placeholder="Search procedures, DILG circulars, legal codes, roles, or fiscal rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--site-muted)" }}>
                  🔍
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="site-nav__link"
                  style={{ background: "#fff", border: "1px solid var(--site-line)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  🖨️ Print / Save PDF
                </button>
                <Link
                  href="/login"
                  className="site-nav__link site-nav__link--cta"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  🔐 Staff Console
                </Link>
              </div>
            </div>

            {/* Split View: Table of Contents & Active Section */}
            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px", alignItems: "start" }}>
              {/* Left TOC Navigation */}
              <div style={{ background: "#fff", border: "1px solid var(--site-line)", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(10,36,99,0.04)" }}>
                <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--site-muted)", paddingBottom: "10px", borderBottom: "1px solid var(--site-line)", marginBottom: "10px" }}>
                  Operations Manual Chapters ({filteredSections.length})
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                          gap: "3px",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          borderTop: isSelected ? "1.5px solid var(--site-navy)" : "1px solid transparent",
                          borderRight: isSelected ? "1.5px solid var(--site-navy)" : "1px solid transparent",
                          borderBottom: isSelected ? "1.5px solid var(--site-navy)" : "1px solid transparent",
                          borderLeft: isSelected ? "4px solid var(--site-gold)" : "1px solid transparent",
                          background: isSelected ? "rgba(10, 36, 99, 0.05)" : "transparent",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: isSelected ? "var(--site-navy)" : "var(--site-muted)" }}>
                            {sec.category}
                          </span>
                          <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 7px", borderRadius: "999px", background: isSelected ? "var(--site-navy)" : "#eef3fc", color: isSelected ? "#fff" : "var(--site-navy)" }}>
                            {sec.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: "13.5px", fontWeight: isSelected ? 800 : 500, color: isSelected ? "var(--site-navy)" : "var(--site-ink)" }}>
                          {sec.title}
                        </div>
                      </button>
                    );
                  })}
                  {filteredSections.length === 0 && (
                    <div style={{ padding: "18px 10px", textAlign: "center", color: "var(--site-muted)", fontSize: "13px" }}>
                      No topics matched "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>

              {/* Right Content Viewer */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ background: "#fff", border: "1px solid var(--site-line)", borderRadius: "12px", padding: "28px", boxShadow: "0 2px 10px rgba(10,36,99,0.04)" }}>
                  <div style={{ paddingBottom: "16px", borderBottom: "1px solid var(--site-line)", marginBottom: "22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", padding: "3px 9px", borderRadius: "999px", background: "#eef3fc", color: "var(--site-navy)" }}>
                        {activeSection.category}
                      </span>
                      <span style={{ fontSize: "11.5px", fontWeight: 700, padding: "3px 9px", borderRadius: "999px", background: "#fff6e0", color: "#8a5a00" }}>
                        {activeSection.badge}
                      </span>
                    </div>
                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--site-navy)", margin: "0 0 6px" }}>
                      {activeSection.title}
                    </h2>
                    <p style={{ margin: 0, color: "var(--site-muted)", fontSize: "14px", lineHeight: 1.5 }}>
                      {activeSection.summary}
                    </p>
                  </div>

                  <div>{activeSection.content}</div>
                </div>

                {/* Next / Previous Navigation */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {(() => {
                    const currIdx = GUIDE_SECTIONS.findIndex((s) => s.id === activeSection.id);
                    const prev = currIdx > 0 ? GUIDE_SECTIONS[currIdx - 1] : null;
                    const next = currIdx < GUIDE_SECTIONS.length - 1 ? GUIDE_SECTIONS[currIdx + 1] : null;

                    return (
                      <>
                        {prev ? (
                          <button
                            type="button"
                            onClick={() => setActiveSectionId(prev.id)}
                            className="site-nav__link"
                            style={{ background: "#fff", border: "1px solid var(--site-line)", cursor: "pointer" }}
                          >
                            ← Previous: {prev.title.split(":")[0]}
                          </button>
                        ) : <div />}

                        {next ? (
                          <button
                            type="button"
                            onClick={() => setActiveSectionId(next.id)}
                            className="site-nav__link site-nav__link--cta"
                            style={{ cursor: "pointer" }}
                          >
                            Next: {next.title.split(":")[0]} →
                          </button>
                        ) : <div />}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
