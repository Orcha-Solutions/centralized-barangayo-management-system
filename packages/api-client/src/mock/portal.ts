import { STATIC_BARANGAY_ID } from "../staticData";
import { saveStore } from "../store";
import type { MockContext } from "./types";

export function handlePortalMock(ctx: MockContext): any {
  const { cleanPath, method, opts, store, currentUser } = ctx;

  // 1. GET requests
  if (method === "GET") {
    if (cleanPath === "/me/profile") {
      return store.Inhabitant?.find((i) => i.id === currentUser.inhabitantId) || store.Inhabitant?.[0] || {};
    }

    if (cleanPath === "/me/requests") {
      return (store.CertificateRequest || [])
        .filter((x) => x.inhabitantId === currentUser.inhabitantId)
        .map((c) => ({
          ...c,
          type: store.CertificateType?.find((t) => t.id === c.typeId),
        }));
    }

    if (cleanPath === "/me/concerns") {
      return (store.Concern || []).filter(
        (x) => x.userId === currentUser.id || x.barangayId === currentUser.barangayId,
      );
    }

    if (cleanPath === "/me/data-export") {
      return { message: "Mock data export generated successfully." };
    }

    if (cleanPath === "/audit") {
      let logs = store.AuditLog || [];
      if (!logs || logs.length === 0) {
        logs = [
          {
            id: "aud-01",
            barangayId: STATIC_BARANGAY_ID,
            actorRole: "BARANGAY_SECRETARY",
            actor: { fullName: "Lourdes Bautista", email: "secretary@barangka.gov.ph" },
            action: "inhabitant.create",
            entity: "Inhabitant",
            entityId: "inh-101",
            ip: "192.168.1.12",
            isAiAction: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          },
          {
            id: "aud-02",
            barangayId: STATIC_BARANGAY_ID,
            actorRole: "BARANGAY_TREASURER",
            actor: { fullName: "Teresa Morales", email: "treasurer@barangka.gov.ph" },
            action: "receipt.issue",
            entity: "OfficialReceipt",
            entityId: "or-2026-001",
            ip: "192.168.1.15",
            isAiAction: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          },
          {
            id: "aud-03",
            barangayId: STATIC_BARANGAY_ID,
            actorRole: "PUNONG_BARANGAY",
            actor: { fullName: "Eduardo M. Santos", email: "kapitan@barangka.gov.ph" },
            action: "disbursement.approve",
            entity: "DisbursementBatch",
            entityId: "db-01",
            ip: "192.168.1.10",
            isAiAction: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          },
          {
            id: "aud-04",
            barangayId: STATIC_BARANGAY_ID,
            actorRole: "AI",
            actor: { fullName: "CBMS AI Assistant", email: "ai@cbms.internal" },
            action: "ai.document_summary.generate",
            entity: "BlotterEntry",
            entityId: "blt-2026-004",
            ip: "127.0.0.1",
            isAiAction: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          },
        ];
      }
      return {
        items: logs,
      };
    }

    if (cleanPath === "/users") {
      const defaultUsers = [
        {
          id: "usr-sec",
          fullName: "Lourdes Bautista",
          email: "secretary@barangka.gov.ph",
          role: "BARANGAY_SECRETARY",
          isActive: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
        {
          id: "usr-treas",
          fullName: "Teresa Morales",
          email: "treasurer@barangka.gov.ph",
          role: "BARANGAY_TREASURER",
          isActive: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
        {
          id: "usr-kap",
          fullName: "Eduardo M. Santos",
          email: "kapitan@barangka.gov.ph",
          role: "PUNONG_BARANGAY",
          isActive: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
        {
          id: "usr-lupon",
          fullName: "Atty. Fernando Cruz",
          email: "lupon@barangka.gov.ph",
          role: "LUPON_SECRETARY",
          isActive: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
        {
          id: "usr-vaw",
          fullName: "Elena Rivera",
          email: "vawdesk@barangka.gov.ph",
          role: "VAW_DESK_OFFICER",
          isActive: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
        {
          id: "usr-tanod",
          fullName: "Rommel Reyes",
          email: "tanod@barangka.gov.ph",
          role: "TANOD",
          isActive: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
        {
          id: "usr-bhw",
          fullName: "Corazon Del Rosario",
          email: "bhw@barangka.gov.ph",
          role: "BHW",
          isActive: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
        {
          id: "usr-it",
          fullName: "Marc Jason Alcantara",
          email: "it@barangka.gov.ph",
          role: "IT_OFFICER",
          isActive: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        },
      ];

      if (!store.User || store.User.length === 0) {
        store.User = defaultUsers;
        saveStore(store);
      } else {
        store.User.forEach((u: any) => {
          if (u.canCreate === undefined) u.canCreate = u.isActive !== false;
          if (u.canRead === undefined) u.canRead = true;
          if (u.canUpdate === undefined) u.canUpdate = u.isActive !== false;
          if (u.canDelete === undefined) u.canDelete = u.isActive !== false;
        });
      }

      return {
        items: store.User,
      };
    }
  }

  // 2. POST requests
  if (method === "POST") {
    const body = opts.body ? JSON.parse(opts.body as string) : {};

    const userStatusMatch = cleanPath.match(/\/users\/([^\/]+)\/status$/);
    if (userStatusMatch) {
      const uId = userStatusMatch[1];
      let user = store.User?.find((u: any) => u.id === uId || u.email === uId);
      if (!user) {
        user = {
          id: uId,
          fullName: body.fullName || "Barangay Staff",
          email: body.email || `${uId}@barangka.gov.ph`,
          role: body.role || "staff",
          isActive: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
        };
        if (!store.User) store.User = [];
        store.User.push(user);
      }

      let auditAction = "user.update_security";

      if (body.canCreate !== undefined) {
        user.canCreate = Boolean(body.canCreate);
        auditAction = user.canCreate ? "user.enable_create" : "user.disable_create";
      }
      if (body.canRead !== undefined) {
        user.canRead = Boolean(body.canRead);
        auditAction = user.canRead ? "user.enable_read" : "user.disable_read";
      }
      if (body.canUpdate !== undefined) {
        user.canUpdate = Boolean(body.canUpdate);
        auditAction = user.canUpdate ? "user.enable_update" : "user.disable_update";
      }
      if (body.canDelete !== undefined) {
        user.canDelete = Boolean(body.canDelete);
        auditAction = user.canDelete ? "user.enable_delete" : "user.disable_delete";
      }
      if (body.isActive !== undefined) {
        user.isActive = Boolean(body.isActive);
        auditAction = user.isActive ? "user.enable_account" : "user.disable_account";
      }

      user.updatedAt = new Date().toISOString();

      const auditEntry = {
        id: "aud-" + Math.random().toString(36).substring(2, 9),
        barangayId: currentUser.barangayId || STATIC_BARANGAY_ID,
        actorId: currentUser.id || "usr-it",
        actorRole: currentUser.roles?.[0] || "IT_OFFICER",
        actor: {
          fullName: currentUser.fullName || "Marc Jason Alcantara (IT Officer)",
          email: currentUser.email || "it@barangka.gov.ph",
        },
        action: auditAction,
        entity: "User",
        entityId: user.id,
        isAiAction: false,
        ip: "192.168.1.105 (IT Sec Console)",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!store.AuditLog) store.AuditLog = [];
      store.AuditLog.unshift(auditEntry);

      saveStore(store);
      return { success: true, user, audit: auditEntry };
    }
  }

  return undefined;
}
