import type { FastifyInstance } from "fastify";
import { prisma } from "@cbms/db";
import { buildContext } from "../context.js";
import { serialize } from "./_crud.js";
import { kpDeadlineStatus } from "./kp.js";

/** Admin console + LGU hub dashboards. */
export async function dashboardRoutes(app: FastifyInstance) {
  /** Barangay admin landing dashboard. */
  app.get("/dashboard", async (req) => {
    const ctx = await buildContext(req);
    const barangayId = ctx.principal.barangayId;
    const scope = barangayId ? { barangayId } : {};
    const since30 = new Date(Date.now() - 30 * 86400_000);

    const [
      inhabitants, households, pendingCerts, openConcerns, activeSos,
      openKp, batchesForApproval, walletCount, txn30, feedback30, seniors, pwd,
    ] = await Promise.all([
      prisma.inhabitant.count({ where: { ...scope, isDeceased: false } }),
      prisma.household.count({ where: scope }),
      prisma.certificateRequest.count({ where: { ...scope, status: "for_approval" } }),
      prisma.concern.count({
        where: { ...scope, status: { in: ["submitted", "acknowledged", "in_progress"] } },
      }),
      prisma.sosAlert.count({ where: { ...scope, status: { in: ["active", "dispatched"] } } }),
      prisma.kpCase.findMany({
        where: { ...scope, stage: { in: ["filed", "mediation", "conciliation"] } },
        select: { id: true, caseNo: true, stage: true, filedAt: true },
      }),
      prisma.disbursementBatch.count({ where: { ...scope, status: "for_approval" } }),
      prisma.wallet.count({ where: { ...scope, ownerType: "resident" } }),
      prisma.walletTransaction.aggregate({
        where: { ...scope, createdAt: { gte: since30 }, status: "completed" },
        _count: true,
        _sum: { amountCentavos: true },
      }),
      prisma.feedback.aggregate({
        where: { ...scope, createdAt: { gte: since30 } },
        _avg: { rating: true },
        _count: true,
      }),
      prisma.inhabitant.count({ where: { ...scope, isSenior: true, isDeceased: false } }),
      prisma.inhabitant.count({ where: { ...scope, isPwd: true, isDeceased: false } }),
    ]);

    const kpAtRisk = openKp
      .map((c) => ({ ...c, ...kpDeadlineStatus(c.stage, c.filedAt) }))
      .filter((c) => c.daysRemaining !== null && c.daysRemaining <= 5);

    return serialize({
      population: { inhabitants, households, seniors, pwd },
      actionQueue: {
        certificatesForApproval: pendingCerts,
        openConcerns,
        activeSosAlerts: activeSos,
        kpCasesNearDeadline: kpAtRisk.length,
        kpCasesBreached: kpAtRisk.filter((c) => c.breached).length,
        disbursementBatchesForApproval: batchesForApproval,
      },
      wallet: {
        registeredWallets: walletCount,
        transactions30d: txn30._count,
        volume30dCentavos: (txn30._sum.amountCentavos ?? 0n).toString(),
      },
      satisfaction: {
        responses30d: feedback30._count,
        averageRating: Math.round((feedback30._avg.rating ?? 0) * 100) / 100,
      },
      kpAtRisk,
    });
  });

  /**
   * LGU hub — the adoption scorecard across all barangays in the city.
   * DILG viewers land here too; this endpoint returns aggregates only.
   */
  app.get("/hub/scorecard", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("reports", "view");

    const cityId = ctx.principal.cityId;
    const barangays = await prisma.barangay.findMany({
      where: cityId ? { cityId } : {},
      select: { id: true, name: true, status: true, mode: true, psgcCode: true },
      orderBy: { name: "asc" },
    });
    const ids = barangays.map((b) => b.id);
    const since30 = new Date(Date.now() - 30 * 86400_000);

    const [pop, wallets, merchants, agents, txns, certs, feedback] = await Promise.all([
      prisma.inhabitant.groupBy({
        by: ["barangayId"],
        where: { barangayId: { in: ids }, isDeceased: false },
        _count: true,
      }),
      prisma.wallet.groupBy({
        by: ["barangayId"],
        where: { barangayId: { in: ids }, ownerType: "resident" },
        _count: true,
      }),
      prisma.merchant.groupBy({
        by: ["barangayId"],
        where: { barangayId: { in: ids }, isActive: true },
        _count: true,
      }),
      prisma.agent.groupBy({
        by: ["barangayId"],
        where: { barangayId: { in: ids }, isActive: true },
        _count: true,
      }),
      prisma.walletTransaction.groupBy({
        by: ["barangayId"],
        where: { barangayId: { in: ids }, createdAt: { gte: since30 }, status: "completed" },
        _count: true,
        _sum: { amountCentavos: true },
      }),
      prisma.certificateRequest.groupBy({
        by: ["barangayId"],
        where: { barangayId: { in: ids } },
        _count: true,
      }),
      prisma.feedback.groupBy({
        by: ["barangayId"],
        where: { barangayId: { in: ids }, createdAt: { gte: since30 } },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    const at = <T extends { barangayId: string }>(rows: T[], id: string) =>
      rows.find((r) => r.barangayId === id);

    const rows = barangays.map((b) => {
      const population = at(pop, b.id)?._count ?? 0;
      const registered = at(wallets, b.id)?._count ?? 0;
      // Adults ≈ 65% of population — a planning proxy for the scorecard.
      const adults = Math.round(population * 0.65);
      return {
        barangayId: b.id,
        name: b.name,
        psgcCode: b.psgcCode,
        status: b.status,
        mode: b.mode,
        population,
        registeredWallets: registered,
        registrationRate: adults ? Math.round((registered / adults) * 1000) / 10 : 0,
        merchants: at(merchants, b.id)?._count ?? 0,
        cashPoints: at(agents, b.id)?._count ?? 0,
        transactions30d: at(txns, b.id)?._count ?? 0,
        volume30dCentavos: (at(txns, b.id)?._sum.amountCentavos ?? 0n).toString(),
        certificates: at(certs, b.id)?._count ?? 0,
        satisfaction: Math.round((at(feedback, b.id)?._avg.rating ?? 0) * 100) / 100,
      };
    });

    const totals = rows.reduce(
      (acc, r) => ({
        population: acc.population + r.population,
        registeredWallets: acc.registeredWallets + r.registeredWallets,
        merchants: acc.merchants + r.merchants,
        transactions30d: acc.transactions30d + r.transactions30d,
        certificates: acc.certificates + r.certificates,
      }),
      { population: 0, registeredWallets: 0, merchants: 0, transactions30d: 0, certificates: 0 },
    );

    return serialize({
      scope: cityId ? "city" : "all",
      barangayCount: rows.length,
      totals,
      targets: {
        registrationRate: "80–90% of adults",
        activeRate: "50–65% of registered",
        merchants: "8–15 per barangay",
        cashPointCoverage: "≥85% within a short walk",
      },
      rows,
    });
  });

  /** A12 — quarterly rollup for the hub / DILG viewer. */
  app.get("/reports/quarterly", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("reports", "view");
    const cityId = ctx.principal.cityId;
    const barangays = await prisma.barangay.findMany({
      where: cityId ? { cityId } : {},
      select: { id: true, name: true },
    });
    const ids = barangays.map((b) => b.id);
    const start = new Date();
    start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
    start.setHours(0, 0, 0, 0);

    const [inhabitants, certs, kp, concerns, disbursed, feedback] = await Promise.all([
      prisma.inhabitant.count({ where: { barangayId: { in: ids }, isDeceased: false } }),
      prisma.certificateRequest.count({
        where: { barangayId: { in: ids }, createdAt: { gte: start } },
      }),
      prisma.kpCase.count({ where: { barangayId: { in: ids }, filedAt: { gte: start } } }),
      prisma.concern.count({ where: { barangayId: { in: ids }, createdAt: { gte: start } } }),
      prisma.walletTransaction.aggregate({
        where: {
          barangayId: { in: ids },
          type: "disbursement",
          status: "completed",
          createdAt: { gte: start },
        },
        _sum: { amountCentavos: true },
        _count: true,
      }),
      prisma.feedback.aggregate({
        where: { barangayId: { in: ids }, createdAt: { gte: start } },
        _avg: { rating: true },
        _count: true,
      }),
    ]);

    const q = Math.floor(start.getMonth() / 3) + 1;
    return serialize({
      period: `${start.getFullYear()}-Q${q}`,
      barangaysCovered: barangays.length,
      registeredInhabitants: inhabitants,
      certificatesIssued: certs,
      kpCasesFiled: kp,
      concernsReceived: concerns,
      disbursementCount: disbursed._count,
      disbursementTotalCentavos: (disbursed._sum.amountCentavos ?? 0n).toString(),
      csmResponses: feedback._count,
      csmAverage: Math.round((feedback._avg.rating ?? 0) * 100) / 100,
      note: "Aggregated statistical rollup — aligned to NBOO quarterly reporting.",
    });
  });

  /** Audit trail viewer. */
  app.get("/audit", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("admin", "view");
    const items = await ctx.db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { actor: { select: { fullName: true, email: true } } },
    });
    return { items: serialize(items) };
  });
}
