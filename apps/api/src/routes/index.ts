import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authRoutes } from "./auth.js";
import { walletRoutes } from "./wallet.js";
import { inhabitantRoutes } from "./inhabitants.js";
import { issuanceRoutes } from "./issuance.js";
import { kpRoutes } from "./kp.js";
import { residentRoutes } from "./resident.js";
import { dashboardRoutes } from "./dashboard.js";
import { publicRoutes } from "./public.js";
import { crudRoutes } from "./_crud.js";

export async function registerRoutes(app: FastifyInstance) {
  // --- bespoke modules ---
  await app.register(authRoutes);
  await app.register(publicRoutes); // unauthenticated: verify, website
  await app.register(inhabitantRoutes); // A1
  await app.register(issuanceRoutes); // A2
  await app.register(kpRoutes); // A3
  await app.register(walletRoutes); // B1
  await app.register(residentRoutes); // B3
  await app.register(dashboardRoutes); // hub + admin dashboards

  // --- generic CRUD modules ---
  await app.register(async (r) => {
    // A4 Property & Assets (BAMS)
    crudRoutes(r, {
      path: "properties",
      model: "property",
      module: "property",
      searchFields: ["name", "category", "custodian"],
      filterFields: ["status", "type"],
      orderBy: { updatedAt: "desc" },
      include: { maintenance: { orderBy: { performedAt: "desc" } } },
      createSchema: z.object({
        name: z.string().min(2),
        type: z.enum(["infrastructure", "non_infrastructure"]),
        status: z.enum(["operational", "under_construction", "unserviceable", "closed"]),
        category: z.string(),
        capacity: z.number().int().min(0).default(0),
        custodian: z.string().optional(),
        addressLine: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        description: z.string().optional(),
      }),
      updateSchema: z.object({
        name: z.string().min(2).optional(),
        type: z.enum(["infrastructure", "non_infrastructure"]).optional(),
        status: z.enum(["operational", "under_construction", "unserviceable", "closed"]).optional(),
        category: z.string().optional(),
        capacity: z.number().int().min(0).optional(),
        custodian: z.string().optional(),
        addressLine: z.string().optional(),
        description: z.string().optional(),
      }),
    });

    crudRoutes(r, {
      path: "materials",
      model: "material",
      module: "property",
      searchFields: ["name", "location"],
      orderBy: { name: "asc" },
      createSchema: z.object({
        name: z.string(),
        unit: z.string().default("pc"),
        quantity: z.number().int().default(0),
        reorderLevel: z.number().int().default(0),
        location: z.string().optional(),
      }),
      updateSchema: z.object({
        name: z.string().optional(),
        quantity: z.number().int().optional(),
        reorderLevel: z.number().int().optional(),
        location: z.string().optional(),
      }),
    });

    // A5 Disaster (BDRIS)
    crudRoutes(r, {
      path: "disaster/events",
      model: "disasterEvent",
      module: "disaster",
      searchFields: ["name", "hazardType"],
      filterFields: ["status"],
      include: {
        evacuations: { include: { center: true } },
        reliefs: true,
      },
      createSchema: z.object({
        name: z.string(),
        hazardType: z.string(),
        status: z.enum(["monitoring", "active", "recovery", "closed"]).default("monitoring"),
        summary: z.string().optional(),
      }),
      updateSchema: z.object({
        status: z.enum(["monitoring", "active", "recovery", "closed"]).optional(),
        summary: z.string().optional(),
        closedAt: z.coerce.date().optional(),
      }),
    });
    crudRoutes(r, {
      path: "disaster/centers",
      model: "evacuationCenter",
      module: "disaster",
      searchFields: ["name"],
      orderBy: { name: "asc" },
      createSchema: z.object({
        name: z.string(),
        capacity: z.number().int().min(1),
        addressLine: z.string().optional(),
        propertyId: z.string().optional(),
      }),
      updateSchema: z.object({
        name: z.string().optional(),
        capacity: z.number().int().optional(),
        isOpen: z.boolean().optional(),
      }),
    });
    crudRoutes(r, {
      path: "disaster/hazards",
      model: "hazard",
      module: "disaster",
      searchFields: ["purok", "hazardType"],
      createSchema: z.object({
        purok: z.string(),
        hazardType: z.string(),
        riskLevel: z.string(),
        notes: z.string().optional(),
      }),
      updateSchema: z.object({ riskLevel: z.string().optional(), notes: z.string().optional() }),
    });

    // A6 GAD
    crudRoutes(r, {
      path: "gad/plans",
      model: "gadPlan",
      module: "gad",
      include: { activities: true },
      orderBy: { year: "desc" },
      createSchema: z.object({
        year: z.number().int(),
        totalBudget: z.number(),
        gadBudget: z.number(),
      }),
      updateSchema: z.object({ status: z.string().optional(), gadBudget: z.number().optional() }),
    });

    // A7 Legislation (BORIS)
    crudRoutes(r, {
      path: "legislation",
      model: "legislation",
      module: "legislation",
      searchFields: ["title", "number"],
      filterFields: ["kind", "status"],
      orderBy: { enactedAt: "desc" },
      createSchema: z.object({
        kind: z.enum(["ordinance", "resolution", "executive_order"]),
        number: z.string(),
        series: z.number().int(),
        title: z.string().min(5),
        body: z.string().optional(),
        sponsors: z.array(z.string()).default([]),
      }),
      updateSchema: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        status: z.enum(["draft", "enacted", "vetoed", "amended", "repealed"]).optional(),
        enactedAt: z.coerce.date().optional(),
        isPublished: z.boolean().optional(),
      }),
    });

    // A8 Development plan
    crudRoutes(r, {
      path: "devplan/plans",
      model: "developmentPlan",
      module: "devplan",
      include: { projects: true },
      createSchema: z.object({
        title: z.string(),
        vision: z.string().optional(),
        startYear: z.number().int(),
        endYear: z.number().int(),
      }),
      updateSchema: z.object({ title: z.string().optional(), vision: z.string().optional() }),
    });
    crudRoutes(r, {
      path: "devplan/projects",
      model: "devProject",
      module: "devplan",
      searchFields: ["title", "sector"],
      filterFields: ["status", "sector"],
      createSchema: z.object({
        planId: z.string(),
        title: z.string(),
        sector: z.string(),
        budget: z.number(),
        fundingSource: z.string().optional(),
        targetYear: z.number().int(),
      }),
      updateSchema: z.object({
        status: z.enum(["proposed", "approved", "ongoing", "completed", "deferred"]).optional(),
        progressPct: z.number().int().min(0).max(100).optional(),
        budget: z.number().optional(),
      }),
    });

    // A9 Institutions
    crudRoutes(r, {
      path: "institutions",
      model: "institution",
      module: "institutions",
      searchFields: ["name", "code"],
      include: { members: { include: { inhabitant: true } }, minutes: true },
      createSchema: z.object({
        code: z.string(),
        name: z.string(),
        description: z.string().optional(),
      }),
      updateSchema: z.object({ name: z.string().optional(), isActive: z.boolean().optional() }),
    });

    // A10 Finance
    crudRoutes(r, {
      path: "finance/budgets",
      model: "budget",
      module: "finance",
      include: { lines: true },
      orderBy: { year: "desc" },
      createSchema: z.object({
        year: z.number().int(),
        totalAmount: z.number(),
        skFundAmount: z.number().default(0),
      }),
      updateSchema: z.object({ status: z.string().optional(), totalAmount: z.number().optional() }),
    });
    crudRoutes(r, {
      path: "finance/ledger",
      model: "ledgerEntry",
      module: "finance",
      searchFields: ["description", "accountCode", "orNumber", "dvNumber"],
      filterFields: ["fund", "direction"],
      orderBy: { postedAt: "desc" },
      createSchema: z.object({
        fund: z.enum(["general", "sk", "gad", "disaster", "trust"]).default("general"),
        accountCode: z.string(),
        description: z.string(),
        direction: z.enum(["debit", "credit"]),
        amount: z.number(),
        orNumber: z.string().optional(),
        dvNumber: z.string().optional(),
      }),
      disable: { update: true },
    });
    crudRoutes(r, {
      path: "finance/receipts",
      model: "officialReceipt",
      module: "finance",
      searchFields: ["orNumber", "payorName", "particulars"],
      orderBy: { issuedAt: "desc" },
      disable: { create: true, update: true, remove: true },
    });

    // A11 Website CMS
    crudRoutes(r, {
      path: "cms/pages",
      model: "sitePage",
      module: "website",
      searchFields: ["title", "slug"],
      orderBy: { sortOrder: "asc" },
      createSchema: z.object({
        slug: z.string(),
        title: z.string(),
        body: z.string(),
        sortOrder: z.number().int().default(0),
      }),
      updateSchema: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        isPublished: z.boolean().optional(),
      }),
    });
    crudRoutes(r, {
      path: "cms/posts",
      model: "sitePost",
      module: "website",
      searchFields: ["title", "excerpt"],
      orderBy: { publishedAt: "desc" },
      createSchema: z.object({
        slug: z.string(),
        title: z.string(),
        excerpt: z.string().optional(),
        body: z.string(),
      }),
      updateSchema: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        isPublished: z.boolean().optional(),
        publishedAt: z.coerce.date().optional(),
      }),
    });

    // A13 Admin
    crudRoutes(r, {
      path: "tickets",
      model: "ticket",
      module: "admin",
      searchFields: ["subject", "body"],
      filterFields: ["status", "category"],
      include: { responses: true },
      createSchema: z.object({
        subject: z.string(),
        body: z.string(),
        category: z.string().default("technical"),
        priority: z.string().default("normal"),
      }),
      updateSchema: z.object({
        status: z.enum(["open", "in_progress", "escalated", "resolved", "closed"]).optional(),
        priority: z.string().optional(),
      }),
    });

    // B3 modules
    crudRoutes(r, {
      path: "announcements",
      model: "announcement",
      module: "announcements",
      searchFields: ["title", "body"],
      filterFields: ["category", "severity"],
      orderBy: { publishedAt: "desc" },
      createSchema: z.object({
        title: z.string(),
        body: z.string(),
        category: z.string().default("general"),
        severity: z.enum(["info", "warning", "critical"]).default("info"),
        channels: z.array(z.string()).default(["in_app"]),
      }),
      updateSchema: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        isPublished: z.boolean().optional(),
        publishedAt: z.coerce.date().optional(),
      }),
    });
    crudRoutes(r, {
      path: "appointments",
      model: "appointment",
      module: "appointments",
      filterFields: ["status", "service"],
      orderBy: { scheduledAt: "asc" },
      include: { inhabitant: true },
      listInclude: { inhabitant: { select: { firstName: true, lastName: true } } },
      createSchema: z.object({
        inhabitantId: z.string().optional(),
        service: z.string(),
        scheduledAt: z.coerce.date(),
      }),
      updateSchema: z.object({
        status: z
          .enum(["booked", "checked_in", "serving", "completed", "no_show", "cancelled"])
          .optional(),
      }),
    });
    crudRoutes(r, {
      path: "health/campaigns",
      model: "healthCampaign",
      module: "health",
      searchFields: ["name", "kind"],
      include: { records: true },
      createSchema: z.object({
        name: z.string(),
        kind: z.string(),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date().optional(),
      }),
      updateSchema: z.object({ isActive: z.boolean().optional(), name: z.string().optional() }),
    });
    crudRoutes(r, {
      path: "jobs",
      model: "jobPost",
      module: "livelihood",
      searchFields: ["title", "employer"],
      filterFields: ["kind"],
      include: { applications: { include: { inhabitant: true } } },
      createSchema: z.object({
        title: z.string(),
        employer: z.string(),
        kind: z.string().default("job"),
        description: z.string(),
        location: z.string().optional(),
        salaryRange: z.string().optional(),
      }),
      updateSchema: z.object({ isActive: z.boolean().optional(), title: z.string().optional() }),
    });
    crudRoutes(r, {
      path: "benefits",
      model: "benefitApplication",
      module: "livelihood",
      filterFields: ["program", "status"],
      include: { inhabitant: true },
      listInclude: { inhabitant: { select: { firstName: true, lastName: true } } },
      createSchema: z.object({ inhabitantId: z.string(), program: z.string() }),
      updateSchema: z.object({ status: z.string().optional(), reviewNote: z.string().optional() }),
    });
    crudRoutes(r, {
      path: "participation/cycles",
      model: "pbCycle",
      module: "participation",
      include: { options: { include: { project: true } } },
      createSchema: z.object({
        title: z.string(),
        year: z.number().int(),
        opensAt: z.coerce.date(),
        closesAt: z.coerce.date(),
      }),
      updateSchema: z.object({ status: z.string().optional() }),
    });
    crudRoutes(r, {
      path: "assemblies",
      model: "assembly",
      module: "participation",
      orderBy: { scheduledAt: "desc" },
      createSchema: z.object({
        title: z.string(),
        scheduledAt: z.coerce.date(),
        agenda: z.string().optional(),
      }),
      updateSchema: z.object({
        minutes: z.string().optional(),
        isPublished: z.boolean().optional(),
      }),
    });
  });
}
