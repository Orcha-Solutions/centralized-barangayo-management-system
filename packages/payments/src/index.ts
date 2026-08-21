/**
 * Payments seam. CBMS never holds funds — a BSP-licensed EMI or bank is the
 * issuer of record. This interface is what a real provider (or GCash/Maya
 * rails, QR Ph, InstaPay) plugs into; the mock below is for dev and demos.
 */

export type Centavos = bigint;

export interface EmiWallet {
  accountRef: string;
  kycTier: "tier1" | "tier2";
  balanceCentavos: Centavos;
  status: "active" | "frozen" | "closed";
}

export interface EmiTransferResult {
  emiTxnRef: string;
  status: "completed" | "pending" | "failed";
  failureReason?: string;
  settledAt?: Date;
}

export interface DisburseItem {
  accountRef: string;
  amountCentavos: Centavos;
  payeeName: string;
  externalId: string;
}

export interface DisburseBatchResult {
  batchRef: string;
  results: Array<{
    externalId: string;
    status: "paid" | "failed";
    emiTxnRef?: string;
    failureReason?: string;
  }>;
}

export interface EmiProvider {
  readonly name: string;
  /** True when this is a simulation — surfaced in the UI footer. */
  readonly isMock: boolean;

  createWallet(input: {
    ownerRef: string;
    kycTier: "tier1" | "tier2";
  }): Promise<EmiWallet>;

  kycUpgrade(accountRef: string, evidenceRef: string): Promise<EmiWallet>;

  transfer(input: {
    fromRef: string;
    toRef: string;
    amountCentavos: Centavos;
    feeCentavos?: Centavos;
    reference: string;
    description?: string;
  }): Promise<EmiTransferResult>;

  /** Bulk G2P payout. Fees are charged to the disbursing side, never the payee. */
  disburseBatch(input: {
    fromRef: string;
    items: DisburseItem[];
    reference: string;
  }): Promise<DisburseBatchResult>;

  billPay(input: {
    fromRef: string;
    billerCode: string;
    accountNo: string;
    amountCentavos: Centavos;
    reference: string;
  }): Promise<EmiTransferResult>;

  qrGenerate(input: { merchantRef: string; label: string }): Promise<{ qr: string }>;

  qrPay(input: {
    fromRef: string;
    qr: string;
    amountCentavos: Centavos;
    reference: string;
  }): Promise<EmiTransferResult>;

  cashIn(input: {
    agentRef: string;
    toRef: string;
    amountCentavos: Centavos;
    reference: string;
  }): Promise<EmiTransferResult>;

  cashOut(input: {
    agentRef: string;
    fromRef: string;
    amountCentavos: Centavos;
    /** Government-disbursement cash-out is free (fee must be 0). */
    feeCentavos?: Centavos;
    reference: string;
  }): Promise<EmiTransferResult>;

  /** Simulate an async provider webhook (dev only). */
  simulateWebhook?(event: string, payload: unknown): Promise<void>;
}

// ---------------------------------------------------------------
// Mock provider — an in-memory "settlement bank" for dev and demos.
// ---------------------------------------------------------------

