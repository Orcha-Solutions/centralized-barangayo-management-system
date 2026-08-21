import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@cbms/db";
import { canSeeConfidentialCase } from "@cbms/rbac";
import { buildContext } from "../context.js";
import { serialize } from "./_crud.js";

/**
 * A3 — Katarungang Pambarangay & Blotter (KPISBH).
 * Statutory timelines per RA 7160 §410: 15 days mediation (Punong Barangay),
 * then 15 days conciliation by the Pangkat, extendable by 15.
 */

export const KP_MEDIATION_DAYS = 15;
export const KP_CONCILIATION_DAYS = 15;
export const KP_EXTENSION_DAYS = 15;

export function computeKpDeadlines(filedAt: Date) {
  const d = (n: number) => new Date(filedAt.getTime() + n * 86400_000);
  return {
    mediationDueAt: d(KP_MEDIATION_DAYS),
    conciliationDueAt: d(KP_MEDIATION_DAYS + KP_CONCILIATION_DAYS),
    extendedDueAt: d(KP_MEDIATION_DAYS + KP_CONCILIATION_DAYS + KP_EXTENSION_DAYS),
  };
}

/** Which deadline currently governs, and whether it has been breached. */
export function kpDeadlineStatus(
  stage: string,
  filedAt: Date,
  now = new Date(),
): { dueAt: Date | null; daysRemaining: number | null; breached: boolean } {
  const dl = computeKpDeadlines(filedAt);
  let dueAt: Date | null = null;
  if (stage === "filed" || stage === "mediation") dueAt = dl.mediationDueAt;
  else if (stage === "conciliation") dueAt = dl.conciliationDueAt;
  if (!dueAt) return { dueAt: null, daysRemaining: null, breached: false };
  const days = Math.ceil((dueAt.getTime() - now.getTime()) / 86400_000);
  return { dueAt, daysRemaining: days, breached: days < 0 };
}

