import {
  STATIC_BARANGAY_ID,
  STATIC_DISBURSEMENT_BATCHES,
  STATIC_DISBURSEMENT_ITEMS,
  STATIC_LEDGER_ENTRIES,
  STATIC_RPT_PROPERTIES,
  STATIC_RPT_TAX_DUES,
} from "../staticData";
import { saveStore } from "../store";
import type { MockContext } from "./types";

export function handleWalletMock(ctx: MockContext): any {
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
          (x) =>
            !x.barangayId ||
            x.barangayId === currentUser.barangayId ||
            x.barangayId === STATIC_BARANGAY_ID,
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

    if (cleanPath === "/rpt") {
      let list = (store.RptProperty || STATIC_RPT_PROPERTIES) as any[];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filteredByBrgy = list.filter(
          (x) =>
            !x.barangayId ||
            x.barangayId === currentUser.barangayId ||
            x.barangayId === STATIC_BARANGAY_ID,
        );
        if (filteredByBrgy.length > 0) list = filteredByBrgy;
      }
      return list.filter((p) => p.isActive !== false);
    }

    if (cleanPath === "/rpt/dues") {
      return store.RptTaxDue || STATIC_RPT_TAX_DUES;
    }

    const rptDetailMatch = cleanPath.match(/^\/rpt\/([^/]+)$/);
    if (rptDetailMatch) {
      const id = rptDetailMatch[1];
      const list = (store.RptProperty || STATIC_RPT_PROPERTIES) as any[];
      const prop = list.find((p: any) => p.id === id || p.taxDeclarationNo === id);
      if (!prop) return null;
      const dues = (store.RptTaxDue || STATIC_RPT_TAX_DUES).filter((d: any) => d.rptPropertyId === prop.id);
      return { ...prop, dues };
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

      const items = (body.items || []).map((it: any, idx: number) => {
        const amountCentavos = String(Math.round((Number(it.amountPeso) || 0) * 100));
        return {
          id: `item-${batchId}-${idx + 1}`,
          batchId,
          payeeName: it.payeeName,
          amountCentavos,
          status: "pending",
          walletId: "wal-" + Math.random().toString(36).substring(2, 7),
          inhabitantId: it.inhabitantId || null,
          remarks: null,
          createdAt: new Date().toISOString(),
        };
      });

      const totalCentavos = items
        .reduce((acc: bigint, curr: any) => acc + BigInt(curr.amountCentavos || 0), 0n)
        .toString();

      const newBatch = {
        id: batchId,
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        batchNo,
        kind: body.kind || "payroll_honoraria",
        title: body.title || "Disbursement Batch",
        fund: body.fund || "general",
        status: "for_approval",
        preparedById: currentUser.id || "usr-treasurer",
        sourceNote: body.sourceNote || null,
        totalCentavos,
        itemCount: items.length,
        items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!store.DisbursementBatch) store.DisbursementBatch = [...STATIC_DISBURSEMENT_BATCHES];
      store.DisbursementBatch = [newBatch, ...store.DisbursementBatch];

      if (!store.DisbursementBatchItem) store.DisbursementBatchItem = [...STATIC_DISBURSEMENT_ITEMS];
      store.DisbursementBatchItem = [...items, ...store.DisbursementBatchItem];

      saveStore(store);
      return newBatch;
    }

    const batchApproveMatch = cleanPath.match(/^\/wallet\/batches\/([^/]+)\/approve$/);
    if (batchApproveMatch) {
      const id = batchApproveMatch[1];
      const list = (store.DisbursementBatch || STATIC_DISBURSEMENT_BATCHES) as any[];
      const batch = list.find((b: any) => b.id === id || b.batchNo === id);
      if (!batch) return { error: "Batch not found" };

      if (batch.preparedById && currentUser.id && batch.preparedById === currentUser.id) {
        const err: any = new Error(
          "Maker–checker violation: you prepared this batch and cannot approve it (LGC §375).",
        );
        err.status = 403;
        throw err;
      }

      const allItems = store.DisbursementBatchItem || STATIC_DISBURSEMENT_ITEMS;
      const items = batch.items || allItems.filter((i: any) => i.batchId === batch.id);

      let paid = 0;
      let otcFallback = 0;
      let failed = 0;
      let totalPaidCentavos = 0n;

      items.forEach((item: any) => {
        if (item.walletId) {
          item.status = "paid";
          item.paidAt = new Date().toISOString();
          paid++;
          totalPaidCentavos += BigInt(String(item.amountCentavos).replace(/n$/, "") || 0);
        } else {
          item.status = "otc_fallback";
          item.remarks = "No registered e-wallet. Queued for over-the-counter treasurer payout.";
          otcFallback++;
        }
      });

      const dvNo = "DV-2026-" + Math.floor(1000 + Math.random() * 9000);
      batch.status = "completed";
      batch.approvedById = currentUser.id || "usr-pb";
      batch.approvedAt = new Date().toISOString();
      batch.executedAt = new Date().toISOString();
      batch.dvNumber = dvNo;
      batch.items = items;

      const amountPesos = Number(totalPaidCentavos) / 100;
      const ledgerEntry = {
        id: "led-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        postedAt: batch.executedAt,
        fund: batch.fund,
        accountCode:
          batch.fund === "sk"
            ? "5-02-99-010"
            : batch.fund === "disaster"
              ? "5-02-12-030"
              : "5-01-01-010",
        description: `Disbursement: ${batch.title} (${batch.batchNo}) via E-Money Rail`,
        direction: "debit",
        amount: amountPesos,
        dvNumber: dvNo,
        refType: "disbursement_voucher",
      };
      store.LedgerEntry = [ledgerEntry, ...(store.LedgerEntry || STATIC_LEDGER_ENTRIES)];

      saveStore(store);
      return {
        paid,
        failed,
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

    if (cleanPath === "/rpt") {
      const newProp = {
        id: "rpt-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        taxDeclarationNo: body.taxDeclarationNo,
        ownerInhabitantId: body.ownerInhabitantId,
        ownerName: body.ownerName,
        propertyType: body.propertyType,
        assessedValue: Number(body.assessedValue) || 0,
        marketValue: Number(body.marketValue) || 0,
        addressLine: body.addressLine,
        purok: body.purok,
        lotNo: body.lotNo || "",
        blockNo: body.blockNo || "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.RptProperty) store.RptProperty = [];
      store.RptProperty.push(newProp);

      const newDue = {
        id: "due-" + Math.random().toString(36).substring(2, 9),
        rptPropertyId: newProp.id,
        taxYear: new Date().getFullYear(),
        basicTaxAmount: Math.round(newProp.assessedValue * 0.01),
        sefTaxAmount: Math.round(newProp.assessedValue * 0.005),
        penaltyAmount: 0,
        totalAmount: Math.round(newProp.assessedValue * 0.015),
        paymentStatus: "unpaid",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.RptTaxDue) store.RptTaxDue = [];
      store.RptTaxDue.push(newDue);

      saveStore(store);
      return newProp;
    }

    const rptPayMatch = cleanPath.match(/^\/rpt\/([^/]+)\/pay$/);
    if (rptPayMatch) {
      const id = rptPayMatch[1];
      const dues = store.RptTaxDue || STATIC_RPT_TAX_DUES;
      const due = dues.find((d: any) => d.id === id || d.rptPropertyId === id);
      const properties = store.RptProperty || STATIC_RPT_PROPERTIES;
      const prop = properties.find((p: any) => p.id === (due ? due.rptPropertyId : id));

      if (due) {
        const receipts = store.OfficialReceipt || [];
        const nextNum = 100 + receipts.length + 1;
        const orNo = `OR-2026-00${nextNum}`;
        due.paymentStatus = "fully_paid";
        due.paidAt = new Date().toISOString();
        due.orNumber = orNo;

        const newReceipt = {
          id: "or-" + Math.random().toString(36).substring(2, 9),
          barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
          orNumber: orNo,
          payorName: prop?.ownerName || "Property Owner",
          amount: Number(due.totalAmount) || 0,
          particulars: `Real Property Tax Payment (TDN #${prop?.taxDeclarationNo || ""}) — Tax Year ${due.taxYear}`,
          issuedAt: due.paidAt,
          status: "issued",
        };
        store.OfficialReceipt = [newReceipt, ...(store.OfficialReceipt || [])];

        const newLedger = {
          id: "led-" + Math.random().toString(36).substring(2, 9),
          barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
          postedAt: due.paidAt,
          fund: "general",
          accountCode: "4-01-02-040",
          description: `Real Property Tax (RPT) Collection (${orNo}) — ${prop?.ownerName || "Owner"} (TDN #${prop?.taxDeclarationNo || ""})`,
          direction: "credit",
          amount: Number(due.totalAmount) || 0,
          orNumber: orNo,
          refType: "official_receipt",
        };
        store.LedgerEntry = [newLedger, ...(store.LedgerEntry || [])];

        saveStore(store);
        return { success: true, orNumber: orNo, due, receipt: newReceipt };
      }
    }
  }

  // 3. PATCH requests
  if (method === "PATCH") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    const rptMatch = cleanPath.match(/\/rpt\/([^\/]+)/);
    if (rptMatch) {
      const id = rptMatch[1];
      const r = store.RptProperty?.find((x) => x.id === id);
      if (r) {
        if (body.assessedValue !== undefined) body.assessedValue = Number(body.assessedValue);
        if (body.marketValue !== undefined) body.marketValue = Number(body.marketValue);
        Object.assign(r, body);
        r.updatedAt = new Date().toISOString();

        if (body.assessedValue) {
          const due = store.RptTaxDue?.find((d) => d.rptPropertyId === id && d.paymentStatus === "unpaid");
          if (due) {
            due.basicTaxAmount = Math.round(r.assessedValue * 0.01);
            due.sefTaxAmount = Math.round(r.assessedValue * 0.005);
            due.totalAmount = due.basicTaxAmount + due.sefTaxAmount + (due.penaltyAmount || 0);
          }
        }
        saveStore(store);
      }
      return r || {};
    }

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
    const rptDelMatch = cleanPath.match(/\/rpt\/([^\/]+)/);
    if (rptDelMatch) {
      const id = rptDelMatch[1];
      if (store.RptProperty) {
        store.RptProperty = store.RptProperty.filter((x) => x.id !== id);
      }
      if (store.RptTaxDue) {
        store.RptTaxDue = store.RptTaxDue.filter((x) => x.rptPropertyId !== id);
      }
      saveStore(store);
      return { success: true };
    }

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
