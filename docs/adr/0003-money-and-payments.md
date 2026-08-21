# ADR 0003 — Money in centavos, and CBMS never holds funds

**Status:** Accepted · **Date:** 2026-08-08

## Context

The e-wallet moves public money: honoraria, allowances, and ayuda. Two risks dominate —
arithmetic error, and regulatory exposure.

## Decision

### Money is `BigInt` centavos, everywhere

`Wallet.balanceCentavos`, `WalletTransaction.amountCentavos`, and every batch item are
`BigInt` centavos. Floating point never touches a peso amount. `@cbms/db/money` provides
`money()`, `formatPeso()`, `splitEvenly()` (remainder-preserving) and `bpsFee()`
(half-up rounding). Unit tests assert `money(0.1) + money(0.2) === money(0.3)`.

Peso `Decimal` columns remain only in the A10 accounting ledger, where COA-style reports
are denominated in pesos.

### CBMS is not an e-money issuer

A **BSP-licensed EMI or bank is the issuer of record**. All movement goes through the
`EmiProvider` interface in `@cbms/payments`; `MockEmiProvider` is a dev-only in-memory
"settlement bank". Swapping in a real provider (or GCash/Maya rails, QR Ph, InstaPay)
touches one file and no product code.

### Controls that are structural, not procedural

- **Maker–checker.** `assertDifferentApprover()` refuses to let the preparer of a
  disbursement batch approve it. Enforced in the API, unit-tested, and proven by the
  smoke suite (treasurer self-approval returns 403).
- **Double-entry posting.** Every wallet transaction posts a `LedgerEntry` inside the same
  `prisma.$transaction` as the balance mutation, so the books cannot drift from the wallet.
- **Fees never touch aid.** Disbursement items are created with `feeCentavos = 0n`, and
  cash-out charges `0n` when `isGovernmentAid`. This is a code-level invariant, not a config.
- **Cash always works.** Batch items without a wallet are marked `otc_fallback` rather than
  failing — the money is released over the counter.

## Consequences

- Reconciliation is a feature, not a nightly job.
- The regulated surface is one interface wide, which is what makes an EMI partnership a
  commercial conversation rather than a rewrite.
