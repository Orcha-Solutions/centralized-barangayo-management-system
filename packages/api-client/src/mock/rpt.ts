import {
  STATIC_BARANGAY_ID,
  STATIC_RPT_PROPERTIES,
  STATIC_RPT_TAX_DUES,
} from "../staticData";
import { saveStore } from "../store";
import type { MockContext } from "./types";

const SAMPLE_OWNERS = [
  "Sps. Eduardo & Marites Villanueva",
  "Lorenzo M. Pangilinan",
  "Bautista Cold Storage & Logistics Corp.",
  "Dra. Cecilia Tan-Chua",
  "Engr. Victorino Salazar Jr.",
  "Marikina Valley Agro-Industrial Inc.",
  "Sps. Hernando & Erlinda Ocampo",
  "Ramoncito G. De Guzman",
  "Katrina Marie Soriano",
  "Donato & Sons Hardware Supply Inc.",
  "Felicidad R. Magbanua",
  "Atty. Gregorio P. Laurel",
  "Barangka Riverview Commercial Center",
  "Sps. Danilo & Teresita Mendoza",
  "Aurelio S. Evangelista",
  "Josefina L. Macapagal",
  "St. Jude Diagnostic & Medical Clinic",
  "Sps. Reynaldo & Carmela Pascual",
  "Bonifacio Global Milling & Feeds Corp.",
  "Teresita Vda. de Tolentino",
];

const SAMPLE_STREETS = [
  "A. Bonifacio Ave.",
  "Marcos Highway",
  "Riverbanks Access Rd.",
  "J.P. Rizal St.",
  "Gen. Julian Cruz St.",
  "M.H. Del Pilar St.",
  "Chorillo Rd.",
  "Urbano Velasco Ave.",
];

const SAMPLE_TYPES = ["residential", "commercial", "industrial", "agricultural", "special", "residential"];
const SAMPLE_STATUSES = ["fully_paid", "unpaid", "partially_paid", "fully_paid", "unpaid", "exempt"];

function ensureRptSeed65(store: Record<string, any[]>) {
  if (!store.RptProperty || store.RptProperty.length === 0) {
    store.RptProperty = [...STATIC_RPT_PROPERTIES];
  }
  if (!store.RptTaxDue || store.RptTaxDue.length === 0) {
    store.RptTaxDue = [...STATIC_RPT_TAX_DUES];
  }
  if (store.RptProperty.length >= 65) return;

  for (let g = store.RptProperty.length + 1; g <= 68; g++) {
    const id = `rpt-${String(g).padStart(4, "0")}`;
    const year = g % 5 === 0 ? 2024 : g % 3 === 0 ? 2025 : 2026;
    const assessedValue = (45 + ((g * 17) % 450)) * 10000;
    const marketValue = assessedValue * 3.5;
    const createdAt = new Date(Date.UTC(year, g % 12, (g % 27) + 1, 9, 0, 0)).toISOString();
    const status = SAMPLE_STATUSES[g % SAMPLE_STATUSES.length];

    store.RptProperty.push({
      id,
      barangayId: STATIC_BARANGAY_ID,
      taxDeclarationNo: `TD-${year}-BAR-${String(100 + g).padStart(4, "0")}`,
      ownerName: `${SAMPLE_OWNERS[g % SAMPLE_OWNERS.length]} #${g}`,
      propertyType: SAMPLE_TYPES[g % SAMPLE_TYPES.length],
      assessedValue,
      marketValue,
      assessedValueCentavos: assessedValue * 100,
      marketValueCentavos: marketValue * 100,
      addressLine: `${10 + g} ${SAMPLE_STREETS[g % SAMPLE_STREETS.length]}, Brgy. Barangka`,
      purok: `Purok ${(g % 7) + 1}`,
      lotNo: `${(g % 40) + 1}${g % 2 === 0 ? "-A" : "-B"}`,
      blockNo: String((g % 18) + 1),
      isActive: true,
      createdAt,
      updatedAt: createdAt,
    });

    const basicTaxAmount = Math.round(assessedValue * 0.01);
    const sefTaxAmount = Math.round(assessedValue * 0.01);
    store.RptTaxDue.push({
      id: `rtd-${String(g).padStart(4, "0")}`,
      rptPropertyId: id,
      barangayId: STATIC_BARANGAY_ID,
      taxYear: year,
      basicTaxAmount,
      sefTaxAmount,
      penaltyAmount: status === "unpaid" ? Math.round(basicTaxAmount * 0.1) : 0,
      discountAmount: 0,
      totalAmount: basicTaxAmount + sefTaxAmount,
      paymentStatus: status,
      paidAt: status === "fully_paid" ? createdAt : null,
      orNumber: status === "fully_paid" ? `OR-${year}-0${200 + g}` : null,
      isActive: true,
      createdAt,
      updatedAt: createdAt,
    });
  }
}

