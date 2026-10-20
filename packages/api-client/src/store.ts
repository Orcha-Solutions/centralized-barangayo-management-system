import seedData from "./seed.json";
import type { SessionUser } from "./types";
import { getRolePermissions } from "./session";
import {
  STATIC_BARANGAY_ID,
  STATIC_CERTIFICATE_TYPES,
  STATIC_CERTIFICATE_REQUESTS,
  STATIC_LGU_REQUESTS,
  STATIC_BLOTTER_ENTRIES,
  STATIC_KP_CASES,
  STATIC_SOS_ALERTS,
  STATIC_LEDGER_ENTRIES,
  STATIC_OFFICIAL_RECEIPTS,
  STATIC_BUDGETS,
  STATIC_RPT_PROPERTIES,
  STATIC_RPT_TAX_DUES,
  STATIC_DISBURSEMENT_BATCHES,
  STATIC_DISBURSEMENT_ITEMS,
  STATIC_PROPERTIES,
  STATIC_MATERIALS,
  STATIC_CONCERNS,
  STATIC_TICKETS,
  STATIC_APPOINTMENTS,
} from "./staticData";

let _inMemoryStore: Record<string, any[]> | null = null;

export function getStore(): Record<string, any[]> {
  if (typeof window === "undefined") return seedData as unknown as Record<string, any[]>;
  if (!_inMemoryStore) {
    try {
      window.localStorage.removeItem("cbms.store");
      window.localStorage.removeItem("cbms.store_v2");
      window.localStorage.removeItem("cbms.store_v3");
    } catch {}

    const initializedStore: Record<string, any[]> = JSON.parse(JSON.stringify(seedData));

    try {
      const delta = window.localStorage.getItem("cbms.mutations");
      if (delta) {
        const parsed = JSON.parse(delta);
        for (const [k, v] of Object.entries(parsed)) {
          if (Array.isArray(v)) initializedStore[k] = v;
        }
      }
    } catch {}

    initializedStore.LguDocRequest = [
      ...STATIC_LGU_REQUESTS,
      ...(initializedStore.LguDocRequest || []).filter((x) => !STATIC_LGU_REQUESTS.some((s) => s.id === x.id)),
    ];
    initializedStore.CertificateType = [
      ...STATIC_CERTIFICATE_TYPES,
      ...(initializedStore.CertificateType || []).filter((x) => !STATIC_CERTIFICATE_TYPES.some((s) => s.id === x.id)),
    ];
    initializedStore.CertificateRequest = [
      ...STATIC_CERTIFICATE_REQUESTS,
      ...(initializedStore.CertificateRequest || []).filter((x) => !STATIC_CERTIFICATE_REQUESTS.some((s) => s.id === x.id)),
    ];
    initializedStore.BlotterEntry = [
      ...STATIC_BLOTTER_ENTRIES,
      ...(initializedStore.BlotterEntry || []).filter((x) => !STATIC_BLOTTER_ENTRIES.some((s) => s.id === x.id)),
    ];
    initializedStore.KpCase = [
      ...STATIC_KP_CASES,
      ...(initializedStore.KpCase || []).filter((x) => !STATIC_KP_CASES.some((s) => s.id === x.id)),
    ];
    initializedStore.SosAlert = [
      ...STATIC_SOS_ALERTS,
      ...(initializedStore.SosAlert || []).filter((x) => !STATIC_SOS_ALERTS.some((s) => s.id === x.id)),
    ];
    initializedStore.LedgerEntry = [
      ...STATIC_LEDGER_ENTRIES,
      ...(initializedStore.LedgerEntry || []).filter((x) => !STATIC_LEDGER_ENTRIES.some((s) => s.id === x.id)),
    ];
    initializedStore.OfficialReceipt = [
      ...STATIC_OFFICIAL_RECEIPTS,
      ...(initializedStore.OfficialReceipt || []).filter((x) => !STATIC_OFFICIAL_RECEIPTS.some((s) => s.id === x.id)),
    ];
    initializedStore.Budget = [
      ...STATIC_BUDGETS,
      ...(initializedStore.Budget || []).filter((x) => !STATIC_BUDGETS.some((s) => s.id === x.id)),
    ];
    initializedStore.RptProperty = [
      ...STATIC_RPT_PROPERTIES,
      ...(initializedStore.RptProperty || []).filter((x) => !STATIC_RPT_PROPERTIES.some((s) => s.id === x.id)),
    ];
    initializedStore.RptTaxDue = [
      ...STATIC_RPT_TAX_DUES,
      ...(initializedStore.RptTaxDue || []).filter((x) => !STATIC_RPT_TAX_DUES.some((s) => s.id === x.id)),
    ];
    initializedStore.DisbursementBatch = [
      ...STATIC_DISBURSEMENT_BATCHES,
      ...(initializedStore.DisbursementBatch || []).filter((x) => !STATIC_DISBURSEMENT_BATCHES.some((s) => s.id === x.id)),
    ];
    initializedStore.DisbursementBatchItem = [
      ...STATIC_DISBURSEMENT_ITEMS,
      ...(initializedStore.DisbursementBatchItem || []).filter((x) => !STATIC_DISBURSEMENT_ITEMS.some((s) => s.id === x.id)),
    ];
    initializedStore.Property = [
      ...STATIC_PROPERTIES,
      ...(initializedStore.Property || []).filter((x) => !STATIC_PROPERTIES.some((s) => s.id === x.id)),
    ];
    initializedStore.Material = [
      ...STATIC_MATERIALS,
      ...(initializedStore.Material || []).filter((x) => !STATIC_MATERIALS.some((s) => s.id === x.id)),
    ];
    initializedStore.Concern = [
      ...STATIC_CONCERNS,
      ...(initializedStore.Concern || []).filter((x) => !STATIC_CONCERNS.some((s) => s.id === x.id)),
    ];
    initializedStore.Ticket = [
      ...STATIC_TICKETS,
      ...(initializedStore.Ticket || []).filter((x) => !STATIC_TICKETS.some((s) => s.id === x.id)),
    ];
    initializedStore.Appointment = [
      ...STATIC_APPOINTMENTS,
      ...(initializedStore.Appointment || []).filter((x) => !STATIC_APPOINTMENTS.some((s) => s.id === x.id)),
    ];

    _inMemoryStore = initializedStore;
  }
  return _inMemoryStore;
}

