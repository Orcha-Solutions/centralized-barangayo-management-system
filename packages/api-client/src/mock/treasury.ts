import {
  STATIC_BARANGAY_ID,
  STATIC_BUDGETS,
  STATIC_LEDGER_ENTRIES,
  STATIC_OFFICIAL_RECEIPTS,
} from "../staticData";
import { saveStore } from "../store";
import type { MockContext } from "./types";

export function handleTreasuryMock(ctx: MockContext): any {
  const { path, cleanPath, method, opts, store, currentUser } = ctx;

  // 1. GET requests
  if (method === "GET") {
    if (cleanPath === "/finance/ledger") {
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const queryParams = new URLSearchParams(queryString);
      const fund = queryParams.get("fund") || "all";
      const direction = queryParams.get("direction") || "all";
      const year = queryParams.get("year") || "all";
      const dateFrom = queryParams.get("dateFrom") || "";
      const dateTo = queryParams.get("dateTo") || "";
      const q = (queryParams.get("search") || queryParams.get("q") || "").toLowerCase().trim();
      const page = parseInt(queryParams.get("page") || "1", 10);
      const pageSize = parseInt(queryParams.get("pageSize") || "20", 10);

      let list = (store.LedgerEntry || STATIC_LEDGER_ENTRIES) as any[];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filteredByBrgy = list.filter(
          (x) =>
            !x.barangayId ||
            x.barangayId === currentUser.barangayId ||
            x.barangayId === STATIC_BARANGAY_ID,
        );
        if (filteredByBrgy.length > 0) list = filteredByBrgy;
      }

      list = list.map((item) => ({
        ...item,
        amount: typeof item.amount === "object" && item.amount !== null ? item.amount.value : Number(item.amount),
      }));

      if (fund !== "all") {
        list = list.filter((x) => x.fund && x.fund.toLowerCase() === fund.toLowerCase());
      }
      if (direction !== "all") {
        list = list.filter((x) => x.direction && x.direction.toLowerCase() === direction.toLowerCase());
      }
      if (year !== "all") {
        const targetYear = parseInt(year, 10);
        if (!isNaN(targetYear)) {
          list = list.filter((x) => x.postedAt && new Date(x.postedAt).getFullYear() === targetYear);
        }
      }
      if (dateFrom) {
        const fromMs = new Date(`${dateFrom}T00:00:00`).getTime();
        if (!isNaN(fromMs)) {
          list = list.filter((x) => x.postedAt && new Date(x.postedAt).getTime() >= fromMs);
        }
      }
      if (dateTo) {
        const toMs = new Date(`${dateTo}T23:59:59.999`).getTime();
        if (!isNaN(toMs)) {
          list = list.filter((x) => x.postedAt && new Date(x.postedAt).getTime() <= toMs);
        }
      }
      if (q) {
        list = list.filter(
          (x) =>
            (x.description && x.description.toLowerCase().includes(q)) ||
            (x.accountCode && x.accountCode.toLowerCase().includes(q)) ||
            (x.orNumber && x.orNumber.toLowerCase().includes(q)) ||
            (x.dvNumber && x.dvNumber.toLowerCase().includes(q)) ||
            (x.payorPayee && x.payorPayee.toLowerCase().includes(q)),
        );
      }

      list = [...list].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

      const total = list.length;
      const startIndex = (page - 1) * pageSize;
      const items = list.slice(startIndex, startIndex + pageSize);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
      };
    }

    if (cleanPath === "/finance/ledger/stats") {
      const list = (store.LedgerEntry || STATIC_LEDGER_ENTRIES) as any[];
      let totalCollections = 0;
      let totalDisbursements = 0;
      for (const item of list) {
        const rawAmt = typeof item.amount === "object" && item.amount !== null ? item.amount.value : Number(item.amount || 0);
        if (item.direction === "credit") totalCollections += rawAmt;
        if (item.direction === "debit") totalDisbursements += rawAmt;
      }
      return {
        totalCollections,
        totalDisbursements,
        netGeneralFund: totalCollections - totalDisbursements,
        activeCount: list.length,
      };
    }

    const ledgerDetailMatch = cleanPath.match(/^\/finance\/ledger\/([^/]+)$/);
    if (ledgerDetailMatch) {
      const id = ledgerDetailMatch[1];
      const list = (store.LedgerEntry || STATIC_LEDGER_ENTRIES) as any[];
      const item = list.find((x: any) => x.id === id || x.orNumber === id || x.dvNumber === id);
      if (!item) return null;
      return {
        ...item,
        amount: typeof item.amount === "object" && item.amount !== null ? item.amount.value : Number(item.amount),
      };
    }

    if (cleanPath === "/finance/receipts") {
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const queryParams = new URLSearchParams(queryString);
      const year = queryParams.get("year") || "all";
      const dateFrom = queryParams.get("dateFrom") || "";
      const dateTo = queryParams.get("dateTo") || "";
      const q = (queryParams.get("search") || queryParams.get("q") || "").toLowerCase().trim();
      const page = parseInt(queryParams.get("page") || "1", 10);
      const pageSize = parseInt(queryParams.get("pageSize") || "20", 10);

      let list = (store.OfficialReceipt || STATIC_OFFICIAL_RECEIPTS) as any[];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filteredByBrgy = list.filter(
          (x) =>
            !x.barangayId ||
            x.barangayId === currentUser.barangayId ||
            x.barangayId === STATIC_BARANGAY_ID,
        );
        if (filteredByBrgy.length > 0) list = filteredByBrgy;
      }

      list = list.map((item) => ({
        ...item,
        amount: typeof item.amount === "object" && item.amount !== null ? item.amount.value : Number(item.amount),
      }));

      if (year !== "all") {
        const targetYear = parseInt(year, 10);
        if (!isNaN(targetYear)) {
          list = list.filter((x) => x.issuedAt && new Date(x.issuedAt).getFullYear() === targetYear);
        }
      }
      if (dateFrom) {
        const fromMs = new Date(`${dateFrom}T00:00:00`).getTime();
        if (!isNaN(fromMs)) {
          list = list.filter((x) => x.issuedAt && new Date(x.issuedAt).getTime() >= fromMs);
        }
      }
      if (dateTo) {
        const toMs = new Date(`${dateTo}T23:59:59.999`).getTime();
        if (!isNaN(toMs)) {
          list = list.filter((x) => x.issuedAt && new Date(x.issuedAt).getTime() <= toMs);
        }
      }
      if (q) {
        list = list.filter(
          (x) =>
            (x.orNumber && x.orNumber.toLowerCase().includes(q)) ||
            (x.payorName && x.payorName.toLowerCase().includes(q)) ||
            (x.particulars && x.particulars.toLowerCase().includes(q)),
        );
      }

      list = [...list].sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

      const total = list.length;
      const startIndex = (page - 1) * pageSize;
      const items = list.slice(startIndex, startIndex + pageSize);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      return {
        items,
        total,
        page,
        pageSize,
        totalPages,
      };
    }

    const receiptDetailMatch = cleanPath.match(/^\/finance\/receipts\/([^/]+)$/);
    if (receiptDetailMatch) {
      const id = receiptDetailMatch[1];
      const list = (store.OfficialReceipt || STATIC_OFFICIAL_RECEIPTS) as any[];
      const item = list.find((x: any) => x.id === id || x.orNumber === id);
      if (!item) return null;
      return {
        ...item,
        amount: typeof item.amount === "object" && item.amount !== null ? item.amount.value : Number(item.amount),
      };
    }

    if (cleanPath === "/finance/budgets") {
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const queryParams = new URLSearchParams(queryString);
      const pageSize = parseInt(queryParams.get("pageSize") || "20", 10);

      let list = (store.Budget || STATIC_BUDGETS) as any[];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filteredByBrgy = list.filter(
          (x) => !x.barangayId || x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID,
        );
        if (filteredByBrgy.length > 0) list = filteredByBrgy;
      }

      list = list.map((b) => {
        const rawLines = b.lines?.create || b.lines || [];
        const lines = Array.isArray(rawLines) ? rawLines.map((l: any, idx: number) => ({
          id: l.id || `bl-${idx + 1}`,
          expenseClass: l.expenseClass || "MOOE",
          accountCode: l.accountCode || "",
          description: l.description || "",
          amount: typeof l.amount === "object" && l.amount !== null ? l.amount.value : Number(l.amount || 0),
          obligated: typeof l.obligated === "object" && l.obligated !== null ? l.obligated.value : Number(l.obligated || 0),
          disbursed: typeof l.disbursed === "object" && l.disbursed !== null ? l.disbursed.value : Number(l.disbursed || 0),
        })) : [];
        return {
          ...b,
          totalAmount: typeof b.totalAmount === "object" && b.totalAmount !== null ? b.totalAmount.value : Number(b.totalAmount || 0),
          skFundAmount: typeof b.skFundAmount === "object" && b.skFundAmount !== null ? b.skFundAmount.value : Number(b.skFundAmount || 0),
          lines,
        };
      });

      return { items: list, total: list.length, page: 1, pageSize };
    }

    const budgetDetailMatch = cleanPath.match(/^\/finance\/budgets\/([^/]+)$/);
    if (budgetDetailMatch) {
      const id = budgetDetailMatch[1];
      const list = (store.Budget || STATIC_BUDGETS) as any[];
      const found = list.find((b) => b.id === id) || list[0];
      if (found) {
        const rawLines = found.lines?.create || found.lines || [];
        const lines = Array.isArray(rawLines) ? rawLines.map((l: any, idx: number) => ({
          id: l.id || `bl-${idx + 1}`,
          expenseClass: l.expenseClass || "MOOE",
          accountCode: l.accountCode || "",
          description: l.description || "",
          amount: typeof l.amount === "object" && l.amount !== null ? l.amount.value : Number(l.amount || 0),
          obligated: typeof l.obligated === "object" && l.obligated !== null ? l.obligated.value : Number(l.obligated || 0),
          disbursed: typeof l.disbursed === "object" && l.disbursed !== null ? l.disbursed.value : Number(l.disbursed || 0),
        })) : [];
        return {
          ...found,
          totalAmount: typeof found.totalAmount === "object" && found.totalAmount !== null ? found.totalAmount.value : Number(found.totalAmount || 0),
          skFundAmount: typeof found.skFundAmount === "object" && found.skFundAmount !== null ? found.skFundAmount.value : Number(found.skFundAmount || 0),
          lines,
        };
      }
      return null;
    }

    if (cleanPath === "/budget/overview" || cleanPath === "/v1/budget/overview") {
      const baseSectors: any[] = [];
      const rawSectors = store.StatutorySectors || baseSectors;
      const ledgerEntries = (store.LedgerEntry || []) as any[];
      const sectorObligations: Record<string, number> = {};

      for (const entry of ledgerEntries) {
        if (entry.direction === "debit") {
          const rawAmt = typeof entry.amount === "object" && entry.amount !== null ? entry.amount.value : Number(entry.amount || 0);
          const amtCentavos = Math.round(rawAmt * 100);
          const sId = (entry.sectorFundId || entry.fund || "").toLowerCase();
          if (sId) sectorObligations[sId] = (sectorObligations[sId] || 0) + amtCentavos;
        }
      }

      const sectors = rawSectors.map((s: any) => {
        const obligated = sectorObligations[s.id.toLowerCase()] || 0;
        const balance = Math.max(0, s.appropriatedCentavos - obligated);
        return { ...s, obligatedCentavos: obligated, balanceCentavos: balance };
      });

      const totalAppropriatedCentavos = sectors.reduce((acc: number, s: any) => acc + s.appropriatedCentavos, 0);
      const totalObligatedCentavos = sectors.reduce((acc: number, s: any) => acc + s.obligatedCentavos, 0);
      const totalBalanceCentavos = Math.max(0, totalAppropriatedCentavos - totalObligatedCentavos);
      const overallBurnRatePercent = totalAppropriatedCentavos > 0
        ? Number(((totalObligatedCentavos / totalAppropriatedCentavos) * 100).toFixed(1))
        : 0;

      return {
        budget: {
          id: "budget-2026",
          year: 2026,
          ordinanceNo: "SBO-2026-001",
          title: "Annual General Appropriations Ordinance FY 2026",
          totalAmountCentavos: 1845000000,
          status: "enacted",
          sectors,
        },
        stats: {
          totalAnnualBudgetCentavos: 1845000000,
          totalAppropriatedCentavos,
          totalObligatedCentavos,
          totalBalanceCentavos,
          overallBurnRatePercent,
          sectorCount: sectors.length,
        },
      };
    }

    if (cleanPath === "/budget/sectors" || cleanPath === "/v1/budget/sectors") {
      const overview = handleTreasuryMock({ ...ctx, cleanPath: "/budget/overview" });
      return {
        data: overview.budget.sectors,
        total: overview.budget.sectors.length,
      };
    }

    const disbMatch = cleanPath.match(/^\/(?:v1\/)?budget\/sectors\/([^/]+)\/disbursements$/);
    if (disbMatch) {
      const sectorId = disbMatch[1].toLowerCase();
      const list = (store.LedgerEntry || STATIC_LEDGER_ENTRIES) as any[];
      const filtered = list.filter((e) => {
        if (!e.sectorFundId) return false;
        return e.sectorFundId.toLowerCase() === sectorId || e.fund?.toLowerCase() === sectorId;
      });

      const items = filtered.map((e) => ({
        ledgerId: e.id,
        accountCode: e.accountCode,
        description: e.description,
        dvNumber: e.dvNumber || "",
        payee: e.payorPayee || "N/A",
        amount: typeof e.amount === "object" && e.amount !== null ? e.amount.value : Number(e.amount),
        postedAt: e.postedAt,
      }));

      return { data: items, count: items.length };
    }
  }

  // 2. POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    if (cleanPath === "/finance/ledger") {
      const newEntry = {
        id: "led-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        postedAt: body.postedAt || new Date().toISOString(),
        fund: body.fund || "general",
        accountCode: body.accountCode || "4-02-01-040",
        description: body.description || "General Ledger entry",
        direction: body.direction || "credit",
        amount: Number(body.amount) || 0,
        orNumber: body.orNumber || null,
        dvNumber: body.dvNumber || null,
        sectorFundId: body.sectorFundId || null,
        refType:
          body.refType ||
          (body.orNumber ? "official_receipt" : body.dvNumber ? "disbursement_voucher" : "manual"),
      };
      store.LedgerEntry = [newEntry, ...(store.LedgerEntry || STATIC_LEDGER_ENTRIES)];
      saveStore(store);
      return newEntry;
    }

    if (cleanPath === "/finance/receipts") {
      const list = (store.OfficialReceipt || STATIC_OFFICIAL_RECEIPTS) as any[];
      const nextNum = 100 + list.length + 1;
      const orNumber = body.orNumber || `OR-2026-00${nextNum}`;
      const amount = Number(body.amount) || 0;
      const newReceipt = {
        id: "or-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        orNumber,
        payorName: body.payorName || "Resident",
        amount,
        particulars: body.particulars || "Barangay Clearance / Certification Fee",
        issuedAt: new Date().toISOString(),
        status: "issued",
      };
      store.OfficialReceipt = [newReceipt, ...list];

      const newLedgerEntry = {
        id: "led-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        postedAt: newReceipt.issuedAt,
        fund: body.fund || "general",
        accountCode: body.accountCode || "4-02-01-040",
        description: `Official Receipt collection (${orNumber}) — ${newReceipt.particulars} (${newReceipt.payorName})`,
        direction: "credit",
        amount,
        orNumber,
        refType: "official_receipt",
      };
      store.LedgerEntry = [newLedgerEntry, ...(store.LedgerEntry || STATIC_LEDGER_ENTRIES)];

      saveStore(store);
      return newReceipt;
    }

    const cancelReceiptMatch = cleanPath.match(/^\/finance\/receipts\/([^/]+)\/cancel$/);
    if (cancelReceiptMatch) {
      const id = cancelReceiptMatch[1];
      const list = (store.OfficialReceipt || STATIC_OFFICIAL_RECEIPTS) as any[];
      const item = list.find((x: any) => x.id === id || x.orNumber === id);
      if (item) {
        item.status = "cancelled";
        item.cancellationReason = body.reason || "Cancelled by Treasurer";
        item.cancelledAt = new Date().toISOString();
        saveStore(store);
      }
      return item || {};
    }
  }

  // 3. DELETE requests
  if (method === "DELETE") {
    const ledgerDeleteMatch = cleanPath.match(/^\/finance\/ledger\/([^/]+)$/);
    if (ledgerDeleteMatch) {
      const id = ledgerDeleteMatch[1];
      store.LedgerEntry = ((store.LedgerEntry || []) as any[]).filter(
        (x: any) => x.id !== id && x.dvNumber !== id && x.orNumber !== id,
      );
      saveStore(store);
      return { success: true };
    }
  }

  return undefined;
}
