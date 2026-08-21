import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@cbms/db";
import { buildContext } from "../context.js";
import { serialize } from "./_crud.js";

/** A2 — Issuance Management (BCIS front-end + payment). */
export async function issuanceRoutes(app: FastifyInstance) {
  app.get("/certificate-types", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("issuance", "view");
    const items = await ctx.db.certificateType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return { items: serialize(items) };
  });

  app.get("/certificates", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("issuance", "view");
    const q = z
      .object({
        q: z.string().optional(),
        status: z.string().optional(),
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().max(200).default(25),
      })
      .parse(req.query ?? {});

    const where: Record<string, unknown> = {};
    if (q.status && q.status !== "all") where.status = q.status;
    if (q.q) {
      where.OR = [
        { referenceNo: { contains: q.q, mode: "insensitive" } },
        { purpose: { contains: q.q, mode: "insensitive" } },
        { inhabitant: { lastName: { contains: q.q, mode: "insensitive" } } },
      ];
    }

    const [items, total] = await Promise.all([
      ctx.db.certificateRequest.findMany({
        where,
        include: {
          type: { select: { name: true, code: true } },
          inhabitant: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      ctx.db.certificateRequest.count({ where }),
    ]);
    return { items: serialize(items), total, page: q.page, pageSize: q.pageSize };
  });

  app.get("/certificates/stats", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("issuance", "view");
    const scope = ctx.principal.barangayId ? { barangayId: ctx.principal.barangayId } : {};
    const [total, pending, released, awaitingPayment, released30] = await Promise.all([
      prisma.certificateRequest.count({ where: scope }),
      prisma.certificateRequest.count({ where: { ...scope, status: "for_approval" } }),
      prisma.certificateRequest.count({ where: { ...scope, status: "released" } }),
      prisma.certificateRequest.count({ where: { ...scope, status: "awaiting_payment" } }),
      prisma.certificateRequest.findMany({
        where: {
          ...scope,
          status: "released",
          releasedAt: { gte: new Date(Date.now() - 30 * 86400_000) },
        },
        select: { processingMs: true },
      }),
    ]);
    const times = released30.map((r) => r.processingMs ?? 0).filter(Boolean).sort((a, b) => a - b);
    const medianMs = times.length ? times[Math.floor(times.length / 2)]! : 0;
    return {
      total,
      pendingApproval: pending,
      released,
      awaitingPayment,
      medianProcessingHours: Math.round((medianMs / 3600_000) * 10) / 10,
      // RA 11032: simple transactions should complete within 3 working days.
      ra11032Compliant: medianMs <= 3 * 24 * 3600_000,
    };
  });

  app.get("/certificates/:id", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("issuance", "view");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = await ctx.db.certificateRequest.findFirst({
      where: { id },
      include: { type: true, inhabitant: { include: { household: true } }, feedback: true },
    });
    if (!item) return reply.status(404).send({ error: "NotFound", message: "Not found." });
    return serialize(item);
  });

  app.post("/certificates", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("issuance", "encode");
    const body = z
      .object({
        typeId: z.string(),
        inhabitantId: z.string(),
        purpose: z.string().min(3),
      })
      .parse(req.body);

    const type = await ctx.db.certificateType.findFirst({ where: { id: body.typeId } });
    if (!type) return reply.status(404).send({ error: "NotFound", message: "Certificate type not found." });

    const barangayId = ctx.principal.barangayId!;
    const count = await prisma.certificateRequest.count({ where: { barangayId } });
    const feeNum = Number(type.fee);

    const created = await ctx.db.certificateRequest.create({
      data: {
        typeId: type.id,
        inhabitantId: body.inhabitantId,
        purpose: body.purpose,
        referenceNo: `CR-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`,
        fee: type.fee,
        status: feeNum > 0 ? "awaiting_payment" : "for_approval",
      },
      include: { type: true },
    });
    await ctx.audit({
      action: "issuance.create",
      entity: "CertificateRequest",
      entityId: created.id,
      diff: { type: type.code },
    });
    return reply.status(201).send(serialize(created));
  });

  /** A human always signs — the Punong Barangay approves. */
  app.post("/certificates/:id/approve", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("issuance", "approve");
    const { id } = z.object({ id: z.string() }).parse(req.params);

    const cr = await ctx.db.certificateRequest.findFirst({ where: { id }, include: { type: true } });
    if (!cr) return reply.status(404).send({ error: "NotFound", message: "Not found." });
    if (!["for_approval", "paid"].includes(cr.status)) {
      return reply.status(409).send({
        error: "Conflict",
        message: `Request is '${cr.status}'. It must be paid/for_approval before approval.`,
      });
    }

    const now = new Date();
    const updated = await ctx.db.certificateRequest.update({
      where: { id },
      data: {
        status: "released",
        approvedById: ctx.principal.userId,
        approvedAt: now,
        issuedAt: now,
        releasedAt: now,
        expiresAt: new Date(now.getTime() + cr.type.validityDays * 86400_000),
        verifyCode: crypto.randomBytes(6).toString("hex").toUpperCase(),
        processingMs: now.getTime() - cr.submittedAt.getTime(),
      },
    });
    await ctx.audit({
      action: "issuance.approve",
      entity: "CertificateRequest",
      entityId: id,
      diff: { verifyCode: updated.verifyCode },
    });
    return serialize(updated);
  });

  app.post("/certificates/:id/reject", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("issuance", "approve");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const { reason } = z.object({ reason: z.string().min(3) }).parse(req.body);
    const updated = await ctx.db.certificateRequest.update({
      where: { id },
      data: { status: "rejected", rejectedReason: reason },
    });
    await ctx.audit({ action: "issuance.reject", entity: "CertificateRequest", entityId: id, diff: { reason } });
    return serialize(updated);
  });

  /** Rendered certificate body (the client turns this into a PDF). */
  app.get("/certificates/:id/document", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("issuance", "view");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const cr = await ctx.db.certificateRequest.findFirst({
      where: { id },
      include: { type: true, inhabitant: { include: { household: true } }, barangay: true },
    });
    if (!cr) return reply.status(404).send({ error: "NotFound", message: "Not found." });
    if (cr.status !== "released") {
      return reply.status(409).send({ error: "Conflict", message: "Certificate is not yet released." });
    }

    const inh = cr.inhabitant;
    const age = Math.floor((Date.now() - inh.birthDate.getTime()) / (365.25 * 86400_000));
    const body = (cr.type.templateBody ?? "")
      .replace(/{{fullName}}/g, `${inh.firstName} ${inh.middleName ?? ""} ${inh.lastName}`.replace(/\s+/g, " ").trim())
      .replace(/{{age}}/g, String(age))
      .replace(/{{barangay}}/g, cr.barangay.name)
      .replace(/{{purpose}}/g, cr.purpose)
      .replace(/{{date}}/g, (cr.issuedAt ?? new Date()).toLocaleDateString("en-PH", { dateStyle: "long" }));

    return serialize({
      referenceNo: cr.referenceNo,
      title: cr.type.name,
      barangay: cr.barangay.name,
      body,
      issuedAt: cr.issuedAt,
      expiresAt: cr.expiresAt,
      verifyCode: cr.verifyCode,
      verifyUrl: `/verify/${cr.verifyCode}`,
      orNumber: cr.orNumber,
    });
  });
}
