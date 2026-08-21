# ADR 0002 — CBMS is a companion to LGUSS-BIMS, never a replacement

**Status:** Accepted · **Date:** 2026-08-08

## Context

**DILG Memorandum Circular No. 2025-104** makes the department's **LGUSS-BIMS** mandatory
for every barangay: registration at `bims-admin.dilg.gov.ph`, an adopting ordinance from the
Sangguniang Barangay, and — critically — *"All data obtained from the BIMS operations shall
be stored in a secured data server of the DILG."* BIMS is provided free of charge.

Its sub-systems (BIPS, BCIS, KPISBH, BAMS, BDRIS, BGADPBMS, BORIS, BDP, BBI, BFMS) overlap
most of what a barangay management system would naturally build. Meanwhile the MC is
**silent on payments**, and BIMS has no AI and no resident-facing surface at all.

There is also **no published API** for BIMS, and MC 2025-104 §4.3.4 limits sharing of
inhabitant data to authorized parties **with signed household consent**.

## Decision

1. **BIMS is the system of record.** CBMS never claims to be the authoritative store for
   any BIMS-covered dataset, and never writes over BIMS data.
2. **Two runtime modes per tenant** (`Barangay.mode`), not two codebases:
   - `companion` (default) — BIMS-sourced rows are marked `source = BIMS` and treated as
     read-only; CBMS annotates and transacts around them.
   - `standalone` — for pilots without a data-sharing agreement; CBMS records are
     authoritative and exportable in BIMS form shape (see the RBI CSV export).
3. **Integration is contingent, and labelled as such.** `@cbms/bims-adapter` is a mock with
   a real seam. The UI carries a `MockBanner`; sync runs record
   *"Mock adapter — no live DILG interface. Pending a data-sharing agreement."*
4. **Consent is a first-class object.** `ConsentRecord` gates any use of inhabitant data
   beyond the barangay's own operations. Ayuda disbursement batches refuse to build
   without `DISBURSEMENT` consent on file.
5. **The e-wallet stands on separate legal footing.** Because MC 2025-104 does not address
   payments, the wallet relies on BSP e-money regulation, COA auditing rules, and the Local
   Government Code (§375 fund accountability) — not on the BIMS circular.

## Consequences

- Every Group A module carries a visible `BIMS-parity: <sub-system>` badge; Group B modules
  are badged `CBMS exclusive`. Reviewers can see the mapping without reading code.
- We can demo and pilot today without a DILG interface, and switch a tenant to `companion`
  the day an agreement lands.
- We never assert an integration we do not have — important in a government procurement.
