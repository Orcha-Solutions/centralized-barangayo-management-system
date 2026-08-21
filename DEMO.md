# CBMS — 20-minute demo script

A single narrative that walks the whole ecosystem: onboard → encode → request → pay →
approve → disburse → cash out → reconcile → respond → measure.

Everything below runs against **synthetic data** and **mock adapters** (BIMS, PhilSys, EMI).
Nothing connects to a live DILG or e-money system.

---

## 0. Bring it up (≈3 minutes)

```bash
docker compose up -d
pnpm install
pnpm db:generate && pnpm db:push && pnpm seed
pnpm dev
```

| App | URL | Who it's for |
|---|---|---|
| Barangay Console | http://localhost:4100 | Barangay staff |
| Resident PWA | http://localhost:4101 | Residents (open in a mobile viewport) |
| LGU / DILG Hub | http://localhost:4102 | City admins, DILG viewers |
| Agent / Merchant | http://localhost:4103 | Sari-sari cash-in/out agents |
| Public website | http://localhost:4104 | Anyone, no login |
| API | http://localhost:4000/health | — |

**Password for every seeded account: `Cbms#2026`**

Staff roles require TOTP MFA. On first login the API returns an enrolment secret and an
`otpauth://` URI — add it to any authenticator app, then enter the 6-digit code.
Residents do not use MFA.