export function saveStore(store: Record<string, any[]>) {
  _inMemoryStore = store;
  if (typeof window === "undefined") return;
  try {
    const delta: Record<string, any[]> = {
      CertificateRequest: store.CertificateRequest,
      LguDocRequest: store.LguDocRequest,
      BlotterEntry: store.BlotterEntry,
      KpCase: store.KpCase,
      SosAlert: store.SosAlert,
      Household: store.Household,
      Concern: store.Concern,
      Appointment: store.Appointment,
      Property: store.Property,
      Material: store.Material,
      Ticket: store.Ticket,
    };
    window.localStorage.setItem("cbms.mutations", JSON.stringify(delta));
  } catch {}
}

export function mockSessionUser(email: string): SessionUser {
  const emailClean = (email || "").toLowerCase().trim();

  if (emailClean.includes("bdc")) {
    return {
      id: "usr-bdc",
      fullName: "Engr. Roberto Gomez (BDC Chair)",
      email: "bdc@barangka.gov.ph",
      roles: ["BDC_OFFICER"],
      scope: "barangay",
      permissions: getRolePermissions("BDC_OFFICER"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  if (emailClean.includes("vaw")) {
    return {
      id: "usr-vaw",
      fullName: "Elena Rivera (VAW Desk Officer)",
      email: "vawdesk@barangka.gov.ph",
      roles: ["VAW_DESK_OFFICER"],
      scope: "barangay",
      permissions: getRolePermissions("VAW_DESK_OFFICER"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  if (emailClean.includes("lupon")) {
    return {
      id: "usr-lupon",
      fullName: "Atty. Fernando Cruz (Lupon Secretary)",
      email: "lupon@barangka.gov.ph",
      roles: ["LUPON_SECRETARY"],
      scope: "barangay",
      permissions: getRolePermissions("LUPON_SECRETARY"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  if (emailClean.includes("treasurer")) {
    return {
      id: "usr-treas",
      fullName: "Teresa Morales (Barangay Treasurer)",
      email: "treasurer@barangka.gov.ph",
      roles: ["BARANGAY_TREASURER"],
      scope: "barangay",
      permissions: getRolePermissions("BARANGAY_TREASURER"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  if (emailClean.includes("tanod")) {
    return {
      id: "usr-tanod",
      fullName: "Executive Officer Rommel Reyes (Tanod)",
      email: "tanod@barangka.gov.ph",
      roles: ["TANOD"],
      scope: "barangay",
      permissions: getRolePermissions("TANOD"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  if (emailClean.includes("bdrrmc") || emailClean.includes("drrm")) {
    return {
      id: "usr-bdrrmc",
      fullName: "Capt. Danilo Cruz (BDRRMC Chief)",
      email: "bdrrmc@barangka.gov.ph",
      roles: ["BDRRMC_OFFICER"],
      scope: "barangay",
      permissions: getRolePermissions("BDRRMC_OFFICER"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  if (emailClean.includes("secretary")) {
    return {
      id: "usr-sec",
      fullName: "Lourdes Bautista (Barangay Secretary)",
      email: "secretary@barangka.gov.ph",
      roles: ["BARANGAY_SECRETARY"],
      scope: "barangay",
      permissions: getRolePermissions("BARANGAY_SECRETARY"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  if (emailClean.includes("bhw")) {
    return {
      id: "usr-bhw",
      fullName: "Corazon Del Rosario (BHW Lead)",
      email: "bhw@barangka.gov.ph",
      roles: ["BHW"],
      scope: "barangay",
      permissions: getRolePermissions("BHW"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  if (emailClean.includes("kapitan")) {
    return {
      id: "usr-kap",
      fullName: "Eduardo M. Santos (Punong Barangay)",
      email: "kapitan@barangka.gov.ph",
      roles: ["PUNONG_BARANGAY"],
      scope: "barangay",
      permissions: getRolePermissions("PUNONG_BARANGAY"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  if (emailClean.includes("lgu")) {
    return {
      id: "usr-lgu",
      fullName: "Mayor Marikina Admin",
      email: "lgu@marikina.gov.ph",
      roles: ["LGU_ADMIN"],
      scope: "city",
      permissions: getRolePermissions("LGU_ADMIN"),
      cityId: "marikina",
    };
  }

  if (emailClean.includes("it") || emailClean.includes("sysadmin") || emailClean.includes("admin.it")) {
    return {
      id: "usr-it",
      fullName: "Marc Jason Alcantara (IT Officer)",
      email: "it@barangka.gov.ph",
      roles: ["IT_OFFICER"],
      scope: "barangay",
      permissions: getRolePermissions("IT_OFFICER"),
      barangayId: STATIC_BARANGAY_ID,
      barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
    };
  }

  const store = getStore();
  const user = store.User?.find((u) => u.email?.toLowerCase() === emailClean);

  if (user) {
    const userRole = store.UserRole?.find((ur) => ur.userId === user.id);
    const roleObj = store.Role?.find((r) => r.id === userRole?.roleId);
    const roleKey = roleObj?.key || "RESIDENT";
    const brgy = store.Barangay?.find((b) => b.id === user.barangayId);

    return {
      id: user.id,
      fullName: user.fullName || "User",
      email: user.email,
      roles: [roleKey],
      scope:
        roleKey === "LGU_ADMIN"
          ? "city"
          : roleKey === "DILG_VIEWER"
            ? "platform"
            : roleKey === "RESIDENT"
              ? "self"
              : "barangay",
      permissions: getRolePermissions(roleKey),
      barangayId: user.barangayId,
      cityId: user.cityId,
      inhabitantId: user.inhabitantId,
      barangay: brgy ? { id: brgy.id, name: brgy.name } : null,
    };
  }

  return {
    id: "usr-res1",
    fullName: "Resident Cardo Dalisay",
    email: email || "resident1@example.ph",
    roles: ["RESIDENT"],
    scope: "self",
    permissions: getRolePermissions("RESIDENT"),
    barangayId: STATIC_BARANGAY_ID,
    inhabitantId: "res1-inhabitant",
    barangay: { id: STATIC_BARANGAY_ID, name: "Barangka" },
  };
}
