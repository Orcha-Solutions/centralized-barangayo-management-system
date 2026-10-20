import {
  STATIC_BARANGAY_ID,
  STATIC_CERTIFICATE_REQUESTS,
  STATIC_CERTIFICATE_TYPES,
} from "../staticData";
import { saveStore } from "../store";
import type { MockContext } from "./types";

export function handleDocumentsMock(ctx: MockContext): any {
  const { cleanPath, method, opts, store, currentUser } = ctx;

  // 1. GET requests
  if (method === "GET") {
    if (cleanPath === "/certificates") {
      let list = store.CertificateRequest || [];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filtered = list.filter(
          (x) => x.barangayId === currentUser.barangayId || x.barangayId === STATIC_BARANGAY_ID,
        );
        if (filtered.length > 0) list = filtered;
      }
      const resolved = list.map((c) => ({
        ...c,
        inhabitant:
          c.inhabitant ||
          store.Inhabitant?.find((i) => i.id === c.inhabitantId) || {
            firstName: "Juan",
            lastName: "Dela Cruz",
            philsysNo: "1234-5678-9012",
          },
        type:
          c.type ||
          store.CertificateType?.find((t) => t.id === c.typeId) || {
            name: "Barangay Clearance",
            code: "BC-01",
            fee: c.fee || 50,
          },
      }));
      return {
        items: resolved,
        total: resolved.length,
        page: 1,
        pageSize: 50,
      };
    }

    const certSingleMatch = cleanPath.match(/^\/certificates\/([^/]+)$/);
    if (certSingleMatch) {
      const id = certSingleMatch[1];
      const list = store.CertificateRequest || STATIC_CERTIFICATE_REQUESTS;
      const item = list.find((c: any) => c.id === id || c.referenceNo === id);
      if (!item) return null;

      const foundInh =
        item.inhabitantId && store.Inhabitant
          ? store.Inhabitant.find((i: any) => i.id === item.inhabitantId)
          : null;
      const inh =
        item.inhabitant ||
        (foundInh
          ? {
              id: foundInh.id,
              firstName: foundInh.firstName,
              lastName: foundInh.lastName,
              middleName: foundInh.middleName,
              philsysNo: foundInh.philsysCardNumber || foundInh.philsysNo || "1234-5678-9012",
              birthDate: foundInh.dateOfBirth || foundInh.birthDate || "1990-05-15",
              contactPhone: foundInh.contactNumber || foundInh.contactPhone || "0917-123-4567",
              household: {
                addressLine: foundInh.addressLine || "123 Mabini St., Barangka",
                purok: foundInh.purok || "Purok 1",
              },
            }
          : {
              id: item.inhabitantId || "uh8hppo",
              firstName: "Juan",
              lastName: "Dela Cruz",
              philsysNo: "1234-5678-9012",
              birthDate: "1990-05-15",
              contactPhone: "0917-123-4567",
              household: { addressLine: "123 Mabini St., Barangka", purok: "Purok 1" },
            });

      const type =
        item.type ||
        store.CertificateType?.find((t: any) => t.id === item.typeId) || {
          name: "Barangay Clearance",
          code: "BC-01",
          fee: item.fee || 50,
          validityDays: 180,
          requirements: ["Valid Government ID", "Proof of Residency"],
        };

      return {
        ...item,
        inhabitant: inh,
        type,
        submittedAt: item.submittedAt || item.createdAt,
        approvedAt: item.approvedAt || (item.status === "released" ? item.createdAt : null),
        releasedAt: item.releasedAt || (item.status === "released" ? item.updatedAt || item.createdAt : null),
        expiresAt:
          item.expiresAt || (item.status === "released" ? new Date(Date.now() + 180 * 86400000).toISOString() : null),
        processingMs: item.processingMs || 3600000 * 2,
      };
    }

    const certDocMatch = cleanPath.match(/^\/certificates\/([^/]+)\/document$/);
    if (certDocMatch) {
      const id = certDocMatch[1];
      const list = store.CertificateRequest || STATIC_CERTIFICATE_REQUESTS;
      const item = list.find((c: any) => c.id === id || c.referenceNo === id);
      if (!item) return null;

      const inh =
        item.inhabitant ||
        (item.inhabitantId && store.Inhabitant
          ? store.Inhabitant.find((i: any) => i.id === item.inhabitantId)
          : null);
      const inhName = inh ? `${inh.firstName} ${inh.lastName}` : "Juan Dela Cruz";
      const typeName = item.type?.name || "Barangay Clearance";

      return {
        referenceNo: item.referenceNo,
        title: typeName.toUpperCase(),
        barangay: "Barangka",
        body: `TO WHOM IT MAY CONCERN:\n\nThis is to certify that ${inhName}, of legal age, Filipino citizen, is a bonafide resident of Barangay Barangka, Marikina City.\n\nThis certification is issued upon the request of the interested party for the purpose of: ${item.purpose}.\n\nGiven this day at Barangay Barangka, City of Marikina, Philippines.`,
        issuedAt: item.releasedAt || item.updatedAt || new Date().toISOString(),
        expiresAt: item.expiresAt || new Date(Date.now() + 180 * 86400000).toISOString(),
        verifyCode: item.verifyCode || `BCMS-VERIFIED-${item.referenceNo}`,
        verifyUrl: `/portal/verify/${item.verifyCode || item.referenceNo}`,
        orNumber: item.orNumber || "OR-2026-9901",
      };
    }

    if (cleanPath === "/certificates/stats") {
      let list = store.CertificateRequest || [];
      if (!list || list.length === 0) {
        list = [...STATIC_CERTIFICATE_REQUESTS];
      }
      return {
        total: list.length,
        pendingApproval: list.filter(
          (x) => x.status === "for_approval" || x.status === "pending" || x.status === "submitted",
        ).length,
        released: list.filter(
          (x) => x.status === "released" || x.status === "signed" || x.status === "ready" || x.status === "approved",
        ).length,
        awaitingPayment: list.filter((x) => x.status === "awaiting_payment").length,
        medianProcessingHours: 2.5,
        ra11032Compliant: true,
      };
    }

    if (cleanPath === "/certificate-types") {
      return store.CertificateType || STATIC_CERTIFICATE_TYPES;
    }

    if (cleanPath === "/lgu-requests") {
      let list = store.LguDocRequest || [];
      if (currentUser.barangayId && currentUser.scope !== "city" && currentUser.scope !== "platform") {
        const filtered = list.filter((x) => x.barangayId === currentUser.barangayId);
        if (filtered.length > 0) list = filtered;
      }
      return list.map((req) => {
        const inh = store.Inhabitant?.find((i) => i.id === req.inhabitantId);
        return {
          ...req,
          inhabitant: inh || null,
        };
      });
    }

    const lguDetailMatch = cleanPath.match(/\/lgu-requests\/([^\/]+)$/);
    if (lguDetailMatch) {
      const id = lguDetailMatch[1];
      const r = store.LguDocRequest?.find((x) => x.id === id);
      if (!r) return null;
      const inh = store.Inhabitant?.find((i) => i.id === r.inhabitantId);
      return {
        ...r,
        inhabitant: inh || null,
      };
    }

    const lguTimelineMatch = cleanPath.match(/\/lgu-requests\/([^\/]+)\/timeline$/);
    if (lguTimelineMatch) {
      const id = lguTimelineMatch[1];
      const r = store.LguDocRequest?.find((x) => x.id === id);
      if (!r) return [];
      const events: any[] = [
        {
          id: "evt-1",
          action: "Endorsement Application Filed",
          description: `Initial application for ${r.docType?.replace(/_/g, " ") || "permit"} recorded.`,
          status: "pending",
          date: r.createdAt || new Date().toISOString(),
          actor: "Desk Officer / Citizen Portal",
        },
      ];
      if (r.orNumber || r.paidAt) {
        events.push({
          id: "evt-2",
          action: "Assessed Endorsement Fee Collected",
          description: `Official Receipt ${r.orNumber || "OR-VERIFIED"} issued for ₱${r.fee || 0}.`,
          status: "paid",
          date: r.paidAt || r.createdAt || new Date().toISOString(),
          actor: "Barangay Treasurer",
        });
      }
      if (r.status === "approved" || r.status === "released") {
        events.push({
          id: "evt-3",
          action: "Endorsement Clearance Approved",
          description: "Documentary verification complete. Endorsed by Punong Barangay to City LGU.",
          status: "approved",
          date: r.approvedAt || r.updatedAt || new Date().toISOString(),
          actor: "Punong Barangay",
        });
      }
      if (r.status === "released") {
        events.push({
          id: "evt-4",
          action: "Clearance Transmitted & Released",
          description: "Official signed clearance and QR verification released to citizen.",
          status: "released",
          date: r.releasedAt || r.updatedAt || new Date().toISOString(),
          actor: "Issuance & Records Officer",
        });
      }
      if (r.status === "rejected") {
        events.push({
          id: "evt-5",
          action: "Application Rejected / Returned",
          description: r.remarks || "Lacking statutory documents or inspection non-compliance.",
          status: "rejected",
          date: r.updatedAt || new Date().toISOString(),
          actor: "Barangay Secretary",
        });
      }
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return events;
    }
  }

  // 2. POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    const certApproveMatch = cleanPath.match(/^\/certificates\/([^/]+)\/approve$/);
    if (certApproveMatch) {
      const id = certApproveMatch[1];
      if (!store.CertificateRequest) store.CertificateRequest = [...STATIC_CERTIFICATE_REQUESTS];
      const item = store.CertificateRequest.find((c: any) => c.id === id || c.referenceNo === id);
      if (!item) {
        const err: any = new Error("Certificate request not found.");
        err.status = 404;
        throw err;
      }
      item.status = "released";
      item.approvedAt = new Date().toISOString();
      item.releasedAt = new Date().toISOString();
      item.updatedAt = new Date().toISOString();
      if (!item.verifyCode) {
        item.verifyCode = `BCMS-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`;
      }
      saveStore(store);
      return { ok: true, request: item };
    }

    const certRejectMatch = cleanPath.match(/^\/certificates\/([^/]+)\/reject$/);
    if (certRejectMatch) {
      const id = certRejectMatch[1];
      if (!store.CertificateRequest) store.CertificateRequest = [...STATIC_CERTIFICATE_REQUESTS];
      const item = store.CertificateRequest.find((c: any) => c.id === id || c.referenceNo === id);
      if (!item) {
        const err: any = new Error("Certificate request not found.");
        err.status = 404;
        throw err;
      }
      item.status = "rejected";
      item.rejectedReason = body.reason || "Requirements not fulfilled.";
      item.updatedAt = new Date().toISOString();
      saveStore(store);
      return { ok: true, request: item };
    }

    if (cleanPath === "/certificates") {
      const newReq = {
        id: "cert-" + Math.random().toString(36).substring(2, 9),
        inhabitantId: currentUser.inhabitantId || "res1-inhabitant",
        typeId: body.typeId,
        purpose: body.purpose,
        status: "pending",
        barangayId: currentUser.barangayId || "barangka",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.CertificateRequest) store.CertificateRequest = [];
      store.CertificateRequest.push(newReq);
      saveStore(store);
      return newReq;
    }

    if (cleanPath === "/lgu-requests") {
      const newReq = {
        id: "lgu-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || "barangka",
        inhabitantId: body.inhabitantId || currentUser.inhabitantId || "res1-inhabitant",
        docType: body.docType || "business_permit",
        purpose: body.purpose || "",
        status: body.status || "pending",
        referenceNo: body.referenceNo || `LGU-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
        fee: Number(body.fee) || 0,
        paidAt: body.paidAt || null,
        orNumber: body.orNumber || "",
        remarks: body.remarks || "",
        attachmentName: body.attachmentName || "",
        attachmentUrl: body.attachmentUrl || "",
        approvedAt: body.status === "approved" ? new Date().toISOString() : null,
        releasedAt: body.status === "released" ? new Date().toISOString() : null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.LguDocRequest) store.LguDocRequest = [];
      store.LguDocRequest.push(newReq);
      saveStore(store);
      return newReq;
    }
  }

  // 3. DELETE requests
  if (method === "DELETE") {
    const lguMatch = cleanPath.match(/\/lgu-requests\/([^\/]+)/);
    if (lguMatch) {
      const id = lguMatch[1];
      if (store.LguDocRequest) {
        store.LguDocRequest = store.LguDocRequest.filter((x) => x.id !== id);
        saveStore(store);
      }
      return { success: true };
    }

    const certDelMatch = cleanPath.match(/\/certificates\/([^\/]+)/);
    if (certDelMatch) {
      const id = certDelMatch[1];
      if (store.CertificateRequest) {
        store.CertificateRequest = store.CertificateRequest.filter(
          (x) => x.id !== id && x.referenceNo !== id,
        );
        saveStore(store);
      }
      return { success: true };
    }
  }

  return undefined;
}
