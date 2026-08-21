import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@cbms/db";
import { serialize } from "./_crud.js";

/**
 * Unauthenticated endpoints: certificate verification and the public
 * barangay website (A11). No PII beyond what is lawfully public.
 */
export async function publicRoutes(app: FastifyInstance) {
  /** Public QR verification — shows validity and initials only. */
  app.get("/verify/:code", async (req, reply) => {
    const { code } = z.object({ code: z.string().min(4) }).parse(req.params);
    const cr = await prisma.certificateRequest.findUnique({
      where: { verifyCode: code.toUpperCase() },
      include: {
        type: { select: { name: true } },
        barangay: { select: { name: true, city: { select: { name: true } } } },
        inhabitant: { select: { firstName: true, lastName: true } },
      },
    });

    if (!cr || cr.status !== "released") {
      return reply.status(404).send({
        valid: false,
        message: "No valid certificate matches this code.",
      });
    }
    const expired = !!cr.expiresAt && cr.expiresAt < new Date();
    const initials = `${cr.inhabitant.firstName.charAt(0)}. ${cr.inhabitant.lastName.charAt(0)}.`;

    return serialize({
      valid: !expired,
      expired,
      certificate: cr.type.name,
      referenceNo: cr.referenceNo,
      issuedTo: initials, // never the full name on a public endpoint
      barangay: cr.barangay.name,
      city: cr.barangay.city.name,
      issuedAt: cr.issuedAt,
      expiresAt: cr.expiresAt,
    });
  });

  /** Public site payload for one barangay. */
  app.get("/public/barangays", async () => {
    const items = await prisma.barangay.findMany({
      where: { status: "active" },
      select: {
        id: true, name: true, psgcCode: true, logoUrl: true,
        brandPrimary: true, brandAccent: true,
        city: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });
    return { items: serialize(items) };
  });

  app.get("/public/barangay/:psgc", async (req, reply) => {
    const { psgc } = z.object({ psgc: z.string() }).parse(req.params);
    const b = await prisma.barangay.findUnique({
      where: { psgcCode: psgc },
      select: {
        id: true, name: true, psgcCode: true, addressLine: true, contactPhone: true,
        contactEmail: true, hotline: true, logoUrl: true, brandPrimary: true,
        brandAccent: true, mode: true,
        city: { select: { name: true } },
      },
    });
    if (!b) return reply.status(404).send({ error: "NotFound", message: "Barangay not found." });

    const [pages, posts, ordinances, officials, fees, projects, budget] = await Promise.all([
      prisma.sitePage.findMany({
        where: { barangayId: b.id, isPublished: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.sitePost.findMany({
        where: { barangayId: b.id, isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 10,
      }),
      prisma.legislation.findMany({
        where: { barangayId: b.id, isPublished: true, status: "enacted" },
        orderBy: { enactedAt: "desc" },
        select: { kind: true, number: true, series: true, title: true, enactedAt: true },
      }),
      prisma.institutionMember.findMany({
        where: { institution: { barangayId: b.id, code: "SK" } },
        include: { inhabitant: { select: { firstName: true, lastName: true } } },
        take: 10,
      }),
      // Transparency: fees & requirements are public by design (anti-fixer).
      prisma.certificateType.findMany({
        where: { barangayId: b.id, isActive: true },
        select: { name: true, fee: true, requirements: true, exemptNote: true, validityDays: true },
        orderBy: { name: "asc" },
      }),
      prisma.devProject.findMany({
        where: { plan: { barangayId: b.id } },
        select: { title: true, sector: true, budget: true, status: true, progressPct: true, targetYear: true },
        orderBy: { targetYear: "desc" },
      }),
      prisma.budget.findFirst({
        where: { barangayId: b.id },
        orderBy: { year: "desc" },
        include: { lines: true },
      }),
    ]);

    return serialize({
      barangay: b,
      pages,
      posts,
      ordinances,
      officials: officials.map((o) => ({
        position: o.position,
        name: o.inhabitant
          ? `${o.inhabitant.firstName} ${o.inhabitant.lastName}`
          : o.nameOverride,
      })),
      transparency: { fees, projects, budget },
      notice:
        "Published under the DILG Full Disclosure Policy. Official barangay records are maintained in DILG's LGUSS-BIMS.",
    });
  });

  /** Privacy-safe 311 heat map: counts by purok and category, no personal data. */
  app.get("/public/barangay/:psgc/concerns-map", async (req, reply) => {
    const { psgc } = z.object({ psgc: z.string() }).parse(req.params);
    const b = await prisma.barangay.findUnique({ where: { psgcCode: psgc }, select: { id: true } });
    if (!b) return reply.status(404).send({ error: "NotFound", message: "Barangay not found." });

    const rows = await prisma.concern.groupBy({
      by: ["purok", "category", "status"],
      where: { barangayId: b.id },
      _count: true,
    });
    return {
      items: rows.map((r) => ({
        purok: r.purok,
        category: r.category,
        status: r.status,
        count: r._count,
      })),
    };
  });
}
