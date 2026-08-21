# Build Prompt: Centralized Barangay Management System (CBMS) — Full Ecosystem

> **How to use this file:** paste it (or point the agent at it) as the primary instruction for a Claude Opus 4.8 coding agent working in this repository. It is self-contained: context, architecture, every module, data model, security rules, build phases, and acceptance criteria. Work through the phases in order; each phase has a definition of done.

---

## 1. Mission

Build the complete **Centralized Barangay Management System (CBMS)** ecosystem: a multi-tenant platform that digitizes the operations of Philippine barangays (the smallest local government unit, ~42,000 nationwide) and adds three capabilities no existing government system provides — a **barangay e-wallet** (cashless disbursement & payments), an **AI agentic layer**, and a **resident-facing self-service app**.

### Context you must respect

- **DILG MC No. 2025-104** mandates all barangays to use the government's free, DILG-hosted **LGUSS-BIMS** as the official system of record (registration: bims-admin.dilg.gov.ph). Its sub-systems: **BIPS** (inhabitant profiling / Records of Barangay Inhabitants), **BCIS** (certifications), **KPISBH** (Katarungang Pambarangay + helpdesk, incl. VAWC/VAC), **BAMS** (assets/property), **BDRIS** (disaster resilience), **BGADPBMS** (GAD plan & budget), **BORIS** (ordinances/resolutions), **BDP** (development plan), **BBI** (barangay-based institutions), **BFMS** (financial *reporting* — not a payment rail), and a public **Barangay Website**.
- **DILG MC No. 2020-117** established the predecessor Barangay Information System (BIS) + Barangay Profile System, integrated into the DILG Intranet.
- BIMS has **no payments, no AI, and no resident self-service**. Residents never log into it. That is CBMS's whitespace.
- CBMS therefore runs in one of two modes per tenant (a runtime configuration, not a fork):
  - **`companion` mode (default):** BIMS is the system of record for the datasets it covers. CBMS mirrors/reads those datasets through a **BIMS Adapter** (see §6) under a data-sharing agreement, never overwrites them, and adds the whitespace capabilities on top.
  - **`standalone` mode:** for demos, pilots without a DILG interface yet, or non-mandated datasets — CBMS's own records are authoritative, with an export path shaped like BIMS forms so data can be handed over later.
- Every design decision must survive scrutiny under: **RA 10173** (Data Privacy Act), **RA 7160** (Local Government Code — KP timelines, §375 fund accountability, §394(d)(6) inhabitant records), **RA 11032** (Ease of Doing Business — turnaround times, Client Satisfaction Measurement), **COA** audit rules, and **BSP** e-money regulation (the wallet operates through a licensed EMI partner; we integrate, we never hold funds).

### Non-negotiable product principles

1. **Encode once.** A resident/household is captured once and reused everywhere. No module re-asks for what another module knows.
2. **BIMS is never overwritten** in companion mode. CBMS annotates, extends, transacts — the official record stays official.
3. **Consent is a first-class object.** Any use of inhabitant data outside the barangay's own operations requires a recorded, per-household consent artifact (who consented, when, to what, evidence attachment).
4. **Cash always works.** Every e-wallet flow has an over-the-counter fallback; government aid cash-out is free; no fee ever reduces ayuda.
5. **A human signs anything official.** AI drafts and routes; a named official approves. Every AI action lands in the same audit log as human actions.
6. **Offline is normal, not an edge case.** Barangay halls lose connectivity; the admin app must queue writes locally and sync.
7. **Filipino/Taglish first** in resident-facing UI copy (i18n scaffolding with `en` and `fil` locales from day one).

---

## 2. Ecosystem overview — the applications

Build a **monorepo** containing these deployable apps plus shared packages:

| App | Users | Form factor |
|---|---|---|
| **`apps/admin`** — Barangay Console | Punong Barangay, Secretary, Treasurer, Kagawad, SK, Lupon, VAW desk, BHW, staff | Web (desktop-first, offline-capable PWA) |
| **`apps/resident`** — Resident App | Residents | Mobile-first PWA (installable; works on low-end Android) |
| **`apps/hub`** — LGU/City Hub | City/municipal admins, provincial & DILG viewers | Web dashboard |
| **`apps/agent`** — Agent/Merchant App | Sari-sari cash-in/out agents, merchants | Mobile-first PWA |
| **`apps/website`** — Public Barangay Website | Anyone (no login) | SSR public site, one per barangay (subdomain or path) |
| **`apps/api`** — Core API | All of the above | Single modular-monolith API |
| **`packages/*`** | — | shared UI kit, types, db client, auth, i18n, BIMS adapter, payments adapter, AI orchestrator |

