import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@cbms/db";
import { can } from "@cbms/rbac";
import { buildContext } from "../context.js";
import { serialize } from "./_crud.js";

/** B3 — Resident self-service suite (311, SOS, CSM, appointments, PB). */
export async function residentRoutes(app: FastifyInstance) {
  // ---------------- Report a Concern (311) ----------------

  app.get("/concerns", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("concerns", "view");
    const q = z
      .object({
        status: z.string().optional(),
        category: z.string().optional(),
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().max(200).default(25),
      })
      .parse(req.query ?? {});
    const where: Record<string, unknown> = {};
    if (q.status && q.status !== "all") where.status = q.status;
    if (q.category && q.category !== "all") where.category = q.category;

    const [items, total] = await Promise.all([
      ctx.db.concern.findMany({
        where,
        include: { inhabitant: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      ctx.db.concern.count({ where }),
    ]);

    const now = Date.now();
    const withSla = items.map((c) => ({
      ...c,
      slaBreached:
        !!c.slaDueAt && c.status !== "resolved" && c.slaDueAt.getTime() < now,
    }));
    return { items: serialize(withSla), total, page: q.page, pageSize: q.pageSize };
  });

  app.post("/concerns", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("concerns", "encode");
    const body = z
      .object({
        category: z.string(),
        description: z.string().min(5),
        photoUrl: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        purok: z.string().optional(),
      })
      .parse(req.body);

    const barangayId = ctx.principal.barangayId!;
    const count = await prisma.concern.count({ where: { barangayId } });
    const created = await ctx.db.concern.create({
      data: {
        ...body,
        inhabitantId: ctx.principal.inhabitantId,
        referenceNo: `CN-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`,
        // RA 11032 — 3 working days for simple transactions.
        slaDueAt: new Date(Date.now() + 3 * 86400_000),
      },
    });
    await ctx.audit({ action: "concerns.create", entity: "Concern", entityId: created.id });
    return reply.status(201).send(serialize(created));
  });

  app.patch("/concerns/:id", async (req) => {
    const ctx = await buildContext(req);
    // Front-line staff (Secretary, BHW, Tanod) hold concerns:encode; the Punong
    // Barangay holds concerns:approve. Either may move a concern along — the PB
    // is the one the dashboard action queue points at.
    if (!can(ctx.principal, "concerns", "encode")) {
      ctx.can("concerns", "approve");
    }
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({
        status: z.enum(["submitted", "acknowledged", "in_progress", "resolved", "rejected"]),
        resolutionNote: z.string().optional(),
        resolutionPhotoUrl: z.string().optional(),
        assignedToId: z.string().optional(),
      })
      .parse(req.body);

    const updated = await ctx.db.concern.update({
      where: { id },
      data: {
        ...body,
        acknowledgedAt: body.status === "acknowledged" ? new Date() : undefined,
        resolvedAt: body.status === "resolved" ? new Date() : undefined,
      },
    });
    await ctx.audit({
      action: "concerns.update",
      entity: "Concern",
      entityId: id,
      diff: { status: body.status },
    });
    return serialize(updated);
  });

  // ---------------- Panic / SOS ----------------

  app.get("/sos", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("sos", "view");
    const items = await ctx.db.sosAlert.findMany({
      where: { status: { in: ["active", "acknowledged", "dispatched"] } },
      include: {
        inhabitant: { select: { firstName: true, lastName: true, contactPhone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { items: serialize(items) };
  });

  app.post("/sos", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("sos", "encode");
    const body = z
      .object({
        kind: z.enum(["medical", "fire", "crime", "flood"]),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        note: z.string().optional(),
        isTest: z.boolean().default(false),
      })
      .parse(req.body);

    const created = await ctx.db.sosAlert.create({
      data: {
        ...body,
        inhabitantId: ctx.principal.inhabitantId,
        status: body.isTest ? "test" : "active",
      },
    });
    await ctx.audit({
      action: "sos.raise",
      entity: "SosAlert",
      entityId: created.id,
      diff: { kind: body.kind, isTest: body.isTest },
    });
    return reply.status(201).send(serialize(created));
  });

  app.post("/sos/:id/respond", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("sos", "encode");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({
        status: z.enum(["acknowledged", "dispatched", "resolved", "false_alarm"]),
        responseNote: z.string().optional(),
      })
      .parse(req.body);
    const updated = await ctx.db.sosAlert.update({
      where: { id },
      data: {
        ...body,
        respondedById: ctx.principal.userId,
        acknowledgedAt: body.status === "acknowledged" ? new Date() : undefined,
        resolvedAt: ["resolved", "false_alarm"].includes(body.status) ? new Date() : undefined,
      },
    });
    await ctx.audit({ action: "sos.respond", entity: "SosAlert", entityId: id, diff: body });
    return serialize(updated);
  });

  // ---------------- Feedback / CSM (RA 11032) ----------------

  app.post("/feedback", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("feedback", "encode");
    const body = z
      .object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
        service: z.string(),
        certificateRequestId: z.string().optional(),
        concernId: z.string().optional(),
      })
      .parse(req.body);

    const created = await ctx.db.feedback.create({
      data: {
        ...body,
        inhabitantId: ctx.principal.inhabitantId,
        isGrievance: body.rating <= 2,
        escalatedAt: body.rating <= 2 ? new Date() : null,
      },
    });
    return reply.status(201).send(serialize(created));
  });

  app.get("/feedback/csm", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("feedback", "view");
    const scope = ctx.principal.barangayId ? { barangayId: ctx.principal.barangayId } : {};
    const since = new Date(Date.now() - 90 * 86400_000);

    const [rows, byService] = await Promise.all([
      prisma.feedback.findMany({
        where: { ...scope, createdAt: { gte: since } },
        select: { rating: true, isGrievance: true },
      }),
      prisma.feedback.groupBy({
        by: ["service"],
        where: { ...scope, createdAt: { gte: since } },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    const total = rows.length;
    const avg = total ? rows.reduce((s, r) => s + r.rating, 0) / total : 0;
    const satisfied = rows.filter((r) => r.rating >= 4).length;

    return {
      responses: total,
      averageRating: Math.round(avg * 100) / 100,
      satisfactionRate: total ? Math.round((satisfied / total) * 1000) / 10 : 0,
      grievances: rows.filter((r) => r.isGrievance).length,
      distribution: [1, 2, 3, 4, 5].map((star) => ({
        star,
        count: rows.filter((r) => r.rating === star).length,
      })),
      byService: byService.map((b) => ({
        service: b.service,
        average: Math.round((b._avg.rating ?? 0) * 100) / 100,
        responses: b._count,
      })),
    };
  });

  // ---------------- Participatory budgeting ----------------

  app.post("/participation/vote", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("participation", "encode");
    const body = z.object({ cycleId: z.string(), optionId: z.string() }).parse(req.body);
    if (!ctx.principal.inhabitantId) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "Only verified residents may vote.",
      });
    }

    const cycle = await prisma.pbCycle.findUnique({ where: { id: body.cycleId } });
    if (!cycle || cycle.status !== "open") {
      return reply.status(409).send({ error: "Conflict", message: "Voting is not open." });
    }
    const now = new Date();
    if (now < cycle.opensAt || now > cycle.closesAt) {
      return reply.status(409).send({ error: "Conflict", message: "Outside the voting window." });
    }

    try {
      // One vote per verified resident per cycle (DB unique constraint).
      await prisma.pbVote.create({
        data: {
          cycleId: body.cycleId,
          optionId: body.optionId,
          inhabitantId: ctx.principal.inhabitantId,
        },
      });
    } catch {
      return reply.status(409).send({ error: "Conflict", message: "You have already voted in this cycle." });
    }
    const count = await prisma.pbVote.count({ where: { optionId: body.optionId } });
    await prisma.pbOption.update({ where: { id: body.optionId }, data: { voteCount: count } });
    await ctx.audit({ action: "participation.vote", entity: "PbVote", entityId: body.optionId });
    return reply.status(201).send({ ok: true });
  });

  // ---------------- Resident "my" endpoints ----------------

  app.get("/me/profile", async (req, reply) => {
    const ctx = await buildContext(req);
    if (!ctx.principal.inhabitantId) {
      return reply.status(404).send({ error: "NotFound", message: "No resident profile linked." });
    }
    const inh = await prisma.inhabitant.findUnique({
      where: { id: ctx.principal.inhabitantId },
      include: {
        household: { include: { consents: true } },
        digitalId: true,
        wallet: true,
        barangay: { select: { name: true, contactPhone: true, hotline: true } },
      },
    });
    return serialize({ profile: inh });
  });

  app.get("/me/requests", async (req) => {
    const ctx = await buildContext(req);
    const items = await prisma.certificateRequest.findMany({
      where: { inhabitantId: ctx.principal.inhabitantId ?? "__none__" },
      include: { type: true },
      orderBy: { createdAt: "desc" },
    });
    return { items: serialize(items) };
  });

  app.get("/me/concerns", async (req) => {
    const ctx = await buildContext(req);
    const items = await prisma.concern.findMany({
      where: { inhabitantId: ctx.principal.inhabitantId ?? "__none__" },
      orderBy: { createdAt: "desc" },
    });
    return { items: serialize(items) };
  });

  /** RA 10173 data-subject request — export everything we hold on this resident. */
  app.get("/me/data-export", async (req, reply) => {
    const ctx = await buildContext(req);
    const id = ctx.principal.inhabitantId;
    if (!id) return reply.status(404).send({ error: "NotFound", message: "No profile linked." });

    const [profile, requests, concerns, feedback, appointments, consents, wallet] =
      await Promise.all([
        prisma.inhabitant.findUnique({ where: { id }, include: { household: true } }),
        prisma.certificateRequest.findMany({ where: { inhabitantId: id } }),
        prisma.concern.findMany({ where: { inhabitantId: id } }),
        prisma.feedback.findMany({ where: { inhabitantId: id } }),
        prisma.appointment.findMany({ where: { inhabitantId: id } }),
        prisma.consentRecord.findMany({ where: { inhabitantId: id } }),
        prisma.wallet.findUnique({ where: { inhabitantId: id } }),
      ]);

    await ctx.audit({ action: "privacy.data_export", entity: "Inhabitant", entityId: id });
    reply.header("Content-Type", "application/json");
    reply.header("Content-Disposition", `attachment; filename="my-cbms-data.json"`);
    return serialize({
      exportedAt: new Date().toISOString(),
      notice:
        "Personal data export under the Data Privacy Act (RA 10173). Records sourced from LGUSS-BIMS remain under DILG custody.",
      profile, requests, concerns, feedback, appointments, consents, wallet,
    });
  });
}
