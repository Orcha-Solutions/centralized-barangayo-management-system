import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@cbms/db";
import { buildContext } from "../context.js";
import { serialize } from "./_crud.js";

/** A1 — Inhabitant Profiling (BIPS / RBI). */
export async function inhabitantRoutes(app: FastifyInstance) {
  app.get("/inhabitants", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "view");
    const q = z
      .object({
        q: z.string().optional(),
        purok: z.string().optional(),
        sector: z.string().optional(), // senior | pwd | solo_parent | 4ps | indigenous
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().max(200).default(25),
      })
      .parse(req.query ?? {});

    const where: Record<string, unknown> = { isDeceased: false };
    if (q.q) {
      where.OR = [
        { firstName: { contains: q.q, mode: "insensitive" } },
        { lastName: { contains: q.q, mode: "insensitive" } },
        { philsysNo: { contains: q.q } },
      ];
    }
    if (q.sector) {
      const map: Record<string, string> = {
        senior: "isSenior",
        pwd: "isPwd",
        solo_parent: "isSoloParent",
        "4ps": "is4Ps",
        indigenous: "isIndigenous",
        pregnant: "isPregnant",
        bedridden: "isBedridden",
      };
      if (map[q.sector]) where[map[q.sector]!] = true;
    }
    if (q.purok) where.household = { purok: q.purok };

    const [items, total] = await Promise.all([
      ctx.db.inhabitant.findMany({
        where,
        include: {
          household: { select: { householdNo: true, purok: true, addressLine: true } },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      ctx.db.inhabitant.count({ where }),
    ]);

    return { items: serialize(items), total, page: q.page, pageSize: q.pageSize };
  });

  app.get("/inhabitants/stats", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "view");
    const scope = ctx.principal.barangayId ? { barangayId: ctx.principal.barangayId } : {};

    const [total, households, seniors, pwd, fourPs, soloParent, voters] = await Promise.all([
      prisma.inhabitant.count({ where: { ...scope, isDeceased: false } }),
      prisma.household.count({ where: scope }),
      prisma.inhabitant.count({ where: { ...scope, isSenior: true, isDeceased: false } }),
      prisma.inhabitant.count({ where: { ...scope, isPwd: true, isDeceased: false } }),
      prisma.inhabitant.count({ where: { ...scope, is4Ps: true, isDeceased: false } }),
      prisma.inhabitant.count({ where: { ...scope, isSoloParent: true, isDeceased: false } }),
      prisma.inhabitant.count({ where: { ...scope, isVoter: true, isDeceased: false } }),
    ]);
    return { total, households, seniors, pwd, fourPs, soloParent, voters };
  });

  app.get("/inhabitants/:id", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "view");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const item = await ctx.db.inhabitant.findFirst({
      where: { id },
      include: {
        household: { include: { consents: true } },
        residencyHistory: { orderBy: { effectiveAt: "desc" } },
        certificateRequests: { orderBy: { createdAt: "desc" }, take: 10, include: { type: true } },
        wallet: true,
        digitalId: true,
      },
    });
    if (!item) return reply.status(404).send({ error: "NotFound", message: "Not found." });

    // Profile completeness meter
    const fields = [
      item.philsysNo, item.contactPhone, item.occupation, item.educationLevel,
      item.religion, item.bloodType, item.birthPlace, item.householdId, item.photoUrl,
    ];
    const completeness = Math.round(
      (fields.filter(Boolean).length / fields.length) * 100,
    );
    return serialize({ ...item, completeness });
  });

  const createSchema = z.object({
    householdId: z.string().optional(),
    relationToHead: z.string().optional(),
    firstName: z.string().min(1),
    middleName: z.string().optional(),
    lastName: z.string().min(1),
    suffix: z.string().optional(),
    sex: z.enum(["male", "female"]),
    birthDate: z.coerce.date(),
    birthPlace: z.string().optional(),
    civilStatus: z.enum(["single", "married", "widowed", "separated", "annulled"]).default("single"),
    philsysNo: z.string().optional(),
    contactPhone: z.string().optional(),
    occupation: z.string().optional(),
    educationLevel: z.string().optional(),
    isSenior: z.boolean().optional(),
    isPwd: z.boolean().optional(),
    isSoloParent: z.boolean().optional(),
    is4Ps: z.boolean().optional(),
    isIndigenous: z.boolean().optional(),
    /** Set true to bypass a soft duplicate warning. */
    confirmDuplicate: z.boolean().default(false),
  });

  app.post("/inhabitants", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "encode");
    const body = createSchema.parse(req.body);

    // Dedupe: same last name + birthdate, fuzzy first name.
    if (!body.confirmDuplicate) {
      const candidates = await ctx.db.inhabitant.findMany({
        where: {
          lastName: { equals: body.lastName, mode: "insensitive" },
          birthDate: body.birthDate,
        },
        select: { id: true, firstName: true, middleName: true, lastName: true, birthDate: true },
      });
      const matches = candidates.filter(
        (c) =>
          c.firstName.toLowerCase().startsWith(body.firstName.slice(0, 3).toLowerCase()) ||
          body.firstName.toLowerCase().startsWith(c.firstName.slice(0, 3).toLowerCase()),
      );
      if (matches.length) {
        return reply.status(409).send({
          error: "PossibleDuplicate",
          message:
            "A resident with the same surname and birth date already exists. Review before saving.",
          candidates: serialize(matches),
        });
      }
    }

    const { confirmDuplicate, ...data } = body;
    const isSenior =
      body.isSenior ??
      new Date().getFullYear() - new Date(body.birthDate).getFullYear() >= 60;

    const created = await ctx.db.inhabitant.create({
      data: { ...data, isSenior, source: "CBMS" },
    });
    await ctx.audit({
      action: "inhabitants.create",
      entity: "Inhabitant",
      entityId: created.id,
      diff: { lastName: data.lastName },
    });
    return reply.status(201).send(serialize(created));
  });

  app.patch("/inhabitants/:id", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "encode");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = createSchema.partial().omit({ confirmDuplicate: true }).parse(req.body);
    const updated = await ctx.db.inhabitant.update({ where: { id }, data: body });
    await ctx.audit({ action: "inhabitants.update", entity: "Inhabitant", entityId: id, diff: body });
    return serialize(updated);
  });

  // ---- households ----

  app.get("/households", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "view");
    const q = z
      .object({
        q: z.string().optional(),
        purok: z.string().optional(),
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().max(200).default(25),
      })
      .parse(req.query ?? {});
    const where: Record<string, unknown> = {};
    if (q.q) {
      where.OR = [
        { householdNo: { contains: q.q, mode: "insensitive" } },
        { addressLine: { contains: q.q, mode: "insensitive" } },
      ];
    }
    if (q.purok && q.purok !== "all") where.purok = q.purok;

    const [items, total] = await Promise.all([
      ctx.db.household.findMany({
        where,
        include: {
          _count: { select: { members: true } },
          consents: { where: { status: "granted" }, select: { purpose: true } },
        },
        orderBy: { householdNo: "asc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      ctx.db.household.count({ where }),
    ]);
    return { items: serialize(items), total, page: q.page, pageSize: q.pageSize };
  });

  app.get("/households/:id", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "view");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const hh = await ctx.db.household.findFirst({
      where: { id },
      include: {
        members: { orderBy: { birthDate: "asc" } },
        consents: { orderBy: { grantedAt: "desc" } },
      },
    });
    if (!hh) return reply.status(404).send({ error: "NotFound", message: "Not found." });
    return serialize(hh);
  });

  // ---- consent registry (RA 10173) ----

  app.post("/households/:id/consent", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "encode");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const body = z
      .object({
        purpose: z.enum([
          "SERVICE_DELIVERY",
          "DISBURSEMENT",
          "BIMS_SHARING",
          "HEALTH_PROGRAM",
          "ANALYTICS",
        ]),
        grantedBy: z.string(),
        evidenceUrl: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(req.body);

    const created = await ctx.db.consentRecord.create({
      data: { ...body, householdId: id, barangayId: ctx.principal.barangayId! },
    });
    await ctx.audit({
      action: "consent.grant",
      entity: "ConsentRecord",
      entityId: created.id,
      diff: { purpose: body.purpose, householdId: id },
    });
    return reply.status(201).send(serialize(created));
  });

  app.post("/consent/:id/withdraw", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "encode");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const updated = await ctx.db.consentRecord.update({
      where: { id },
      data: { status: "withdrawn", withdrawnAt: new Date() },
    });
    await ctx.audit({ action: "consent.withdraw", entity: "ConsentRecord", entityId: id });
    return serialize(updated);
  });

  /** RBI export shaped like the LGUSS-BIMS Form B fields. */
  app.get("/inhabitants/export/rbi", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("inhabitants", "view");
    ctx.can("reports", "view");

    const rows = await ctx.db.inhabitant.findMany({
      where: { isDeceased: false },
      include: { household: true },
      orderBy: [{ household: { householdNo: "asc" } }, { birthDate: "asc" }],
      take: 5000,
    });

    const header = [
      "HOUSEHOLD_NO", "PUROK", "ADDRESS", "LAST_NAME", "FIRST_NAME", "MIDDLE_NAME",
      "SUFFIX", "RELATION_TO_HEAD", "SEX", "BIRTH_DATE", "BIRTH_PLACE", "CIVIL_STATUS",
      "CITIZENSHIP", "OCCUPATION", "EDUCATION", "PHILSYS_NO", "SENIOR", "PWD",
      "SOLO_PARENT", "FOUR_PS", "IP", "VOTER", "SOURCE",
    ];
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.household?.householdNo, r.household?.purok, r.household?.addressLine,
          r.lastName, r.firstName, r.middleName, r.suffix, r.relationToHead,
          r.sex, r.birthDate.toISOString().slice(0, 10), r.birthPlace, r.civilStatus,
          r.citizenship, r.occupation, r.educationLevel, r.philsysNo,
          r.isSenior ? "Y" : "N", r.isPwd ? "Y" : "N", r.isSoloParent ? "Y" : "N",
          r.is4Ps ? "Y" : "N", r.isIndigenous ? "Y" : "N", r.isVoter ? "Y" : "N",
          r.source,
        ].map(esc).join(","),
      );
    }
    await ctx.audit({ action: "inhabitants.export_rbi", entity: "Inhabitant", diff: { rows: rows.length } });

    reply.header("Content-Type", "text/csv; charset=utf-8");
    reply.header("Content-Disposition", `attachment; filename="rbi-export.csv"`);
    return lines.join("\n");
  });
}