**Default tech stack** (use unless the repo owner overrides): TypeScript end-to-end; **Next.js** (App Router) for all web apps; **NestJS** (or Next API routes if you keep it simpler — pick one and stay consistent) for `apps/api`; **PostgreSQL + Prisma**; **pnpm + Turborepo**; **Zod** for validation shared client/server; **Auth**: email/phone + password with mandatory **TOTP/OTP MFA** for staff roles (architecture pluggable so Clerk/Supabase Auth can replace it); PWA offline via service worker + IndexedDB outbox; background jobs with a simple DB-backed queue; **Docker Compose** for local dev (postgres, mailhog, minio for file storage). Seed everything so `pnpm dev` + `pnpm seed` produces a fully-populated demo.

---

## 3. Multi-tenancy & the PSGC backbone

- Tenancy is keyed to the **PSGC** (Philippine Standard Geographic Code): Region → Province → City/Municipality → **Barangay**. Ship a `psgc` reference table with a realistic seed subset (at least 1 region, 2 provinces, 3 cities/municipalities, 12+ barangays; include Marikina City's 16 barangays as the demo city).
- Every domain row carries `barangay_id` (and derives `lgu_id`); enforce isolation with **row-level scoping in the data layer** (Prisma middleware / query guards) — a user's `lgu` scope is checked on every query (**ABAC by lgu affiliation**, mirroring BIMS §4.3.2).
- The **hub** app aggregates across a city/province; **DILG viewer** role sees only aggregated/anonymized stats, never raw PII.

---

## 4. Roles & RBAC matrix

Implement roles as data (seedable), with per-module permissions (`view / encode / approve / disburse / configure`):

| Role | Scope | Notes |
|---|---|---|
| System Admin | platform | provisioning, PSGC, feature flags |
| LGU Admin (Hub) | city/municipality | approves barangay onboarding, sees dashboards |
| Punong Barangay | barangay | approver of record: certificates, disbursements, ordinances |
| Barangay Secretary | barangay | primary encoder: inhabitants, issuances, KP intake, website content |
| Barangay Treasurer | barangay | fees, collections, disbursement batches, reconciliation |
| Sangguniang Barangay member (Kagawad) | barangay | ordinances/resolutions, committee views |
| SK Chair/Kagawad | barangay | SK program & budget views |
| Lupon Secretary | barangay | KP case management |
| VAW Desk Officer | barangay | VAWC cases — **extra-restricted visibility** (only this role + PB) |
| BHW / Health staff | barangay | health & social services module |
| Tanod / Responder | barangay | SOS dispatch, blotter intake |
| Resident | self + household | resident app only |
| Agent / Merchant | own outlet | agent app only |
| DILG Viewer | region/national | aggregates only |

MFA required for every staff role. All privileged actions produce immutable `audit_log` entries (actor, role, tenant, before/after hash, IP, timestamp).

---

## 5. Modules — build ALL of the following

Group A tracks BIMS parity (named to match DILG terminology so the mapping is obvious); Group B is the CBMS whitespace. Each module below lists its core entities and its definition of done (DoD). Every module gets: list + detail + create/edit screens patterned on the BIMS console (stat summary cards → filter/export/search bar → data table with status chips → row actions), seed data, API endpoints with Zod contracts, and at least smoke-level tests.

### Group A — Barangay operations (BIMS-parity, adapter-aware)

**A1. Inhabitant Profiling (BIPS / RBI)**
Households and inhabitants: PhilSys-ready profile (name, sex, birthdate, civil status, citizenship, occupation, education, sectoral flags — senior/PWD/solo parent/4Ps/IP), household composition & address (purok/sitio), residency history, migration in/out, death registry. "My Inhabitant Profile" self-view for residents. **This is the identity backbone every other module references (`inhabitant_id`, `household_id`).**
*DoD:* dedupe check on create (name+birthdate fuzzy match); RBI export shaped like the BIMS Form B fields; per-household **consent record** management; profile completeness meter.

**A2. Issuance Management (BCIS)**
Certificate types: barangay clearance, certificate of residency, indigency, business clearance (LGC §152(c)), first-time jobseeker, good moral, and admin-definable templates. Workflow: request (staff-encoded or resident-submitted) → payment (wallet or OTC) → approval (PB) → issue **PDF with QR verification code** → public verify endpoint (`/verify/{code}` — no login, shows validity + issued-to initials only). Fee schedule per type with exemptions (e.g., first-time jobseeker free).
*DoD:* end-to-end request→pay→approve→download→verify demo path; OR-number series per barangay; issuance register export.

**A3. Katarungang Pambarangay & Blotter (KPISBH)**
Blotter/incident log; KP case lifecycle per RA 7160: complaint → mediation (PB, 15 days) → conciliation (Pangkat, 15+15 days) → settlement / repudiation / **CFA (Certificate to File Action)**; hearing calendar & notices; Lupon roster; settlement documents. **Deadline engine** that computes statutory timelines and flags breaches. **VAWC/VAC track** with hard visibility restriction (VAW desk + PB only) and separate audit trail.
*DoD:* a seeded case that walks the full lifecycle; auto-generated KP forms (summons, notice of hearing, amicable settlement, CFA) as PDFs; deadline warnings on dashboard.

**A4. Property & Asset Management (BAMS)**
Replicate the BIMS Properties UX from the reference screenshots: stat cards (Total / Infrastructures / Non-infrastructures / Available-Operational), filterable, exportable table (Property, Type, Status: Operational · Under Construction · Unserviceable, Governance-area Category, Capacity, Updated, row actions), plus **Property Locations** (geo pin per asset) and acquisition/maintenance history, custodians (LGC §375 accountability), and inventory counts for **Materials** (consumables) as a sibling submodule.
*DoD:* the two screenshot screens reproduced (cards + table + filters + export CSV); map view of property locations.

**A5. Disaster Resilience (BDRIS)**
Hazard & risk profile per purok; evacuation centers (linked to A4 assets w/ capacity); vulnerable-inhabitant registry (derived from A1 sectoral flags — bedridden, PWD, seniors living alone); BDRRMC composition; pre-disaster checklist; **event mode**: declare an event → evacuation tracking (family check-in/out at centers) → relief distribution log (who received what, when — deduped against A1) → post-event reports.
*DoD:* simulate a typhoon event end-to-end with 3 evacuation centers and relief distribution to 50+ seeded households.

**A6. GAD Plan & Budget (BGADPBMS)**
Annual GAD plan: programs/projects/activities with GAD budget (≥5% of barangay budget check), attribution categories, target vs. accomplished, quarterly progress reporting, and the GAD accomplishment report export.
*DoD:* one seeded plan-year with budget checks and a quarterly report PDF.

**A7. Ordinances & Resolutions (BORIS)**
Legislative registry: ordinances, resolutions, executive orders — numbering, sponsors, readings/dates, status (draft/enacted/vetoed/amended/repealed), full-text attachment, relations (amends/repeals), and automatic publication of enacted items to the public website (A11).
*DoD:* searchable public registry; the ordinance adopting LGUSS-BIMS/CBMS usage seeded as an example.

**A8. Barangay Development Plan (BDP)**
Multi-year development plan: vision, priority projects with budgets & funding source, alignment tags (city/provincial plans), annual investment program, and per-project status tracking that feeds the transparency board (B3) and participatory budgeting (B3).
*DoD:* one seeded 3-year plan with 8+ projects at varying statuses.

**A9. Barangay-Based Institutions (BBI)**
Registry of institutions & organizations in the barangay (BDRRMC, BADAC, BCPC, Lupong Tagapamayapa, SK, women's/farmers'/youth orgs): officers, members (linked to A1), accreditation, meeting minutes, activity log.
*DoD:* seeded BBIs incl. Lupon (feeds A3) and BDRRMC (feeds A5).

**A10. Financial Management (BFMS-style) + Treasury**
Budget: annual appropriation ordinance (linked to A7) with COA-style expense classes; obligations & disbursement *records*; collections (fees from A2, rentals from A4); official receipt register; monthly/quarterly financial reports (Statement of Receipts & Expenditures) exportable in COA-aligned format; SK fund sub-ledger. **This module is the ledger; actual money movement is B1.** Every B1 wallet transaction auto-posts here (double-entry: fund, account, OR/DV reference).
*DoD:* trial-balance style report that ties to seeded B1 transactions to the peso.

**A11. Public Barangay Website + Content Management**
Per-barangay public site: officials page (from A9/A1), announcements, ordinances (A7), transparency board (budget from A10, projects from A8, fees & requirements from A2), contact & hotlines, event calendar. Content Management for banners/pages/posts. Custom branding (logo, colors) per barangay.
*DoD:* two visually distinct seeded barangay sites rendering live module data.

**A12. Report Management**
Report center: every export in one place, plus **NBOO-style periodic reports** (quarterly/annual statistical rollups of A1–A10 for the hub/DILG viewer), CSV/PDF outputs, and a saved-report scheduler.
*DoD:* quarterly rollup generated across the seeded city and visible in `apps/hub`.

**A13. Platform administration**
Mirroring the BIMS console sidebar: **PSGC Management** (reference data + barangay onboarding/approval flow: barangay registers → LGU admin approves, per MC 2025-104 §4.2.1), **Profile Management** (org profile, officials terms/turnover), **User Management** (invite, roles, MFA reset), **RBAC Management** (role/permission editor), **File Management** (uploads, storage quotas, virus-scan stub), **Institution Management** (links to A9 config), **Technical Support / Ticket Management** (in-app ticketing with status/escalation — the memo's Ticket Monitoring System), feature flags incl. per-tenant `companion|standalone` mode.
*DoD:* full onboarding demo: create barangay → approve → seed officials → users invited with MFA.

### Group B — CBMS whitespace (the differentiators)

**B1. Barangay E-Wallet (flagship)**
Build the full closed-loop wallet **against a mocked EMI provider** behind a clean `packages/payments` interface (`EmiProvider`: createWallet, kycUpgrade, transfer, disburseBatch, billPay, qrGenerate/qrPay, cashIn, cashOut, webhooks) — so a real BSP-licensed EMI (or GCash/Maya rails, QR Ph, InstaPay) can be plugged in later without touching product code.
- **Wallets & KYC tiers:** Tier-1 (one ID / PhilSys number, low limits) → Tier-2 (full KYC). Residents (linked to A1), officials, merchants, agents, and the **barangay treasury wallet** itself.
- **Disbursements (money out):** Treasurer builds a batch (payroll/honoraria from seeded rosters; ayuda from a beneficiary list snapshotted out of A1/A5 with consent), PB approves (maker-checker), batch executes,每 recipient notified; unclaimed → OTC fallback list. Fees charged to the *disbursing side*, never the beneficiary; ayuda cash-out free.
- **Collections (money in):** A2 certificate fees, A4 rentals, contributions — paid in-app or via agent; auto-posted to A10 with OR numbers.
- **Bills & merchant payments:** biller directory (mock aggregator), P2P transfers, merchant QR (static per stall) with 0% intro MDR configurable.
- **Agent network (CICO):** `apps/agent` — cash-in/out with commission split, float ledger, liquidity dashboard + low-float alerts keyed to the disbursement calendar.
- **Reconciliation:** every transaction double-posts to A10; daily recon report; immutable transaction log; dispute flow.
*DoD:* scripted demo: fund treasury → run a 60-person honoraria batch + 200-household ayuda batch → residents pay a certificate fee and a bill → merchant QR sale → agent cash-out → A10 report ties out; watchdog metric (cash-out-immediately ratio) on the hub dashboard.

**B2. AI Agentic Layer**
Build `packages/ai` as a provider-agnostic orchestrator (Anthropic API default — `claude-opus-4-8` for complex/agentic tasks, `claude-haiku-4-5` for high-volume triage; env-driven so OpenAI/Gemini are swappable). All AI features must: cite sources from tenant data, write to `audit_log`, respect RBAC (the AI sees only what the requesting user may see), and route anything official to a human approval step.
- **Resident assistant** (in `apps/resident`, chat UI): answers "how do I get a clearance?", checks status, pre-fills request forms; answers from the barangay's own fee/requirement/ordinance data with citations; Taglish-capable; falls back to a ticket (A13) when unsure.
- **Staff copilots** (in `apps/admin`): draft certificates & letters, summarize a blotter/KP case file, draft KP notices, generate report narratives (A12), explain a deadline breach.
- **Agentic workflow:** certificate request → verify against A1 → check blockers (unpaid fees, KP standing) → produce draft → route to PB approval → notify resident. Implemented as an inspectable state machine (each step logged), not a black box.
- **Oversight agents (batch jobs):** duplicate/ghost-account sweep (A1 + B1), disbursement anomaly flags, KP deadline watch, dormant-wallet report.
- **Analytics copilot** (in `apps/hub`): natural-language questions over *aggregated* views only ("which barangays are slowest on clearances this month?") returning chart + table + the SQL/query it ran.
*DoD:* all five surfaces working against seed data with visible citations and audit entries; one full agentic certificate flow demo.

**B3. Resident Self-Service Suite** (in `apps/resident`, feeding admin queues)
- **Report a Concern (311):** category, photo, geo-pin → routed queue in admin with SLA timers → status updates to resident → resolution photo. Public heat-map on website (privacy-safe).
- **Panic / SOS:** one-tap alert with live location → tanod/responder dispatch board in admin (A5/A3 linked); test mode for demos.
- **Announcements & alerts (two-way):** admin composes (AI-assisted) → push/in-app + optional SMS stub; typhoon early-warning template tied to A5 event mode; residents can reply into a moderated inbox.
- **Appointments & digital queue:** book slots for hall services; kiosk "now serving" screen route (`/queue-display`); RA 11032 processing-time metrics into A12.
- **Citizen feedback / CSM (RA 11032):** one-tap post-transaction rating + comment; CSM report in A12; grievance escalation path.
- **Digital Barangay ID:** QR-verifiable resident card (screen + printable), backed by A1 + consent; scanning by staff pulls up the profile they're allowed to see.
- **Resident health services:** health-center appointment booking, teleconsult referral stub, vaccination/prenatal/senior reminders (BHW-managed campaigns from A1 cohorts).
- **Livelihood & jobs:** local job board + skills/training/scholarship listings; application tracking; benefit-program application forms (4Ps/solo-parent/senior/PWD) routed to staff.
- **Participatory budgeting & e-Assembly:** project shortlist from A8 → resident voting window (one vote per verified resident) → results to transparency board; assembly agenda/minutes publishing.
*DoD:* every feature reachable in the resident PWA demo; each writes into the correct admin queue; CSM and 311 SLA metrics appear in A12/hub.

---

## 6. Integration adapters (build as mocks with real seams)

- **`packages/bims-adapter`:** interface `BimsGateway` (pullInhabitants, pullIssuances, pushReconVoucher, exportRbiForms). Ship a **mock implementation** + a sync-status screen in admin ("last synced, pending, conflicts — BIMS wins"). In `companion` mode, A1/A2/A3 records display a "Source: LGUSS-BIMS (read-only)" badge vs. locally-created ones.
- **`packages/philsys-adapter`:** PhilSys number format validation + mock verification endpoint.
- **`packages/payments`:** the `EmiProvider` mock (§B1) with webhook simulation and a fake "settlement bank" ledger.
- **SMS/email:** provider interface with console/mailhog implementations; SMS reserved for OTP + critical alerts (cost note in README).

---

## 7. Cross-cutting requirements

- **Security:** MFA for staff; session management; rate limiting; PII encryption at rest for sensitive columns (KP/VAWC narratives, health data); signed URLs for files; OWASP-basics tests; `audit_log` on every mutation; RBAC/ABAC enforced server-side (never trust the client).
- **Privacy (RA 10173):** consent registry (§A1); data-subject request screen (view/export my data); retention policy config; privacy notice pages; DILG-viewer sees aggregates only.
- **Offline (admin + resident PWAs):** read cache + write outbox with conflict strategy (server wins, conflicts surfaced); explicit sync indicator.
- **i18n:** `en` + `fil` resource files; all resident-facing strings translated (machine-draft acceptable, marked for review).
- **Accessibility:** keyboard navigable, WCAG AA color contrast, large-touch targets in resident/agent apps.
- **Observability:** structured logs, health endpoints, a simple admin ops page (queue depth, sync lag, error rate).
- **Testing:** unit tests for money math, KP deadline engine, RBAC guards, and dedupe; one Playwright E2E per flagship flow (certificate e2e, disbursement batch e2e, 311 e2e).
- **Docs:** per-app README, architecture decision records (`docs/adr/`), API reference (OpenAPI generated), and a `DEMO.md` walkthrough script.

---

## 8. Build phases (work in this order)

| Phase | Scope | Definition of done |
|---|---|---|
| **0. Foundation** | Monorepo, CI (lint/test/build), Docker Compose, Prisma schema core (PSGC, tenants, users, roles, audit, consent), auth + MFA, RBAC engine, seed framework, UI kit (the BIMS-style console pattern: stat cards / filter bar / table / status chips) | `pnpm dev` boots all apps; login as 5 seeded roles; audit log records actions |
| **1. Identity backbone** | A1 Inhabitant Profiling + A13 platform admin + onboarding flow | Barangay onboarded; 500+ seeded inhabitants across 12 barangays; dedupe works; consent records |
| **2. Services & money** | A2 Issuance + A10 Financial + **B1 e-wallet core** (wallets, disbursement batch, fee collection, agent CICO) | The scripted B1 demo passes; certificate paid via wallet posts to A10 |
| **3. Casework & field ops** | A3 KP/Blotter + A5 Disaster + A4 Property/Assets | KP lifecycle demo; typhoon event demo; screenshot-parity property screens |
| **4. Governance** | A7 BORIS + A8 BDP + A9 BBI + A6 GAD + A11 public website + A12 reports | Public site live with real module data; quarterly rollup in hub |
| **5. Resident experience** | B3 full suite + `apps/resident` polish + `apps/agent` polish | Every B3 feature demo-able on mobile viewport; SLA/CSM metrics flowing |
| **6. AI layer** | B2 all five surfaces + guardrails | Cited, audited AI answers; agentic certificate flow with human approval |
| **7. Hub & hardening** | `apps/hub` dashboards (adoption scorecard: registration %, 30-day active %, merchants, cash-out ratio; module KPIs), BIMS adapter sync screens, security pass, E2E suite, DEMO.md | Full ecosystem demo runs start-to-finish from a fresh `pnpm seed` |

At the end of **every** phase: update `DEMO.md`, keep the seed script producing a coherent story (use Marikina City barangays as the demo tenant set), and leave the build green.

---

## 9. What NOT to do

- Do **not** claim or build a direct live integration to real DILG systems, PhilSys, or any EMI — adapters + mocks only, with honest "mock" labeling in the UI footer.
- Do **not** store real personal data in seeds — generate realistic Filipino synthetic data (names, puroks, occupations).
- Do **not** let any module bypass the consent registry, RBAC guards, or the A10 ledger for money-adjacent actions.
- Do **not** make SMS the default notification channel (cost) — push/in-app/email first, SMS for OTP and critical alerts.
- Do **not** build microservices — modular monolith with clean package seams is the requirement.

---

## 10. Success criteria (the final bar)

1. Fresh clone → `docker compose up` + `pnpm i && pnpm seed && pnpm dev` → working ecosystem in under 15 minutes.
2. A 20-minute scripted demo (`DEMO.md`) tells the whole story: onboard a barangay → encode a household → resident requests & pays for a clearance on their phone → PB approves, QR-verifiable PDF issued → treasurer runs honoraria + ayuda disbursement batches → agent cash-out → books reconcile → a typhoon event runs → a KP case runs to settlement → resident reports a pothole and rates the service → the AI assistant answers a Taglish question with citations → the hub shows the adoption scorecard across Marikina's 16 barangays.
3. All Group A modules visibly map to their LGUSS-BIMS counterparts (badge in each module header: "BIMS-parity: BIPS / BCIS / …"), and Group B modules are flagged "CBMS exclusive."
4. Tests green; no PII leaks across tenants (prove with a cross-tenant access test).
