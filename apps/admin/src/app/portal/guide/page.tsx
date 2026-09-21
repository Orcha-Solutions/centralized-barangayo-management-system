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
  plainSummary: string;
  content: React.ReactNode;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "overview",
    category: "1. Overview",
    title: "What is CBMS & Why Does Our Barangay Need It?",
    badge: "Big Picture",
    summary: "A friendly explanation of the Centralized Barangay Management System, DILG rules, and how it protects barangay records.",
    plainSummary: "Think of CBMS as the barangay's digital notebook, cash register, and bulletin board all in one safe place.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7", color: "var(--site-ink)" }}>
        {/* Plain Language Callout */}
        <div style={{ padding: "1.1rem 1.25rem", borderRadius: "10px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", color: "#166534" }}>
          <div style={{ fontWeight: 800, fontSize: "15px", marginBottom: "4px" }}>💡 Simple Explanation (In Plain English & Tagalog)</div>
          <div>
            Before this system, barangay halls used thick paper logbooks, folders in filing cabinets, and manual receipts. If papers get wet in a flood, eaten by termites, or lost when new officials get elected, the barangay loses everything.
            <br />
            <strong>CBMS is your official digital assistant:</strong> it remembers every resident, prints certificates with anti-fake QR codes, tracks community disputes step-by-step, and records every peso transparently.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff", boxShadow: "0 2px 8px rgba(10,36,99,0.04)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px", fontSize: "15px" }}>🏛️ Official DILG Rules (MC 2025-104)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              The government created <strong>LGUSS-BIMS</strong> as the national filing cabinet. CBMS works like a friendly front desk companion—it lets citizens apply online without replacing DILG records.
            </div>
          </div>
          <div style={{ padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff", boxShadow: "0 2px 8px rgba(10,36,99,0.04)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px", fontSize: "15px" }}>🔒 Resident Privacy (RA 10173)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Neighbor information is kept confidential. Sensitive cases (like domestic issues or abuse) are locked so only the Captain and VAW Desk Officer can see them.
            </div>
          </div>
          <div style={{ padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff", boxShadow: "0 2px 8px rgba(10,36,99,0.04)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px", fontSize: "15px" }}>⚡ Fast Clearances (RA 11032)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              No more waiting for days. Inhabitants can apply for certificates and pick them up or download them within 1 to 3 days, complete with tamper-proof QR stamps.
            </div>
          </div>
          <div style={{ padding: "1.25rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff", boxShadow: "0 2px 8px rgba(10,36,99,0.04)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "6px", fontSize: "15px" }}>🤝 3-Year Election Turnover Protection</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Whenever new barangay officials take over after elections, all records, ongoing cases, and budgets remain neatly organized and ready on Day 1.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "roles",
    category: "2. People & Jobs",
    title: "Who Does What? (Barangay Staff Roles Made Easy)",
    badge: "Who's In Charge",
    summary: "Clear guide showing what each barangay official and volunteer can click, view, and approve on the computer.",
    plainSummary: "Every staff member has their own key. A Tanod cannot change budgets, and a Treasurer cannot settle court cases.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14px" }}>
        <p style={{ color: "var(--site-ink)", lineHeight: 1.6 }}>
          Just like physical keys in the barangay hall, the computer gives each staff member access only to the files they need for their specific job.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>🏛️</span>
              <div>
                <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>Punong Barangay (Captain)</strong>
                <div style={{ fontSize: "11px", color: "var(--site-muted)" }}>The Chief Executive & Approver</div>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              • Gives the final signature on clearances and permits.<br />
              • Signs off on money releases prepared by the Treasurer.<br />
              • Mediates community disputes during the first 15 days.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>📝</span>
              <div>
                <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>Barangay Secretary</strong>
                <div style={{ fontSize: "11px", color: "var(--site-muted)" }}>The Chief Clerk & Record Keeper</div>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              • Encodes new residents and families into the system.<br />
              • Prepares certificates for the Captain to sign.<br />
              • Fills out DILG master forms (like the BPS Profile DCF 1).
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>🏦</span>
              <div>
                <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>Barangay Treasurer</strong>
                <div style={{ fontSize: "11px", color: "var(--site-muted)" }}>The Money & Funds Custodian</div>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              • Collects certificate fees and gives Official Receipts (OR).<br />
              • Prepares payroll and ayuda lists for the Captain to approve.<br />
              • <em>Rule:</em> Cannot approve their own vouchers (prevents fraud).
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>💻</span>
              <div>
                <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>IT Officer / Systems Auditor</strong>
                <div style={{ fontSize: "11px", color: "var(--site-muted)" }}>The Security & Computer Guard</div>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              • Checks who logged in, who printed papers, and who changed data.<br />
              • Can lock user buttons (Create, Read, Edit, Delete) if mistakes happen.<br />
              • Locks down stolen or compromised passwords immediately.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>⚖️</span>
              <div>
                <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>Lupon Secretary</strong>
                <div style={{ fontSize: "11px", color: "var(--site-muted)" }}>Community Peace & Mediation</div>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              • Logs neighbor arguments and formal complaints.<br />
              • Prints summons and hearing schedules.<br />
              • Watches the statutory 15-day mediation countdown clock.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>🛡️</span>
              <div>
                <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>VAW Desk Officer</strong>
                <div style={{ fontSize: "11px", color: "var(--site-muted)" }}>Women & Children Protector</div>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              • Secret, locked section for domestic violence and child cases.<br />
              • Other staff members cannot open or search these sensitive cases.<br />
              • Helps victims request Barangay Protection Orders (BPO).
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>🚨</span>
              <div>
                <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>Barangay Tanod</strong>
                <div style={{ fontSize: "11px", color: "var(--site-muted)" }}>Field Watch & First Responders</div>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              • Receives emergency SOS panics sent by residents.<br />
              • Logs blotter incidents reported at night.<br />
              • Counts evacuees at gyms/schools during floods or typhoons.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "20px" }}>👥</span>
              <div>
                <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>Residents (The Citizens)</strong>
                <div style={{ fontSize: "11px", color: "var(--site-muted)" }}>Our Community Members</div>
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              • Can request clearances online anytime from their phone.<br />
              • Report broken streetlights, trash, or loud noise.<br />
              • Check whether their certificate is authentic in seconds.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "bps-dcf1",
    category: "3. Government Forms",
    title: "How to Fill the DILG Master Profile (BPS DCF No. 1)",
    badge: "DILG Guide",
    summary: "Simple step-by-step instructions for filling out the annual DILG Barangay Profile under Circular 2020-117.",
    plainSummary: "The DILG requires every barangay to answer a standard 6-part questionnaire. Here is how CBMS makes it effortless.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          Every year, the DILG asks each barangay to submit <strong>Form No. 1 (BPS DCF 1)</strong>. Instead of counting by hand on scratch paper, CBMS calculates the numbers automatically from what you encode every day!
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>📍 Part 1: Land & Location</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              Write the barangay's total land area in hectares. Select whether your barangay is upland, lowland, coastal (near the sea), or inland. Choose your main livelihood (farming, fishing, stores, or factories).
            </p>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>🏛️ Part 2: Officials & Committees</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              The system automatically lists your Captain, Kagawads, SK officials, Tanods, and Health Workers. It also checks if your Peace & Order Council (BPOC) and Anti-Drug Council (BADAC) are active.
            </p>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>💰 Part 3: Income & Budget (Q1 Update)</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              The Treasurer enters the IRA / National Tax Allotment and local tax earnings. The computer automatically calculates the 10% share that goes to the youth (SK Fund).
            </p>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>👨‍👩‍👧‍👦 Part 4: Population Counts (Every 6 Months)</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              Submitted twice a year (July and January). Tells how many babies, children, adults, and seniors live in the barangay, plus counts for Solo Parents, PWDs, and 4Ps families.
            </p>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>🏢 Part 5: Buildings, Vehicles & Assets</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              List your barangay hall, health center, patrol multicabs, ambulances, computers, and disaster gear (sirens, rubber boats, flashlights, and emergency radios).
            </p>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)", fontSize: "14.5px" }}>🏆 Part 6: Awards & Sign-Off</strong>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              Write any awards received from the city or national government. The Secretary and Treasurer sign the form, the Captain certifies it, and the DILG Officer (LGOO) approves it!
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-inhabitants",
    category: "4. Step-by-Step Guides",
    title: "Guide 1: Registering Residents (RBI) Without Errors",
    badge: "Step 1 of 6",
    summary: "How to add new residents, take proof of identity, ask for privacy consent, and tag special groups like seniors and PWDs.",
    plainSummary: "Encode a resident once, and their name is instantly available for clearances, medical aid, and emergency relief.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          The <strong>Registry of Barangay Inhabitants (RBI)</strong> is the official master list of everyone who lives in your barangay. Here is the simple 4-step routine:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ display: "flex", gap: "1rem", padding: "1rem", border: "1px solid var(--site-line)", borderRadius: "8px", background: "#fff" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--site-navy)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 }}>1</div>
            <div>
              <strong style={{ color: "var(--site-navy)" }}>Ask for a Valid ID:</strong>
              <div style={{ fontSize: "13px", color: "var(--site-muted)", marginTop: "2px" }}>
                Ask the resident for their PhilSys National ID, Voter's Certification, or Postal ID. Check if they really live at the barangay address.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", padding: "1rem", border: "1px solid var(--site-line)", borderRadius: "8px", background: "#fff" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--site-navy)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 }}>2</div>
            <div>
              <strong style={{ color: "var(--site-navy)" }}>Ask for Privacy Consent (DPA):</strong>
              <div style={{ fontSize: "13px", color: "var(--site-muted)", marginTop: "2px" }}>
                Explain: <em>"We will keep your personal information safe and will not give it to private companies."</em> Check the <strong>"Consent Recorded"</strong> box on the screen.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", padding: "1rem", border: "1px solid var(--site-line)", borderRadius: "8px", background: "#fff" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--site-navy)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 }}>3</div>
            <div>
              <strong style={{ color: "var(--site-navy)" }}>Check Sector Tags (Seniors, PWD, Solo Parents):</strong>
              <div style={{ fontSize: "13px", color: "var(--site-muted)", marginTop: "2px" }}>
                If the resident is 60+ years old, has a disability, is a solo parent, or belongs to 4Ps, click the tag! During a typhoon or relief distribution, this helps you find vulnerable families first.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", padding: "1rem", border: "1px solid var(--site-line)", borderRadius: "8px", background: "#fff" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--site-navy)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 }}>4</div>
            <div>
              <strong style={{ color: "var(--site-navy)" }}>Link to Family & Purok:</strong>
              <div style={{ fontSize: "13px", color: "var(--site-muted)", marginTop: "2px" }}>
                Choose which family/household they belong to and select their Purok or Sitio. Click <strong>Save Profile</strong>. Finished!
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-issuance",
    category: "4. Step-by-Step Guides",
    title: "Guide 2: Issuing Barangay Clearances & Anti-Fake QR Codes",
    badge: "Step 2 of 6",
    summary: "How to process clearance requests, check if someone has pending blotter cases, collect official fees, and print documents.",
    plainSummary: "Never issue a fake clearance. Every paper gets a unique QR code that employers and banks can scan with their phone camera.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          Barangay Clearances, Certificates of Residency, and Indigency Certifications are the most common services requested by residents.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Step 1: Check the Purpose</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Ask the applicant what the certificate is for (e.g. Job Application, Postal ID, Bank Account). First-time jobseekers (under RA 11261) get their clearance completely <strong>FREE</strong>!
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Step 2: Check for Complaints</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              The computer automatically checks if the person has an active un-settled blotter or court case. If clear, you can proceed immediately.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Step 3: Collect Fee & Give OR</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              The resident pays the official fee (or pays using e-wallet). The Treasurer issues an Official Receipt (OR) number. No hidden extra charges!
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>Step 4: Captain Signs & QR Prints</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              The Captain signs. The system prints a dynamic square QR code on the paper. Anyone can scan it to prove the certificate is real!
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-kp",
    category: "4. Step-by-Step Guides",
    title: "Guide 3: Settling Neighbor Disputes (Katarungang Pambarangay)",
    badge: "Step 3 of 6",
    summary: "How to handle neighbor arguments, formal complaints, summons, the 15-day deadline clock, and settlement agreements.",
    plainSummary: "Resolve disputes peacefully inside the barangay. If 15 days pass without agreement, a 3-person panel steps in.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          The <strong>Katarungang Pambarangay (KP)</strong> is our community peacemaking court. It saves neighbors from expensive court fees by helping them reconcile peacefully.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ padding: "1rem 1.25rem", borderRadius: "8px", background: "#fff", borderTop: "1px solid var(--site-line)", borderRight: "1px solid var(--site-line)", borderBottom: "1px solid var(--site-line)", borderLeft: "4px solid var(--site-navy)" }}>
            <strong style={{ color: "var(--site-navy)" }}>Phase 1 — Captain Mediation (Days 1 to 15):</strong>
            <div style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              A resident files a complaint. The Lupon Secretary enters the names and prints <strong>KP Form 7 (Notice of Hearing)</strong>. The Tanod gives summons to the other party. The Captain talks to both sides within 15 calendar days to find a friendly compromise.
            </div>
          </div>

          <div style={{ padding: "1rem 1.25rem", borderRadius: "8px", background: "#fff", borderTop: "1px solid var(--site-line)", borderRight: "1px solid var(--site-line)", borderBottom: "1px solid var(--site-line)", borderLeft: "4px solid var(--site-gold)" }}>
            <strong style={{ color: "#a97400" }}>Phase 2 — Pangkat Conciliation Panel (Days 16 to 30):</strong>
            <div style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              If the Captain cannot convince both sides, 3 trusted Lupon members (called the <em>Pangkat Tagapagkasundo</em>) are chosen by the parties to try settling the issue for another 15 days.
            </div>
          </div>

          <div style={{ padding: "1rem 1.25rem", borderRadius: "8px", background: "#fff", borderTop: "1px solid var(--site-line)", borderRight: "1px solid var(--site-line)", borderBottom: "1px solid var(--site-line)", borderLeft: "4px solid var(--site-red)" }}>
            <strong style={{ color: "var(--site-red)" }}>Phase 3 — Agreement or Endorsement to Court (CFA):</strong>
            <div style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--site-muted)" }}>
              • <strong>If settled:</strong> Both sides sign <strong>KP Form 16 (Amicable Settlement)</strong>. After 10 days, this agreement has the full force of a judge's ruling!<br />
              • <strong>If mediation fails:</strong> The Lupon issues <strong>KP Form 20 (Certificate to File Action / CFA)</strong> so the complainant can take the case to the Municipal Trial Court.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-finance",
    category: "4. Step-by-Step Guides",
    title: "Guide 4: Handling Barangay Money & Ayuda Releases",
    badge: "Step 4 of 6",
    summary: "How the Treasurer and Captain handle honoraria, cash releases, and digital ayuda without errors or fraud.",
    plainSummary: "Two people must always agree before money moves: Treasurer prepares, Captain approves. No cuts or fees are ever taken from ayuda.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          Managing public barangay funds requires strict accounting rules under the Commission on Audit (COA). CBMS enforces structural safeguards:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>👥 The 2-Person Rule (Maker-Checker)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              The Treasurer creates the list of recipients and amounts (the "Maker"). The Captain must inspect and approve it (the "Checker"). A Treasurer cannot approve their own release.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>💯 Exact to the Last Centavo</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              The system calculates money in exact integer centavos (₱500.00 is computed as 50,000 centavos). There is zero rounding error and zero missing pennies.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>🛡️ 100% Free Ayuda (No Deductions)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              When releasing government emergency aid, the transaction fee is strictly <strong>₱0.00</strong>. It is illegal for any transfer fee to reduce the resident's cash assistance.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>💵 Cash Always Works (OTC Fallback)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              If an elderly resident does not have a smartphone or e-wallet, the system automatically prints an Over-The-Counter voucher so they can receive physical cash at the counter.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-audit",
    category: "4. Step-by-Step Guides",
    title: "Guide 5: IT Security & Disabling User Buttons",
    badge: "Step 5 of 6",
    summary: "How the IT Officer watches activity logs, disables Create/Read/Update/Delete buttons, and locks down accounts.",
    plainSummary: "Like a digital security guard, the IT Officer can turn off buttons for operators who make mistakes without deleting their account.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          The <strong>IT Officer / Systems Auditor</strong> ensures that no unauthorized changes occur in barangay records.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>📜 The Audit Trail (Digital Black Box)</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Every click, print, edit, and login is stamped with the staff name, exact time, and terminal IP. Nobody can delete records secretly without leaving a permanent record.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>🎛️ Individual CRUD Buttons</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              If an intern or encoding clerk accidentally alters certificates, the IT Officer can turn off their <strong>Update</strong> or <strong>Delete</strong> button while letting them keep reading.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>🚨 Immediate Account Freeze</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              If a staff member loses their phone or laptop, the IT Officer clicks <strong>Lock Account</strong> immediately. This kicks out the user from all sessions right away.
            </div>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: "10px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>💾 Daily 2:00 AM Automatic Backup</div>
            <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
              Every night at 2:00 AM, the computer creates an encrypted backup copy of all data and saves it safely in off-site storage.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sop-disaster",
    category: "4. Step-by-Step Guides",
    title: "Guide 6: Disaster Emergencies & Resident SOS Alarms",
    badge: "Step 6 of 6",
    summary: "How to respond to resident SOS panics, dispatch Tanods on patrol, and count evacuees during floods or fires.",
    plainSummary: "When a resident presses panic on their phone, Tanods see their location and medical flags on screen immediately.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "14.5px", lineHeight: "1.7" }}>
        <p>
          During typhoons, flooding, fires, or medical crises, the Tanod desk and Disaster Committee (BDRRMC) use the live dispatch dashboard:
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div style={{ padding: "1rem", borderRadius: "8px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)" }}>1. Alarm Rings at the Desk:</strong>
            <div style={{ fontSize: "13px", color: "var(--site-muted)", marginTop: "2px" }}>
              A resident taps the red SOS button. The Tanod computer beeps loudly and displays their exact map location, household members, and emergency phone numbers.
            </div>
          </div>

          <div style={{ padding: "1rem", borderRadius: "8px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)" }}>2. Send Tanod or Ambulance:</strong>
            <div style={{ fontSize: "13px", color: "var(--site-muted)", marginTop: "2px" }}>
              The desk operator calls the nearest patrol team on two-way radio. The operator marks the alert status as <strong>"Dispatched"</strong> and writes the team leader's name.
            </div>
          </div>

          <div style={{ padding: "1rem", borderRadius: "8px", background: "#fff", border: "1px solid var(--site-line)" }}>
            <strong style={{ color: "var(--site-navy)" }}>3. Evacuation Center Headcount:</strong>
            <div style={{ fontSize: "13px", color: "var(--site-muted)", marginTop: "2px" }}>
              When families arrive at the school or gym, staff scan their digital ID. The system instantly counts how many relief food packs are needed for children, adults, and seniors!
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "faq-troubleshooting",
    category: "5. Help & FAQ",
    title: "Frequently Asked Questions & Quick Troubleshooting",
    badge: "Simple Fixes",
    summary: "Plain-language answers for lost internet, forgotten passwords, mobile use, and printing clearance seals.",
    plainSummary: "Got stuck? Here are easy answers to the most common daily barangay computer questions.",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "14px" }}>
        <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
          <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>❓ What should we do if our internet connection goes down?</div>
          <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
            <strong>Don't panic!</strong> The system works offline as a Progressive Web App (PWA). You can still view resident profiles and draft certificates on your computer. When the internet comes back, the computer syncs your work automatically.
          </div>
        </div>

        <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
          <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>❓ How can an employer or bank verify if a clearance is genuine?</div>
          <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
            They can point their smartphone camera at the square QR code printed at the bottom of the clearance, or type the 12-letter code on the <Link href="/portal/verify" style={{ color: "var(--site-navy)", fontWeight: 700 }}>Verification Page</Link>. The screen will confirm if it is authentic while protecting the resident's private full name.
          </div>
        </div>

        <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
          <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>❓ A staff member forgot their password or their account is locked. How to fix?</div>
          <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
            Ask the <strong>IT Officer</strong> or the <strong>Captain</strong>. They can open <em>Audit Log &gt; User CRUD & Security</em> and click <strong>"Unlock Account"</strong>. The staff member will be prompted to pick a new secure password.
          </div>
        </div>

        <div style={{ padding: "1.1rem", borderRadius: "10px", border: "1px solid var(--site-line)", background: "#fff" }}>
          <div style={{ fontWeight: 800, color: "var(--site-navy)", marginBottom: "4px" }}>❓ Can residents use this on cheap Android phones?</div>
          <div style={{ fontSize: "13px", color: "var(--site-muted)" }}>
            <strong>Yes, absolutely.</strong> The Resident Portal works on any basic smartphone or tablet browser without needing expensive downloads from the App Store. It also supports Tagalog and English!
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
        s.summary.toLowerCase().includes(q) ||
        s.plainSummary.toLowerCase().includes(q)
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
            <span className="site-hero__eyebrow">Plain-Language Operations Guide</span>
            <h1 className="site-hero__title" style={{ fontSize: "28px", margin: "6px 0 10px" }}>
              Barangay Operations Manual & Guide
            </h1>
            <p className="site-hero__sub" style={{ maxWidth: "75ch", fontSize: "14.5px" }}>
              A straightforward, easy-to-read guide for Barangay Captains, Secretaries, Treasurers, Tanods, and Lupon members. Explains daily procedures, DILG requirements, resident privacy, and money rules without complicated computer jargon.
            </p>
            <div className="site-hero__meta" style={{ marginTop: "16px" }}>
              <span>📖 Version 2026.1 (Easy Read)</span>
              <span>📋 DILG MC 2020-117 & MC 2025-104</span>
              <span>🏛️ Local Government Code (RA 7160)</span>
              <span>🔒 Data Privacy (RA 10173)</span>
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
                  placeholder="Search in plain words (e.g. clearance, dispute, money, flood, role)..."
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
                  Guide Chapters ({filteredSections.length})
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
                    <p style={{ margin: "0 0 10px", color: "var(--site-muted)", fontSize: "14px", lineHeight: 1.5 }}>
                      {activeSection.summary}
                    </p>
                    <div style={{ padding: "8px 12px", borderRadius: "6px", background: "#f8fafc", border: "1px dashed var(--site-line)", fontSize: "13px", color: "#475569" }}>
                      <strong>Summary in plain words:</strong> {activeSection.plainSummary}
                    </div>
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
