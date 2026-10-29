import {
  STATIC_BARANGAY_ID,
  STATIC_DISBURSEMENT_BATCHES,
  STATIC_DISBURSEMENT_ITEMS,
  STATIC_LEDGER_ENTRIES,
} from "../staticData";
import { saveStore } from "../store";
import { handleRptMock } from "./rpt";
import type { MockContext } from "./types";

export function handleWalletMock(ctx: MockContext): any {
  const rptResult = handleRptMock(ctx);
  if (rptResult !== undefined) {
    return rptResult;
  }

  const { cleanPath, method, opts, store, currentUser } = ctx;

  // 1. GET requests
  if (method === "GET") {
    if (cleanPath === "/wallets/me") {
      const inhId = currentUser.inhabitantId || "res1-inhabitant";
      const wallet = store.Wallet?.find((w) => w.inhabitantId === inhId);
      if (!wallet) return { balanceCentavos: 100000, id: "mock-wallet-id" };
      return wallet;
    }

    if (cleanPath === "/wallet/scorecard") {
      const list = store.WalletTransaction || [];
      const registered = (store.Wallet || []).length || 854;
      const adults = (store.Inhabitant || []).filter((x) => (x.age ?? 25) >= 18).length || 1020;
      const regRate = Math.min(100, Math.round((registered / adults) * 100)) || 84;
      const active = Math.round(registered * 0.62) || 530;
      const activeRate = Math.min(100, Math.round((active / registered) * 100)) || 62;

      return {
        registeredWallets: registered,
        adultPopulation: adults,
        registrationRate: regRate,
        active30d: active,
        activeRate,
        merchantsAccepting: (store.Merchant || []).length || 12,
        cashInOutPoints: (store.Agent || []).length || 4,
        cashOutOnlyRatio: 42,
        balanceCentavos: "50000000",
        totalTransactions: list.length,
        totalDisbursements: list.filter((x) => x.type === "disbursement").length,
        targets: {
          registrationRate: "80–90%",
          activeRate: "50–65%",
          merchantsAccepting: "8–15",
          note: "Targeting 80%+ digital disbursement adoption across active households.",
        },
      };
    }

    if (cleanPath === "/wallet/batches") {
      let list = (store.DisbursementBatch || STATIC_DISBURSEMENT_BATCHES) as any[];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filtered = list.filter(
          (x) => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID
        );
        if (filtered.length > 0) list = filtered;
      }
      const allItems = store.DisbursementBatchItem || STATIC_DISBURSEMENT_ITEMS;
      list = list.map((b) => {
        const rawItems = b.items || allItems.filter((i: any) => i.batchId === b.id);
        const items = rawItems.map((it: any) => ({
          ...it,
          amountCentavos: String(it.amountCentavos || "0").replace(/n$/, ""),
        }));
        return {
          ...b,
          totalCentavos: String(b.totalCentavos || "0").replace(/n$/, ""),
          itemCount: items.length || b.itemCount || 0,
          items,
          _count: { items: items.length || b.itemCount || 0 },
        };
      });
      return { items: list };
    }

    const batchDetailMatch = cleanPath.match(/^\/wallet\/batches\/([^/]+)$/);
    if (batchDetailMatch) {
      const id = batchDetailMatch[1];
      const list = (store.DisbursementBatch || STATIC_DISBURSEMENT_BATCHES) as any[];
      const batch = list.find((b: any) => b.id === id || b.batchNo === id);
      if (!batch) return null;
      const allItems = store.DisbursementBatchItem || STATIC_DISBURSEMENT_ITEMS;
      const items = (batch.items || allItems.filter((i: any) => i.batchId === batch.id)).map((it: any) => ({
        ...it,
        amountCentavos: String(it.amountCentavos || "0").replace(/n$/, ""),
      }));
      return {
        ...batch,
        totalCentavos: String(batch.totalCentavos || "0").replace(/n$/, ""),
        items,
        itemCount: items.length || batch.itemCount || 0,
        _count: { items: items.length || batch.itemCount || 0 },
      };
    }
  }

  // 2. POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    if (cleanPath === "/wallet/batches") {
      const existing = store.DisbursementBatch || STATIC_DISBURSEMENT_BATCHES;
      const nextNum = 100 + existing.length + 1;
      const batchNo = `DB-2026-00${nextNum}`;
      const batchId = "db-" + Math.random().toString(36).substring(2, 9);

      const rawItems = Array.isArray(body.items) ? body.items : [];
      let totalCentavos = 0;
      const builtItems = rawItems.map((it: any, idx: number) => {
        const amt = Number(it.amountCentavos || 0);
        totalCentavos += amt;
        const citizen = (store.Inhabitant || []).find((c: any) => c.id === it.inhabitantId);
        return {
          id: `${batchId}-item-${idx + 1}`,
          batchId,
          inhabitantId: it.inhabitantId || `inh-${idx + 1}`,
          inhabitant: citizen
            ? { id: citizen.id, firstName: citizen.firstName, lastName: citizen.lastName, purok: citizen.purok }
            : { id: it.inhabitantId, firstName: "Beneficiary", lastName: `#${idx + 1}`, purok: "Purok 1" },
          amountCentavos: String(amt),
          channel: "wallet",
          status: "queued",
        };
      });

      const newBatch = {
        id: batchId,
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        batchNo,
        programName: body.programName || "Cash Assistance Program",
        purpose: body.purpose || "",
        fundSource: body.fundSource || "general",
        status: "draft",
        totalCentavos: String(totalCentavos),
        itemCount: builtItems.length,
        items: builtItems,
        _count: { items: builtItems.length },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!store.DisbursementBatch) store.DisbursementBatch = [...STATIC_DISBURSEMENT_BATCHES];
      store.DisbursementBatch.unshift(newBatch);
      if (!store.DisbursementBatchItem) store.DisbursementBatchItem = [...STATIC_DISBURSEMENT_ITEMS];
      store.DisbursementBatchItem.push(...builtItems);
      saveStore(store);
      return newBatch;
    }

    const batchApproveMatch = cleanPath.match(/^\/wallet\/batches\/([^/]+)\/approve$/);
    if (batchApproveMatch) {
      const id = batchApproveMatch[1];
      if (!store.DisbursementBatch) store.DisbursementBatch = [...STATIC_DISBURSEMENT_BATCHES];
      const batch = store.DisbursementBatch.find((b: any) => b.id === id || b.batchNo === id);
      if (batch) {
        batch.status = "approved";
        batch.approvedAt = new Date().toISOString();
        batch.updatedAt = batch.approvedAt;
        saveStore(store);
      }
      return batch || { id, status: "approved" };
    }

    const batchExecuteMatch = cleanPath.match(/^\/wallet\/batches\/([^/]+)\/execute$/);
    if (batchExecuteMatch) {
      const id = batchExecuteMatch[1];
      if (!store.DisbursementBatch) store.DisbursementBatch = [...STATIC_DISBURSEMENT_BATCHES];
      const batch = store.DisbursementBatch.find((b: any) => b.id === id || b.batchNo === id);
      if (!batch) return { paid: 0, otcFallback: 0, totalPaidCentavos: "0" };

      const allItems = store.DisbursementBatchItem || STATIC_DISBURSEMENT_ITEMS;
      const items = batch.items || allItems.filter((i: any) => i.batchId === batch.id);
      let paid = 0;
      let otcFallback = 0;
      let totalPaidCentavos = 0;

      items.forEach((it: any, idx: number) => {
        const amt = Number(String(it.amountCentavos || "0").replace(/n$/, ""));
        totalPaidCentavos += amt;
        if (idx % 5 === 4 && !it.channel?.includes("wallet")) {
          it.status = "otc_fallback";
          it.channel = "otc";
          otcFallback++;
        } else {
          it.status = "paid";
          it.paidAt = new Date().toISOString();
          it.referenceNo = `WTX-2026-00${900 + idx}`;
          paid++;
        }
      });

      const dvNo = `DV-2026-00${110 + store.DisbursementBatch.length}`;
      batch.status = "completed";
      batch.executedAt = new Date().toISOString();
      batch.dvNumber = dvNo;
      batch.updatedAt = batch.executedAt;

      if (!store.LedgerEntry) store.LedgerEntry = [...STATIC_LEDGER_ENTRIES];
      store.LedgerEntry.unshift({
        id: "led-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        postedAt: batch.executedAt,
        fund: batch.fundSource || "general",
        accountCode: "5-02-99-080",
        description: `Digital Cash Assistance Disbursement — ${batch.programName} (${batch.batchNo})`,
        direction: "debit",
        amount: Math.round(totalPaidCentavos / 100),
        dvNumber: dvNo,
        refType: "disbursement_voucher",
      });

      saveStore(store);
      return {
        paid,
        otcFallback,
        totalPaidCentavos: totalPaidCentavos.toString(),
        dvNumber: dvNo,
      };
    }

    if (cleanPath === "/wallet/cash-out") {
      const amountCentavos = Number(body.amountCentavos || 0);
      const resId = body.inhabitantId;
      const wallet = store.Wallet?.find((w) => w.inhabitantId === resId);
      if (wallet) {
        wallet.balanceCentavos = Number(wallet.balanceCentavos || 0) - amountCentavos;
      }
      const newTx = {
        id: "tx-" + Math.random().toString(36).substring(2, 9),
        walletId: wallet?.id || "mock-wallet",
        amountCentavos,
        type: "cash_out",
        status: "completed",
        createdAt: new Date().toISOString(),
      };
      if (!store.WalletTransaction) store.WalletTransaction = [];
      store.WalletTransaction.push(newTx);
      saveStore(store);
      return newTx;
    }
  }

  // 3. PATCH requests
  if (method === "PATCH") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    const batchPatchMatch = cleanPath.match(/\/wallet\/batches\/([^\/]+)/);
    if (batchPatchMatch) {
      const id = batchPatchMatch[1];
      const b = store.DisbursementBatch?.find((x) => x.id === id || x.batchNo === id);
      if (b) {
        Object.assign(b, body);
        b.updatedAt = new Date().toISOString();
        saveStore(store);
      }
      return b || {};
    }
  }

  // 4. DELETE requests
  if (method === "DELETE") {
    const batchDelMatch = cleanPath.match(/\/wallet\/batches\/([^\/]+)/);
    if (batchDelMatch) {
      const id = batchDelMatch[1];
      if (store.DisbursementBatch) {
        store.DisbursementBatch = store.DisbursementBatch.filter((x) => x.id !== id && x.batchNo !== id);
      }
      if (store.DisbursementBatchItem) {
        store.DisbursementBatchItem = store.DisbursementBatchItem.filter((x) => x.batchId !== id);
      }
      saveStore(store);
      return { success: true };
    }
  }

  return undefined;
}