function ref(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

export class MockEmiProvider implements EmiProvider {
  readonly name = "MockEMI (dev)";
  readonly isMock = true;

  /** Fake settlement-bank ledger: accountRef -> balance. */
  private book = new Map<string, EmiWallet>();

  private ensure(accountRef: string): EmiWallet {
    let w = this.book.get(accountRef);
    if (!w) {
      w = {
        accountRef,
        kycTier: "tier1",
        balanceCentavos: 0n,
        status: "active",
      };
      this.book.set(accountRef, w);
    }
    return w;
  }

  async createWallet(input: { ownerRef: string; kycTier: "tier1" | "tier2" }) {
    const accountRef = `EMI-${input.ownerRef}`;
    const w: EmiWallet = {
      accountRef,
      kycTier: input.kycTier,
      balanceCentavos: 0n,
      status: "active",
    };
    this.book.set(accountRef, w);
    return w;
  }

  async kycUpgrade(accountRef: string) {
    const w = this.ensure(accountRef);
    w.kycTier = "tier2";
    return w;
  }

  async transfer(input: {
    fromRef: string;
    toRef: string;
    amountCentavos: Centavos;
    feeCentavos?: Centavos;
    reference: string;
  }): Promise<EmiTransferResult> {
    const from = this.ensure(input.fromRef);
    const to = this.ensure(input.toRef);
    const total = input.amountCentavos + (input.feeCentavos ?? 0n);

    if (from.status !== "active" || to.status !== "active") {
      return { emiTxnRef: ref("MOCK"), status: "failed", failureReason: "Wallet not active." };
    }
    // The mock does not enforce balance on the treasury account so demos never
    // dead-end; resident wallets are enforced.
    if (!input.fromRef.includes("TRS") && from.balanceCentavos < total) {
      return {
        emiTxnRef: ref("MOCK"),
        status: "failed",
        failureReason: "Insufficient balance.",
      };
    }
    from.balanceCentavos -= total;
    to.balanceCentavos += input.amountCentavos;
    return { emiTxnRef: ref("MOCK"), status: "completed", settledAt: new Date() };
  }

  async disburseBatch(input: {
    fromRef: string;
    items: DisburseItem[];
    reference: string;
  }): Promise<DisburseBatchResult> {
    const results: DisburseBatchResult["results"] = [];
    for (const item of input.items) {
      const r = await this.transfer({
        fromRef: input.fromRef,
        toRef: item.accountRef,
        amountCentavos: item.amountCentavos,
        reference: `${input.reference}:${item.externalId}`,
      });
      results.push({
        externalId: item.externalId,
        status: r.status === "completed" ? "paid" : "failed",
        emiTxnRef: r.emiTxnRef,
        failureReason: r.failureReason,
      });
    }
    return { batchRef: ref("BATCH"), results };
  }

  async billPay(input: {
    fromRef: string;
    billerCode: string;
    amountCentavos: Centavos;
    reference: string;
  }): Promise<EmiTransferResult> {
    return this.transfer({
      fromRef: input.fromRef,
      toRef: `EMI-BILLER-${input.billerCode}`,
      amountCentavos: input.amountCentavos,
      reference: input.reference,
    });
  }

  async qrGenerate(input: { merchantRef: string; label: string }) {
    return { qr: `QRPH|${input.merchantRef}|${encodeURIComponent(input.label)}` };
  }

  async qrPay(input: {
    fromRef: string;
    qr: string;
    amountCentavos: Centavos;
    reference: string;
  }) {
    const merchantRef = input.qr.split("|")[1] ?? "UNKNOWN";
    return this.transfer({
      fromRef: input.fromRef,
      toRef: merchantRef,
      amountCentavos: input.amountCentavos,
      reference: input.reference,
    });
  }

  async cashIn(input: {
    agentRef: string;
    toRef: string;
    amountCentavos: Centavos;
    reference: string;
  }) {
    return this.transfer({
      fromRef: input.agentRef,
      toRef: input.toRef,
      amountCentavos: input.amountCentavos,
      reference: input.reference,
    });
  }

  async cashOut(input: {
    agentRef: string;
    fromRef: string;
    amountCentavos: Centavos;
    feeCentavos?: Centavos;
    reference: string;
  }) {
    return this.transfer({
      fromRef: input.fromRef,
      toRef: input.agentRef,
      amountCentavos: input.amountCentavos,
      feeCentavos: input.feeCentavos ?? 0n,
      reference: input.reference,
    });
  }

  async simulateWebhook(event: string, payload: unknown) {
    // no-op in dev; real providers would POST to /webhooks/emi
    void event;
    void payload;
  }

  /** Test helper. */
  fund(accountRef: string, amount: Centavos) {
    this.ensure(accountRef).balanceCentavos += amount;
  }
}

let _provider: EmiProvider | null = null;

export function getEmiProvider(): EmiProvider {
  if (!_provider) _provider = new MockEmiProvider();
  return _provider;
}

export function setEmiProvider(p: EmiProvider) {
  _provider = p;
}
