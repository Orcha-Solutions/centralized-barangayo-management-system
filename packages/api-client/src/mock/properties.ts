import { STATIC_BARANGAY_ID, STATIC_MATERIALS, STATIC_PROPERTIES } from "../staticData";
import { saveStore } from "../store";
import type { MockContext } from "./types";

export function handlePropertiesMock(ctx: MockContext): any {
  const { path, cleanPath, method, opts, store, currentUser } = ctx;

  // 1. GET requests
  if (method === "GET") {
    const propSingleMatch = cleanPath.match(/^\/properties\/([^/]+)$/);
    if (propSingleMatch) {
      const id = propSingleMatch[1];
      const list = store.Property || STATIC_PROPERTIES;
      const item = list.find((p: any) => p.id === id);
      if (!item) return null;
      return {
        ...item,
        acquisitionCost:
          typeof item.acquisitionCost === "object" && item.acquisitionCost !== null
            ? Number(item.acquisitionCost.value)
            : item.acquisitionCost !== undefined && item.acquisitionCost !== null
              ? Number(item.acquisitionCost)
              : null,
        capacity: Number(item.capacity) || 0,
      };
    }

    if (cleanPath === "/properties") {
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const queryParams = new URLSearchParams(queryString);
      const q = (queryParams.get("q") || "").toLowerCase().trim();
      const type = queryParams.get("type") || "all";
      const status = queryParams.get("status") || "all";
      const page = parseInt(queryParams.get("page") || "1", 10);
      const pageSize = parseInt(queryParams.get("pageSize") || "25", 10);

      let list = (store.Property || STATIC_PROPERTIES) as any[];
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
        acquisitionCost:
          typeof item.acquisitionCost === "object" && item.acquisitionCost !== null
            ? Number(item.acquisitionCost.value)
            : item.acquisitionCost !== undefined && item.acquisitionCost !== null
              ? Number(item.acquisitionCost)
              : null,
        capacity: Number(item.capacity) || 0,
      }));

      if (type !== "all") {
        list = list.filter((x) => x.type === type);
      }
      if (status !== "all") {
        list = list.filter((x) => x.status === status);
      }
      if (q) {
        list = list.filter(
          (x) =>
            (x.name && x.name.toLowerCase().includes(q)) ||
            (x.category && x.category.toLowerCase().includes(q)) ||
            (x.custodian && x.custodian.toLowerCase().includes(q)) ||
            (x.addressLine && x.addressLine.toLowerCase().includes(q)) ||
            (x.description && x.description.toLowerCase().includes(q)),
        );
      }

      const total = list.length;
      const startIndex = (page - 1) * pageSize;
      const items = list.slice(startIndex, startIndex + pageSize);

      return {
        items,
        total,
        page,
        pageSize,
      };
    }

    const matSingleMatch = cleanPath.match(/^\/materials\/([^/]+)$/);
    if (matSingleMatch) {
      const id = matSingleMatch[1];
      const list = store.Material || STATIC_MATERIALS;
      return list.find((m: any) => m.id === id) || null;
    }

    if (cleanPath === "/materials") {
      const queryString = path.includes("?") ? path.split("?")[1] : "";
      const queryParams = new URLSearchParams(queryString);
      const q = (queryParams.get("q") || "").toLowerCase().trim();
      const page = parseInt(queryParams.get("page") || "1", 10);
      const pageSize = parseInt(queryParams.get("pageSize") || "100", 10);

      let list = (store.Material || STATIC_MATERIALS) as any[];
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
        quantity: Number(item.quantity) || 0,
        reorderLevel: Number(item.reorderLevel) || 0,
      }));

      if (q) {
        list = list.filter(
          (x) =>
            (x.name && x.name.toLowerCase().includes(q)) ||
            (x.location && x.location.toLowerCase().includes(q)) ||
            (x.unit && x.unit.toLowerCase().includes(q)),
        );
      }

      const total = list.length;
      const startIndex = (page - 1) * pageSize;
      const items = list.slice(startIndex, startIndex + pageSize);

      return {
        items,
        total,
        page,
        pageSize,
      };
    }

    if (cleanPath === "/drrm-resources") {
      let list = store.DrrmResource || [];
      if (currentUser.barangayId) {
        list = list.filter((x) => x.barangayId === currentUser.barangayId);
      }
      return list;
    }

    if (cleanPath === "/dashboard") {
      const brgyId = currentUser.barangayId || "barangka";
      const inhabitants = (store.Inhabitant || []).filter((x) => x.barangayId === brgyId);
      const households = (store.Household || []).filter((x) => x.barangayId === brgyId);
      const certificates = (store.CertificateRequest || []).filter((x) => x.barangayId === brgyId);
      const kpCases = (store.KpCase || []).filter((x) => x.barangayId === brgyId);
      const concerns = (store.Concern || []).filter((x) => x.barangayId === brgyId);
      const sosAlerts = (store.SosAlert || []).filter((x) => x.barangayId === brgyId);
      const batches = (store.DisbursementBatch || []).filter((x) => x.barangayId === brgyId || !x.barangayId);

      const population = {
        inhabitants: inhabitants.length,
        households: households.length,
        seniors: inhabitants.filter((x) => x.isSenior || x.age >= 60).length,
        pwd: inhabitants.filter((x) => x.isPwd).length,
      };

      const actionQueue = {
        certificatesForApproval: certificates.filter((x) => x.status === "pending").length,
        openConcerns: concerns.filter((x) => x.status === "open").length,
        activeSosAlerts: sosAlerts.filter((x) => x.status === "active").length,
        kpCasesNearDeadline: kpCases.filter((x) => x.stage !== "closed" && x.stage !== "settled").length,
        kpCasesBreached: 0,
        disbursementBatchesForApproval: batches.filter(
          (x) => x.status === "pending" || x.status === "prepared" || x.status === "for_approval",
        ).length,
      };

      const wallet = {
        registeredWallets: store.Wallet?.length || 5,
        transactions30d: store.WalletTransaction?.length || 10,
        volume30dCentavos: "2500000",
      };

      const satisfaction = {
        responses30d: store.Feedback?.length || 8,
        averageRating: 4.5,
      };

      return {
        population,
        actionQueue,
        wallet,
        satisfaction,
        kpAtRisk: [],
      };
    }

    if (cleanPath === "/hub/scorecard") {
      const rawBarangays =
        store.Barangay && store.Barangay.length > 0
          ? store.Barangay
          : [
              { id: "barangka", name: "Barangka", psgcCode: "137404001", mode: "companion" },
              { id: "calumpang", name: "Calumpang", psgcCode: "137404002", mode: "companion" },
              { id: "concepcion_uno", name: "Concepcion Uno", psgcCode: "137404003", mode: "companion" },
              { id: "concepcion_dos", name: "Concepcion Dos", psgcCode: "137404004", mode: "standalone" },
              { id: "fortune", name: "Fortune", psgcCode: "137404005", mode: "companion" },
              { id: "industrial_valley", name: "Industrial Valley", psgcCode: "137404006", mode: "companion" },
              { id: "jesus_dela_pena", name: "Jesus Dela Peña", psgcCode: "137404007", mode: "companion" },
              { id: "malanday", name: "Malanday", psgcCode: "137404008", mode: "standalone" },
              { id: "marikina_heights", name: "Marikina Heights", psgcCode: "137404009", mode: "companion" },
              { id: "nangka", name: "Nangka", psgcCode: "137404010", mode: "companion" },
              { id: "parang", name: "Parang", psgcCode: "137404011", mode: "companion" },
              { id: "san_roque", name: "San Roque", psgcCode: "137404012", mode: "companion" },
              { id: "santa_elena", name: "Santa Elena", psgcCode: "137404013", mode: "companion" },
              { id: "santo_nino", name: "Santo Niño", psgcCode: "137404014", mode: "companion" },
              { id: "tañong", name: "Tañong", psgcCode: "137404015", mode: "companion" },
              { id: "tumana", name: "Tumana", psgcCode: "137404016", mode: "companion" },
            ];

      const rows = rawBarangays.map((b: any, index: number) => {
        const pop = store.Inhabitant?.filter((x) => x.barangayId === b.id).length || 2400 + index * 175;
        const wallets = Math.round(pop * (0.62 + (index % 5) * 0.06));
        const rate = Math.min(98.5, Math.round((wallets / (pop * 0.65 || 1)) * 1000) / 10);
        return {
          barangayId: b.id,
          name: b.name,
          psgcCode: b.psgcCode || `1374040${(index + 1).toString().padStart(2, "0")}`,
          status: b.status || "active",
          mode: b.mode || "companion",
          population: pop,
          registeredWallets: wallets,
          registrationRate: rate,
          merchants: 16 + index * 3,
          cashPoints: 4 + (index % 3),
          transactions30d: 380 + index * 45,
          volume30dCentavos: (BigInt(52000000) + BigInt(index * 4200000)).toString(),
          certificates:
            store.CertificateRequest?.filter((x) => x.barangayId === b.id && x.status === "signed").length ||
            35 + index * 6,
          satisfaction: Number((4.85 - index * 0.04).toFixed(2)),
        };
      });

      const totals = {
        population: rows.reduce((s: number, r: any) => s + r.population, 0),
        registeredWallets: rows.reduce((s: number, r: any) => s + r.registeredWallets, 0),
        merchants: rows.reduce((s: number, r: any) => s + r.merchants, 0),
        transactions30d: rows.reduce((s: number, r: any) => s + r.transactions30d, 0),
        certificates: rows.reduce((s: number, r: any) => s + r.certificates, 0),
      };

      return {
        scope: "City of Marikina",
        barangayCount: rows.length,
        totals,
        targets: {
          registrationRate: "≥ 80%",
          activeRate: "≥ 50%",
          merchants: "25 per barangay",
          cashPointCoverage: "100%",
        },
        rows,
      };
    }

    if (cleanPath === "/reports/quarterly") {
      const brgyId = currentUser.barangayId || "barangka";
      const totalInhabitants = store.Inhabitant?.filter((x) => x.barangayId === brgyId).length || 2225;
      const certsIssued =
        store.CertificateRequest?.filter((x) => x.barangayId === brgyId && x.status === "signed").length || 150;
      const kpCases = store.KpCase?.filter((x) => x.barangayId === brgyId).length || 12;
      const concerns = store.Concern?.filter((x) => x.barangayId === brgyId).length || 18;
      const disbursements = store.WalletTransaction?.filter((x) => x.type === "disbursement").length || 45;

      return {
        period: "Q3 2026",
        barangaysCovered: 1,
        registeredInhabitants: totalInhabitants,
        certificatesIssued: certsIssued,
        kpCasesFiled: kpCases,
        concernsReceived: concerns,
        disbursementCount: disbursements,
        disbursementTotalCentavos: "125000000",
        csmResponses: store.Feedback?.length || 8,
        csmAverage: 4.5,
        note: "Figures represent consolidated barangay operations.",
      };
    }
  }

  // 2. POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    if (cleanPath === "/properties") {
      const newProp = {
        id: "prop-" + Math.random().toString(36).substring(2, 9),
        name: body.name,
        type: body.type,
        status: body.status,
        category: body.category,
        capacity: Number(body.capacity) || 0,
        custodian: body.custodian || null,
        addressLine: body.addressLine || null,
        description: body.description || null,
        isEvacuationCenter: Boolean(body.isEvacuationCenter),
        acquisitionCost:
          body.acquisitionCost !== undefined && body.acquisitionCost !== null ? Number(body.acquisitionCost) : null,
        acquiredAt: body.acquiredAt || new Date().toISOString(),
        source: "CBMS",
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.Property) store.Property = [];
      store.Property.push(newProp);
      saveStore(store);
      return newProp;
    }

    if (cleanPath === "/materials") {
      const newMat = {
        id: "mat-" + Math.random().toString(36).substring(2, 9),
        name: body.name,
        unit: body.unit || "units",
        quantity: Number(body.quantity) || 0,
        reorderLevel: Number(body.reorderLevel) || 0,
        location: body.location || "Barangay Stockroom",
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.Material) store.Material = [];
      store.Material.push(newMat);
      saveStore(store);
      return newMat;
    }

    if (cleanPath === "/drrm-resources") {
      const newRes = {
        id: "drr-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        name: body.name,
        type: body.type,
        quantity: Number(body.quantity) || 0,
        status: body.status || "operational",
        notes: body.notes,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.DrrmResource) store.DrrmResource = [];
      store.DrrmResource.push(newRes);
      saveStore(store);
      return newRes;
    }
  }

  // 3. DELETE requests
  if (method === "DELETE") {
    const propDelMatch = cleanPath.match(/\/properties\/([^\/]+)/);
    if (propDelMatch) {
      const id = propDelMatch[1];
      if (store.Property) {
        store.Property = store.Property.filter((x) => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }

    const matDelMatch = cleanPath.match(/\/materials\/([^\/]+)/);
    if (matDelMatch) {
      const id = matDelMatch[1];
      if (store.Material) {
        store.Material = store.Material.filter((x) => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }
  }

  return undefined;
}