export function handleRptMock(ctx: MockContext): any {
  const { cleanPath, method, opts, store, currentUser } = ctx;
  if (cleanPath !== "/rpt" && !cleanPath.startsWith("/rpt/")) return undefined;

  ensureRptSeed65(store);

  if (method === "GET") {
    const filterRptProperties = () => {
      const allProps = (store.RptProperty as any[]).filter((p) => p.isActive !== false);
      const allDues = store.RptTaxDue as any[];
      const q = ctx.queryParams;
      const search = (q.get("search") || q.get("q") || "").trim().toLowerCase();
      const propertyType = (q.get("propertyType") || "all").toLowerCase();
      const paymentStatus = (q.get("paymentStatus") || "all").toLowerCase();
      const purok = (q.get("purok") || "all").toLowerCase();
      const year = q.get("taxYear") || q.get("year") || "all";
      const dateFrom = q.get("dateFrom") || "",
        dateTo = q.get("dateTo") || "";

      const props = allProps.filter((p) => {
        if (propertyType !== "all" && String(p.propertyType || "").toLowerCase() !== propertyType) return false;
        if (purok !== "all" && String(p.purok || "").toLowerCase() !== purok) return false;
        const propDues = allDues.filter((d) => d.rptPropertyId === p.id);
        if (paymentStatus !== "all" && !propDues.some((d) => String(d.paymentStatus || "").toLowerCase() === paymentStatus))
          return false;
        if (year !== "all" && year !== "0") {
          const yNum = Number(year);
          if (!propDues.some((d) => Number(d.taxYear) === yNum) && !(p.createdAt && new Date(p.createdAt).getFullYear() === yNum))
            return false;
        }
        if (dateFrom && p.createdAt && new Date(p.createdAt) < new Date(dateFrom)) return false;
        if (dateTo && p.createdAt && new Date(p.createdAt) > new Date(`${dateTo}T23:59:59`)) return false;
        if (
          search &&
          !`${p.taxDeclarationNo || ""} ${p.ownerName || ""} ${p.addressLine || ""} ${p.purok || ""} ${p.lotNo || ""} ${p.blockNo || ""}`
            .toLowerCase()
            .includes(search)
        )
          return false;
        return true;
      });
      const propIds = new Set(props.map((p) => p.id));
      const dues = allDues.filter((d) => {
        if (!propIds.has(d.rptPropertyId)) return false;
        if (year !== "all" && year !== "0" && Number(d.taxYear) !== Number(year)) return false;
        if (paymentStatus !== "all" && String(d.paymentStatus || "").toLowerCase() !== paymentStatus) return false;
        return true;
      });
      return { props, dues, q };
    };

    if (cleanPath === "/rpt/stats") {
      const { props, dues } = filterRptProperties();
      const byPropertyType: Record<string, number> = {};
      const byPaymentStatus: Record<string, number> = {};
      let totalAssessedValueCentavos = 0,
        totalMarketValueCentavos = 0,
        totalBarangayShareCentavos = 0,
        collectedShareCentavos = 0,
        delinquentShareCentavos = 0;

      for (const p of props) {
        totalAssessedValueCentavos += Number(p.assessedValueCentavos ?? Number(p.assessedValue || 0) * 100);
        totalMarketValueCentavos += Number(p.marketValueCentavos ?? Number(p.marketValue || 0) * 100);
        byPropertyType[p.propertyType || "residential"] = (byPropertyType[p.propertyType || "residential"] || 0) + 1;
      }
      for (const d of dues) {
        const share = Number(d.barangayShareCentavos ?? Math.round(Number(d.basicTaxAmount || 0) * 25));
        totalBarangayShareCentavos += share;
        byPaymentStatus[d.paymentStatus || "unpaid"] = (byPaymentStatus[d.paymentStatus || "unpaid"] || 0) + 1;
        if (d.paymentStatus === "fully_paid") collectedShareCentavos += share;
        else if (d.paymentStatus !== "exempt") delinquentShareCentavos += share;
      }
      const eff =
        totalBarangayShareCentavos > 0
          ? Math.round((collectedShareCentavos / totalBarangayShareCentavos) * 1000) / 10
          : 0;
      return {
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        totalProperties: props.length,
        totalAssessedValueCentavos,
        totalMarketValueCentavos,
        totalBarangayShareCentavos,
        collectedShareCentavos,
        delinquentShareCentavos,
        collectionEfficiencyPercent: eff,
        byPropertyType,
        byPaymentStatus,
      };
    }

    if (cleanPath === "/rpt") {
      let { props: list, q } = filterRptProperties();

      const sortBy = q.get("sortBy") || "taxDeclarationNo";
      const sortOrder = (q.get("sortOrder") || "asc").toLowerCase() === "desc" ? -1 : 1;
      list = [...list].sort((a, b) => {
        const av = a[sortBy] ?? "",
          bv = b[sortBy] ?? "";
        return typeof av === "number" && typeof bv === "number"
          ? (av - bv) * sortOrder
          : String(av).localeCompare(String(bv)) * sortOrder;
      });

      if (q.has("page")) {
        const page = Math.max(1, Number(q.get("page") || 1)),
          pageSize = Math.max(1, Number(q.get("pageSize") || 20));
        const total = list.length,
          items = list.slice((page - 1) * pageSize, page * pageSize);
        return { items, data: items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
      }
      return list;
    }

    if (cleanPath === "/rpt/dues") {
      const dues = store.RptTaxDue as any[];
      return ctx.queryParams.has("page")
        ? { items: dues, data: dues, total: dues.length, page: 1, pageSize: 200, totalPages: 1 }
        : dues;
    }

    const rptDetailMatch = cleanPath.match(/^\/rpt\/([^/]+)$/);
    if (rptDetailMatch) {
      const id = rptDetailMatch[1];
      const prop = (store.RptProperty as any[]).find((p: any) => p.id === id || p.taxDeclarationNo === id);
      if (!prop) return null;
      const dues = (store.RptTaxDue as any[]).filter((d: any) => d.rptPropertyId === prop.id);
      return { ...prop, dues };
    }
  }

  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    if (cleanPath === "/rpt") {
      const av = Number(body.assessedValue) || Math.round((Number(body.assessedValueCentavos) || 0) / 100);
      const mv = Number(body.marketValue) || Math.round((Number(body.marketValueCentavos) || 0) / 100);
      const newProp = {
        id: "rpt-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        taxDeclarationNo: body.taxDeclarationNo,
        ownerInhabitantId: body.ownerInhabitantId || body.inhabitantId,
        ownerName: body.ownerName,
        propertyType: body.propertyType,
        assessedValue: av,
        marketValue: mv,
        assessedValueCentavos: av * 100,
        marketValueCentavos: mv * 100,
        addressLine: body.addressLine,
        purok: body.purok,
        lotNo: body.lotNo || "",
        blockNo: body.blockNo || "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.RptProperty.unshift(newProp);
      store.RptTaxDue.unshift({
        id: "due-" + Math.random().toString(36).substring(2, 9),
        rptPropertyId: newProp.id,
        taxYear: Number(body.taxYear) || new Date().getFullYear(),
        basicTaxAmount: Math.round(av * 0.01),
        sefTaxAmount: Math.round(av * 0.01),
        penaltyAmount: 0,
        totalAmount: Math.round(av * 0.02),
        paymentStatus: "unpaid",
        isActive: true,
        createdAt: newProp.createdAt,
        updatedAt: newProp.updatedAt,
      });
      saveStore(store);
      return newProp;
    }

    const rptPayMatch = cleanPath.match(/^\/rpt\/([^/]+)\/pay$/);
    if (rptPayMatch) {
      const id = rptPayMatch[1];
      const due = (store.RptTaxDue as any[]).find((d: any) => d.id === id || d.rptPropertyId === id);
      const prop = (store.RptProperty as any[]).find((p: any) => p.id === (due ? due.rptPropertyId : id));
      if (due) {
        const orNo = body.orNumber || `OR-2026-00${100 + (store.OfficialReceipt?.length || 0) + 1}`;
        due.paymentStatus = "fully_paid";
        due.paidAt = new Date().toISOString();
        due.orNumber = orNo;
        saveStore(store);
        return { success: true, orNumber: orNo, due };
      }
    }
  }

  if (method === "PATCH" || method === "PUT") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};
    const rptMatch = cleanPath.match(/^\/rpt\/([^/]+)$/);
    if (rptMatch) {
      const r = (store.RptProperty as any[]).find((x) => x.id === rptMatch[1]);
      if (r) {
        if (body.assessedValueCentavos) body.assessedValue = Math.round(Number(body.assessedValueCentavos) / 100);
        if (body.marketValueCentavos) body.marketValue = Math.round(Number(body.marketValueCentavos) / 100);
        Object.assign(r, body, { updatedAt: new Date().toISOString() });
        saveStore(store);
      }
      return r || {};
    }
  }

  if (method === "DELETE") {
    const rptDelMatch = cleanPath.match(/^\/rpt\/([^/]+)$/);
    if (rptDelMatch) {
      const id = rptDelMatch[1];
      store.RptProperty = (store.RptProperty as any[]).filter((x) => x.id !== id);
      store.RptTaxDue = (store.RptTaxDue as any[]).filter((x) => x.rptPropertyId !== id);
      saveStore(store);
      return { success: true };
    }
  }

  return undefined;
}