export async function kpRoutes(app: FastifyInstance) {
  // ---- blotter ----
  app.get("/blotter", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("kp", "view");
    const seeConfidential = canSeeConfidentialCase(ctx.principal);

    const q = z
      .object({
        q: z.string().optional(),
        category: z.string().optional(),
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().max(200).default(25),
      })
      .parse(req.query ?? {});

    const where: Record<string, unknown> = {};
    // VAWC/VAC records are invisible to everyone but the VAW desk and the PB.
    if (!seeConfidential) where.isConfidential = false;
    if (q.category && q.category !== "all") where.category = q.category;
    if (q.q) {
      where.OR = [
        { entryNo: { contains: q.q, mode: "insensitive" } },
        { location: { contains: q.q, mode: "insensitive" } },
        { reportedBy: { contains: q.q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      ctx.db.blotterEntry.findMany({
        where,
        orderBy: { incidentAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: { kpCase: { select: { id: true, caseNo: true, stage: true } } },
      }),
      ctx.db.blotterEntry.count({ where }),
    ]);

    // Redact narratives of confidential entries even for permitted roles in list view.
    const safe = items.map((i) =>
      i.isConfidential ? { ...i, narrative: "[RESTRICTED — open the case to view]" } : i,
    );
    return { items: serialize(safe), total, page: q.page, pageSize: q.pageSize };
  });

  app.post("/blotter", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("kp", "encode");
    const body = z
      .object({
        category: z.enum([
          "dispute", "theft", "physical_injury", "noise", "vandalism",
          "vawc", "drugs", "traffic", "other",
        ]),
        incidentAt: z.coerce.date(),
        location: z.string(),
        narrative: z.string().min(10),
        reportedBy: z.string(),
        respondentName: z.string().optional(),
      })
      .parse(req.body);

    const isConfidential = body.category === "vawc";
    if (isConfidential) ctx.can("vawc", "encode");

    const barangayId = ctx.principal.barangayId!;
    const count = await prisma.blotterEntry.count({ where: { barangayId } });
    const created = await ctx.db.blotterEntry.create({
      data: {
        ...body,
        entryNo: `BL-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
        isConfidential,
      },
    });
    await ctx.audit({
      action: "kp.blotter.create",
      entity: "BlotterEntry",
      entityId: created.id,
      diff: { category: body.category, confidential: isConfidential },
    });
    return reply.status(201).send(serialize(created));
  });

  // ---- KP cases ----
  app.get("/kp/cases", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("kp", "view");
    const seeConfidential = canSeeConfidentialCase(ctx.principal);
    const q = z
      .object({
        stage: z.string().optional(),
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().max(200).default(25),
      })
      .parse(req.query ?? {});

    const where: Record<string, unknown> = {};
    if (!seeConfidential) where.isConfidential = false;
    if (q.stage && q.stage !== "all") where.stage = q.stage;

    const [items, total] = await Promise.all([
      ctx.db.kpCase.findMany({
        where,
        orderBy: { filedAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: {
          parties: { include: { inhabitant: { select: { firstName: true, lastName: true } } } },
          _count: { select: { hearings: true } },
        },
      }),
      ctx.db.kpCase.count({ where }),
    ]);

    const withDeadlines = items.map((c) => ({
      ...c,
      deadline: kpDeadlineStatus(c.stage, c.filedAt),
    }));
    return { items: serialize(withDeadlines), total, page: q.page, pageSize: q.pageSize };
  });

  app.get("/kp/cases/:id", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("kp", "view");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const c = await ctx.db.kpCase.findFirst({
      where: { id },
      include: {
        parties: { include: { inhabitant: true } },
        hearings: { orderBy: { scheduledAt: "asc" } },
        documents: true,
        blotter: true,
      },
    });
    if (!c) return reply.status(404).send({ error: "NotFound", message: "Not found." });
    if (c.isConfidential && !canSeeConfidentialCase(ctx.principal)) {
      return reply.status(404).send({ error: "NotFound", message: "Not found." });
    }
    await ctx.audit({ action: "kp.case.view", entity: "KpCase", entityId: id });
    return serialize({ ...c, deadline: kpDeadlineStatus(c.stage, c.filedAt) });
  });

  app.post("/kp/cases", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("kp", "encode");
    const body = z
      .object({
        blotterId: z.string().optional(),
        subject: z.string().min(3),
        description: z.string().min(10),
        complainantInhabitantId: z.string().optional(),
        respondentInhabitantId: z.string().optional(),
        respondentName: z.string().optional(),
        isConfidential: z.boolean().default(false),
      })
      .parse(req.body);

    if (body.isConfidential) ctx.can("vawc", "encode");

    const barangayId = ctx.principal.barangayId!;
    const count = await prisma.kpCase.count({ where: { barangayId } });
    const filedAt = new Date();
    const dl = computeKpDeadlines(filedAt);

    const created = await ctx.db.kpCase.create({
      data: {
        caseNo: `KP-${filedAt.getFullYear()}-${String(count + 1).padStart(4, "0")}`,
        blotterId: body.blotterId,
        subject: body.subject,
        description: body.description,
        isConfidential: body.isConfidential,
        stage: "filed",
        filedAt,
        ...dl,
        parties: {
          create: [
            ...(body.complainantInhabitantId
              ? [{ role: "complainant" as const, inhabitantId: body.complainantInhabitantId }]
              : []),
            ...(body.respondentInhabitantId
              ? [{ role: "respondent" as const, inhabitantId: body.respondentInhabitantId }]
              : body.respondentName
                ? [{ role: "respondent" as const, nameOverride: body.respondentName }]
                : []),
          ],
        },
      },
      include: { parties: true },
    });
    await ctx.audit({ action: "kp.case.create", entity: "KpCase", entityId: created.id });
    return reply.status(201).send(serialize(created));
  });

  /** Advance the case through the statutory stages. */
  app.post("/kp/cases/:id/advance", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("kp", "approve");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({
        stage: z.enum([
          "mediation", "conciliation", "settled", "repudiated",
          "cfa_issued", "dismissed", "withdrawn",
        ]),
        settlementTerms: z.string().optional(),
        cfaReason: z.string().optional(),
        pangkatMembers: z.array(z.string()).optional(),
      })
      .parse(req.body);

    const c = await ctx.db.kpCase.findFirst({ where: { id } });
    if (!c) return reply.status(404).send({ error: "NotFound", message: "Not found." });

    const closing = ["settled", "repudiated", "cfa_issued", "dismissed", "withdrawn"];
    const updated = await ctx.db.kpCase.update({
      where: { id },
      data: {
        stage: body.stage,
        settlementTerms: body.settlementTerms,
        cfaReason: body.cfaReason,
        pangkatMembers: body.pangkatMembers,
        closedAt: closing.includes(body.stage) ? new Date() : null,
      },
    });

    // Auto-generate the corresponding KP form.
    const docKind =
      body.stage === "settled" ? "amicable_settlement"
      : body.stage === "cfa_issued" ? "cfa"
      : body.stage === "conciliation" ? "notice_of_hearing"
      : "summons";
    await prisma.kpDocument.create({ data: { caseId: id, kind: docKind } });

    await ctx.audit({
      action: "kp.case.advance",
      entity: "KpCase",
      entityId: id,
      diff: { from: c.stage, to: body.stage },
    });
    return serialize({ ...updated, deadline: kpDeadlineStatus(updated.stage, updated.filedAt) });
  });

  app.post("/kp/cases/:id/hearings", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("kp", "encode");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({
        scheduledAt: z.coerce.date(),
        stage: z.enum(["mediation", "conciliation"]),
        minutes: z.string().optional(),
      })
      .parse(req.body);
    const created = await prisma.kpHearing.create({ data: { caseId: id, ...body } });
    await ctx.audit({ action: "kp.hearing.schedule", entity: "KpHearing", entityId: created.id });
    return reply.status(201).send(serialize(created));
  });

  /** Cases approaching or past their statutory deadline. */
  app.get("/kp/deadlines", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("kp", "view");
    const open = await ctx.db.kpCase.findMany({
      where: { stage: { in: ["filed", "mediation", "conciliation"] } },
      select: { id: true, caseNo: true, subject: true, stage: true, filedAt: true },
    });
    const rows = open
      .map((c) => ({ ...c, ...kpDeadlineStatus(c.stage, c.filedAt) }))
      .filter((c) => c.daysRemaining !== null && c.daysRemaining <= 5)
      .sort((a, b) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0));
    return { items: serialize(rows), breached: rows.filter((r) => r.breached).length };
  });
}
