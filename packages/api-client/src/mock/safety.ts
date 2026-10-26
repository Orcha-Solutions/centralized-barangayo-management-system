import { STATIC_BARANGAY_ID, STATIC_KP_CASES } from "../staticData";
import { saveStore } from "../store";
import type { MockContext } from "./types";

export function handleSafetyMock(ctx: MockContext): any {
  const { cleanPath, method, opts, store, currentUser } = ctx;

  // 1. GET requests
  if (method === "GET") {
    if (cleanPath === "/kp/cases") {
      let list = store.KpCase || [];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filtered = list.filter(
          (x) => x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID,
        );
        if (filtered.length > 0) list = filtered;
      }
      return {
        items: list,
        total: list.length,
        page: 1,
        pageSize: 50,
      };
    }

    if (cleanPath === "/kp/deadlines") {
      const list = store.KpCase || STATIC_KP_CASES;
      const atRisk = list
        .filter((x) => x.stage !== "closed" && x.stage !== "settled")
        .map((c) => ({
          caseId: c.id,
          caseNumber: c.caseNo || c.caseNumber || c.id,
          subject: c.subject,
          stage: c.stage,
          daysRemaining: c.deadline?.daysRemaining ?? 5,
          deadline: c.deadline?.target || new Date(Date.now() + 86400000 * 5).toISOString(),
          breached: c.deadline?.isPast ?? false,
        }));
      return {
        items: atRisk,
        total: atRisk.length,
        breached: atRisk.filter((x) => x.breached).length,
      };
    }

    const blotterDetailMatch = cleanPath.match(/\/blotters?\/([^\/]+)$/);
    if (blotterDetailMatch) {
      const bId = blotterDetailMatch[1];
      const list = store.BlotterEntry || [];
      const item = list.find((b: any) => b.id === bId || b.entryNo === bId);
      if (!item) {
        throw new Error("Blotter entry not found.");
      }
      return item;
    }

    const kpDetailMatch = cleanPath.match(/\/kp\/cases\/([^\/]+)$/);
    if (kpDetailMatch) {
      const kId = kpDetailMatch[1];
      const list = store.KpCase || STATIC_KP_CASES;
      const item = list.find((k: any) => k.id === kId || k.caseNo === kId || k.caseNumber === kId);
      if (!item) {
        throw new Error("KP case not found.");
      }
      return item;
    }

    if (cleanPath === "/blotter" || cleanPath === "/blotters") {
      let list = store.BlotterEntry || [];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filtered = list.filter(
          (x) => x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID,
        );
        if (filtered.length > 0) list = filtered;
      }
      return {
        data: list,
        items: list,
        total: list.length,
        page: 1,
        pageSize: 50,
      };
    }

    if (cleanPath === "/sos") {
      let list = store.SosAlert || [];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filtered = list.filter(
          (x) => x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID,
        );
        if (filtered.length > 0) list = filtered;
      }
      return {
        items: list,
        total: list.length,
      };
    }
  }

  // 2. POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    const blotterActionMatch = cleanPath.match(/\/blotters?\/([^\/]+)\/actions$/);
    if (blotterActionMatch) {
      const bId = blotterActionMatch[1];
      const list = store.BlotterEntry || [];
      const item = list.find((b: any) => b.id === bId || b.entryNo === bId);
      if (!item) {
        throw new Error("Blotter entry not found.");
      }
      const newAction = {
        id: `act-${Date.now()}`,
        actionTaken: body?.actionTaken || "Action Recorded",
        officerName: body?.officerName || currentUser.fullName || "Barangay Officer",
        officerRole:
          body?.officerRole ||
          (currentUser.roles?.[0] ? currentUser.roles[0].replace(/_/g, " ") : "Duty Officer"),
        notes: body?.notes || "",
        statusAfter: body?.statusAfter || item.status || "active",
        timestamp: new Date().toISOString(),
        documentRef: body?.documentRef || null,
      };
      item.actionsTaken = [...(item.actionsTaken || []), newAction];
      if (body?.statusAfter) {
        item.status = body.statusAfter;
      }
      saveStore(store);
      return item;
    }

    if (cleanPath === "/sos") {
      const newAlert = {
        id: "sos-" + Math.random().toString(36).substring(2, 9),
        location: body.location || "Unknown location",
        status: "active",
        barangayId: currentUser.barangayId || "barangka",
        inhabitantId: currentUser.inhabitantId || "res1-inhabitant",
        createdAt: new Date().toISOString(),
      };
      if (!store.SosAlert) store.SosAlert = [];
      store.SosAlert.push(newAlert);
      saveStore(store);
      return newAlert;
    }

    if (cleanPath === "/blotter" || cleanPath === "/blotters") {
      const entryNum = "BLT-2026-" + Math.floor(100 + Math.random() * 900);
      const newBlotter = {
        id: "blt-" + Math.random().toString(36).substring(2, 9),
        entryNo: body.entryNo || entryNum,
        incidentNo: entryNum,
        category: body.category || "dispute",
        incidentAt: body.incidentAt || new Date().toISOString(),
        location: body.location || "Barangay Barangka",
        narrative: body.narrative || "",
        reportedBy: body.reportedBy || "Citizen",
        respondentName: body.respondentName || "",
        status: body.status || "active",
        barangayId: currentUser.barangayId || "van6rdk",
        createdAt: new Date().toISOString(),
      };
      if (!store.BlotterEntry) store.BlotterEntry = [];
      store.BlotterEntry.unshift(newBlotter);
      saveStore(store);
      return newBlotter;
    }

    if (cleanPath === "/kp/cases") {
      const newCase = {
        id: "kp-" + Math.random().toString(36).substring(2, 9),
        caseNumber: "KP-2026-" + Math.floor(100 + Math.random() * 900),
        subject: body.subject || "Community Dispute",
        description: body.description || "",
        complainant: currentUser.fullName || "Citizen",
        respondentName: body.respondentName || "",
        stage: "filed",
        filedAt: new Date().toISOString(),
        deadlineAt: new Date(Date.now() + 86400000 * 14).toISOString(),
        isConfidential: !!body.isConfidential,
        barangayId: currentUser.barangayId || "van6rdk",
        createdAt: new Date().toISOString(),
      };
      if (!store.KpCase) store.KpCase = [];
      store.KpCase.unshift(newCase);
      saveStore(store);
      return newCase;
    }

    const sosRespondMatch = cleanPath.match(/\/sos\/([^\/]+)\/respond/);
    if (sosRespondMatch) {
      const id = sosRespondMatch[1];
      const alert = (store.SosAlert || []).find((a) => a.id === id);
      if (alert) {
        alert.status = body.status || "dispatched";
        alert.responseNote = body.responseNote || null;
        alert.respondedAt = new Date().toISOString();
        saveStore(store);
      }
      return alert || {};
    }
  }

  return undefined;
}