**Seeded world:** 20 barangays (Marikina's 16 + 4 others), 546 households,
2,225 inhabitants, 1,183 wallets, 236 certificate requests, 29 KP cases, 154 properties.
The primary demo tenant is **Barangay Barangka, Marikina City**.

---

## 1. The positioning — 1 min

Open the **Hub → About** (http://localhost:4102/about).

> DILG's **LGUSS-BIMS** is mandatory for every barangay under **MC No. 2025-104**, it is free,
> and DILG hosts the data. CBMS does not replace it. Every Group A module carries a
> **"BIMS-parity"** badge naming the sub-system it complements (BIPS, BCIS, KPISBH, BAMS,
> BDRIS, BGADPBMS, BORIS, BFMS). The three things BIMS has none of — **payments, AI, and
> resident self-service** — are badged **"CBMS exclusive."**

---

## 2. Onboarding & the registry — 2 min

Log into the **Console** as `lgu@marikina.gov.ph` (LGU Admin).

- **Barangays** — one barangay sits in `pending`. Approving it is the MC 2025-104 §4.2.1
  flow: the barangay registers, the LGU admin approves.

Now log in as `secretary@barangka.gov.ph` (Barangay Secretary).

- **Inhabitants** — 246 residents in this barangay. Note the **Source** column: rows marked
  `BIMS` came from the mock BIPS pull and are read-only in companion mode.
- **New inhabitant** — enter a name and birthdate that collide with an existing resident.
  The API returns **409 PossibleDuplicate** with candidates; "Save anyway" re-posts with
  `confirmDuplicate`.
- Open a household → **Consent** panel. Nothing leaves the barangay's own operations without
  a `ConsentRecord` (RA 10173). Ayuda batches later *refuse to build* without one.

---

## 3. A resident gets a clearance — 4 min

Switch to the **Resident PWA** (http://localhost:4101), mobile viewport.
Log in as `resident1@example.ph`. The UI defaults to **Filipino/Taglish**.

1. **Services** → *Barangay Clearance*. The fee (₱50) and requirements are shown up front —
   the same list published on the public website. That transparency is the anti-fixer measure.
2. Submit a purpose → the request appears as `awaiting_payment`.
3. **Pay now** → pays from the resident's wallet. Behind that one tap the API:
   - moves centavos through the mock EMI,
   - debits the resident wallet and credits the barangay treasury,
   - issues an **Official Receipt number**,
   - posts a **credit to the A10 ledger** (account `4-02-01-040`),
   - flips the request to `for_approval`
   — all inside one database transaction.

Back in the **Console** as `kapitan@barangka.gov.ph` (Punong Barangay):

4. **Certificates → for approval** → **Approve**. A human signs; the AI never does.
5. The released certificate renders with a **verify code**.

Open the **public website**: http://localhost:4104/verify/&lt;code&gt; — no login.
It shows **VALID**, the certificate type, the barangay, and the holder's **initials only**.

> Try `treasurer@barangka.gov.ph` on the same Approve button: **403 — missing `issuance:approve`.**

---

## 4. Payday: honoraria and ayuda — 4 min

Console as `treasurer@barangka.gov.ph`.

- **Disbursements** → the seeded honoraria batch (60 payees) and calamity ayuda batch
  (200 households, ₱1,000 each). Note items marked **`otc_fallback`** — residents with no
  wallet are paid over the counter. Cash always works.
- **New batch** → pick payees, set amounts, submit. It lands in `for_approval`.
- Now press **Approve & disburse** *as the treasurer*: the button is disabled, and the API
  returns **403 — maker–checker violation**. The preparer of a batch may never approve it
  (LGC §375).

Log in as the **Punong Barangay** and approve the same batch. On execution CBMS:
- calls the EMI `disburseBatch`,
- credits each payee wallet and marks items `paid`,
- falls back to `otc_fallback` for wallet-less payees,
- debits the treasury wallet,
- posts one **debit** to the ledger with a DV number.

Fees on ayuda are **structurally zero** — `feeCentavos = 0n` in code, not a config toggle.

---

## 5. Cash-out at the sari-sari store — 2 min

**Agent app** (http://localhost:4103).

- The outlet shows **cash on hand** and **e-float**, with a **low-float warning** under ₱5,000 —
  the failure mode that kills trust on payout day.
- **Cash-out**: find a resident, enter an amount, leave **"Government aid (free cash-out)"** on.
  The fee is ₱0. Try an amount above the agent's cash on hand → a clear
  **"This agent is out of cash"** message rather than a stack trace.

---

## 6. The books tie out — 1 min

Console → **Finance → Ledger**. Filter by fund.

Every wallet movement in this demo has a matching ledger row: fee collections as credits with
OR numbers, disbursements as debits with DV numbers. The treasurer's reconciliation is a
by-product of the transaction, not a monthly chore. This is the argument that wins a treasurer.

---

## 7. Justice, safety and disaster — 3 min

- **KP Cases** — the RA 7160 §410 clock is computed, not typed: 15 days mediation,
  +15 conciliation, +15 extension. Cases inside 3 days show gold; breached show red.
  Advance a case to *settled* and the amicable-settlement document is generated.
- **Blotter** — log in as `secretary@barangka.gov.ph` and note there are **no VAWC entries**.
  Log in as `vawdesk@barangka.gov.ph` and they appear. VAWC/VAC confidentiality is enforced
  server-side; the secretary's API response never contains the rows at all.
- **Disaster** — the seeded *Bagyong Rosita* event: 3 evacuation centers, 90 households
  checked in, relief distributed to 200 — the same list the ayuda batch was built from.
- **SOS** — from the resident app, raise a **test** alert; it appears live on the Console
  dispatch board for the tanod to acknowledge and resolve.

---

## 8. Being heard, and measured — 2 min

- Resident app → **Report a Concern (311)**: category, description, "use my location".
  It lands in the Console queue with a **3-working-day SLA** (RA 11032) that turns red when breached.
- Resident app → rate the clearance **1–5 stars**. That is the **Client Satisfaction
  Measurement** RA 11032 requires; ratings ≤2 are flagged as grievances.
- Console → **Reports** shows the CSM distribution and the quarterly rollup.
- Resident app → **Me → Download my data**: the RA 10173 data-subject export.

---

## 9. The scorecard — 1 min

**Hub → Adoption Scorecard** (http://localhost:4102/scorecard).

All 16 Marikina barangays with registration %, 30-day active %, merchants, cash points,
volume and satisfaction — against the proposal's targets (80–90% registered, 50–65% active,
8–15 merchants). Barangka seeds at ~82% registered with 12 merchants.

The number to watch is the **cash-out-only ratio**: it should trend *down* as merchant
acceptance deepens. High registration with 100% immediate cash-out is a vanity metric, and
the dashboard says so.

Finally, log in as `dilg@dilg.gov.ph`: the quarterly aggregates render, but any attempt to
read raw personal data is refused. Aggregate-only access is enforced in the data layer.

---

## Proving it rather than claiming it

```bash
pnpm exec vitest run                                          # 37 unit tests
pnpm --filter @cbms/api exec dotenv -e ../../.env -- tsx src/__smoke__/smoke.ts
```

The smoke suite asserts the security properties this demo asserts verbally — cross-tenant
isolation, resident lockout from the registry, maker–checker, VAWC confidentiality,
and DILG aggregate-only access. **28/28 passing.**
