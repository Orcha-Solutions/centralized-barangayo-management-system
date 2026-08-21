import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { Prisma, prisma } from "@cbms/db";
import { assertDifferentApprover, ForbiddenError } from "@cbms/rbac";
import { getEmiProvider } from "@cbms/payments";
import { buildContext } from "../context.js";
import { serialize } from "./_crud.js";

const pesoToCentavos = (n: number) => BigInt(Math.round(n * 100));
const toPesoDecimal = (c: bigint) => new Prisma.Decimal((Number(c) / 100).toFixed(2));

export async function walletRoutes(app: FastifyInstance) {
  // ---------------- wallets ----------------

  app.get("/wallets", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("wallet", "view");
    const q = z
      .object({
        ownerType: z.string().optional(),
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().max(200).default(25),
      })
      .parse(req.query ?? {});

    const where: Record<string, unknown> = {};
    if (q.ownerType && q.ownerType !== "all") where.ownerType = q.ownerType;

    const [items, total] = await Promise.all([
      ctx.db.wallet.findMany({
        where,
        include: {
          inhabitant: { select: { firstName: true, lastName: true, philsysNo: true } },
          merchant: { select: { businessName: true } },
          agent: { select: { outletName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      ctx.db.wallet.count({ where }),
    ]);
    return { items: serialize(items), total, page: q.page, pageSize: q.pageSize };
  });

  app.get("/wallets/me", async (req, reply) => {
    const ctx = await buildContext(req);
    if (!ctx.principal.inhabitantId) {
      return reply.status(404).send({ error: "NotFound", message: "No wallet for this account." });
    }
    const wallet = await prisma.wallet.findUnique({
      where: { inhabitantId: ctx.principal.inhabitantId },
    });
    if (!wallet) return reply.status(404).send({ error: "NotFound", message: "No wallet found." });

    const txns = await prisma.walletTransaction.findMany({
      where: { OR: [{ fromWalletId: wallet.id }, { toWalletId: wallet.id }] },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
    return serialize({
      wallet,
      direction: txns.map((t) => ({
        ...t,
        direction: t.toWalletId === wallet.id ? "in" : "out",
      })),
    });
  });

  // ---------------- transactions ----------------

  app.get("/wallet/transactions", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("wallet", "view");
    const q = z
      .object({
        type: z.string().optional(),
        status: z.string().optional(),
        page: z.coerce.number().default(1),
        pageSize: z.coerce.number().max(200).default(25),
      })
      .parse(req.query ?? {});

    const where: Record<string, unknown> = {};
    if (q.type && q.type !== "all") where.type = q.type;
    if (q.status && q.status !== "all") where.status = q.status;

    const [items, total] = await Promise.all([
      ctx.db.walletTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
        include: {
          merchant: { select: { businessName: true } },
          agent: { select: { outletName: true } },
        },
      }),
      ctx.db.walletTransaction.count({ where }),
    ]);
    return { items: serialize(items), total, page: q.page, pageSize: q.pageSize };
  });

  // ---------------- disbursement batches ----------------

  app.get("/wallet/batches", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("wallet", "view");
    const items = await ctx.db.disbursementBatch.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
      take: 50,
    });
    return { items: serialize(items) };
  });

  app.get("/wallet/batches/:id", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("wallet", "view");
    const { id } = z.object({ id: z.string() }).parse(req.params);
    const batch = await ctx.db.disbursementBatch.findFirst({
      where: { id },
      include: {
        items: {
          include: { inhabitant: { select: { firstName: true, lastName: true } } },
          orderBy: { payeeName: "asc" },
        },
      },
    });
    if (!batch) return reply.status(404).send({ error: "NotFound", message: "Batch not found." });
    return serialize(batch);
  });

  const createBatchSchema = z.object({
    kind: z.enum(["payroll_honoraria", "allowance_stipend", "ayuda_social"]),
    title: z.string().min(3),
    fund: z.enum(["general", "sk", "gad", "disaster", "trust"]).default("general"),
    sourceNote: z.string().optional(),
    disasterEventId: z.string().optional(),
    items: z
      .array(
        z.object({
          inhabitantId: z.string().optional(),
          payeeName: z.string(),
          amountPeso: z.number().positive(),
        }),
      )
      .min(1),
  });

  app.post("/wallet/batches", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("wallet", "encode"); // Treasurer prepares
    const body = createBatchSchema.parse(req.body);
    const barangayId = ctx.principal.barangayId!;

    // Ayuda requires a DISBURSEMENT consent record per household.
    if (body.kind === "ayuda_social") {
      const ids = body.items.map((i) => i.inhabitantId).filter(Boolean) as string[];
      if (ids.length) {
        const consented = await prisma.consentRecord.findMany({
          where: {
            barangayId,
            purpose: "DISBURSEMENT",
            status: "granted",
            household: { members: { some: { id: { in: ids } } } },
          },
          select: { householdId: true },
        });
        if (consented.length === 0) {
          return reply.status(422).send({
            error: "ConsentRequired",
            message:
              "No DISBURSEMENT consent on file for the selected beneficiaries (RA 10173).",
          });
        }
      }
    }

    const count = await prisma.disbursementBatch.count({ where: { barangayId } });
    const total = body.items.reduce((s, i) => s + pesoToCentavos(i.amountPeso), 0n);

    const batch = await prisma.disbursementBatch.create({
      data: {
        barangayId,
        batchNo: `DB-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
        kind: body.kind,
        title: body.title,
        fund: body.fund,
        status: "for_approval",
        preparedById: ctx.principal.userId,
        sourceNote: body.sourceNote,
        disasterEventId: body.disasterEventId,
        totalCentavos: total,
        itemCount: body.items.length,
        items: {
          create: await Promise.all(
            body.items.map(async (i) => ({
              inhabitantId: i.inhabitantId,
              walletId: i.inhabitantId
                ? (
                    await prisma.wallet.findUnique({
                      where: { inhabitantId: i.inhabitantId },
                      select: { id: true },
                    })
                  )?.id ?? null
                : null,
              payeeName: i.payeeName,
              amountCentavos: pesoToCentavos(i.amountPeso),
            })),
          ),
        },
      },
      include: { items: true },
    });

    await ctx.audit({
      action: "wallet.batch.create",
      entity: "DisbursementBatch",
      entityId: batch.id,
      diff: { kind: body.kind, itemCount: body.items.length },
    });
    return reply.status(201).send(serialize(batch));
  });

  /** Maker–checker: the Punong Barangay approves and executes. */
  app.post("/wallet/batches/:id/approve", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("wallet", "approve");
    const { id } = z.object({ id: z.string() }).parse(req.params);

    const batch = await ctx.db.disbursementBatch.findFirst({
      where: { id },
      include: { items: true },
    });
    if (!batch) return reply.status(404).send({ error: "NotFound", message: "Batch not found." });
    if (batch.status !== "for_approval") {
      return reply.status(409).send({
        error: "Conflict",
        message: `Batch is '${batch.status}' — only 'for_approval' batches can be approved.`,
      });
    }

    // Preparer ≠ approver (public funds, LGC §375).
    assertDifferentApprover(batch.preparedById, ctx.principal.userId);

    const treasury = await prisma.wallet.findFirst({
      where: { barangayId: batch.barangayId, ownerType: "treasury" },
    });
    if (!treasury) {
      return reply.status(422).send({
        error: "NoTreasuryWallet",
        message: "This barangay has no treasury wallet configured.",
      });
    }

    const emi = getEmiProvider();
    const payable = batch.items.filter((i) => i.walletId);

    const walletRefs = new Map(
      (
        await prisma.wallet.findMany({
          where: { id: { in: payable.map((i) => i.walletId!) } },
          select: { id: true, emiAccountRef: true },
        })
      ).map((w) => [w.id, w.emiAccountRef]),
    );

    const result = await emi.disburseBatch({
      fromRef: treasury.emiAccountRef,
      reference: batch.batchNo,
      items: payable.map((i) => ({
        accountRef: walletRefs.get(i.walletId!)!,
        amountCentavos: i.amountCentavos,
        payeeName: i.payeeName,
        externalId: i.id,
      })),
    });

    const now = new Date();
    let paidTotal = 0n;

    await prisma.$transaction(async (tx) => {
      for (const r of result.results) {
        const item = payable.find((i) => i.id === r.externalId)!;
        if (r.status === "paid") {
          paidTotal += item.amountCentavos;
          await tx.disbursementBatchItem.update({
            where: { id: item.id },
            data: { status: "paid", paidAt: now },
          });
          await tx.walletTransaction.create({
            data: {
              barangayId: batch.barangayId,
              type: "disbursement",
              status: "completed",
              fromWalletId: treasury.id,
              toWalletId: item.walletId,
              amountCentavos: item.amountCentavos,
              feeCentavos: 0n, // never charged to the beneficiary
              reference: `TXN-${batch.batchNo}-${item.id.slice(-8)}`,
              description: `${batch.title}`,
              batchItemId: item.id,
              emiTxnRef: r.emiTxnRef,
              completedAt: now,
            },
          });
          await tx.wallet.update({
            where: { id: item.walletId! },
            data: { balanceCentavos: { increment: item.amountCentavos } },
          });
        } else {
          await tx.disbursementBatchItem.update({
            where: { id: item.id },
            data: { status: "failed", remarks: r.failureReason ?? "Provider declined." },
          });
        }
      }

      // Items with no wallet fall back to over-the-counter — cash always works.
      await tx.disbursementBatchItem.updateMany({
        where: { batchId: batch.id, walletId: null, status: "pending" },
        data: {
          status: "otc_fallback",
          remarks: "No wallet on file — release over the counter.",
        },
      });

      await tx.wallet.update({
        where: { id: treasury.id },
        data: { balanceCentavos: { decrement: paidTotal } },
      });

      await tx.disbursementBatch.update({
        where: { id: batch.id },
        data: {
          status: "completed",
          approvedById: ctx.principal.userId,
          approvedAt: now,
          executedAt: now,
        },
      });

      // A10 double-entry posting.
      await tx.ledgerEntry.create({
        data: {
          barangayId: batch.barangayId,
          fund: batch.fund,
          accountCode:
            batch.kind === "ayuda_social" ? "5-02-99-990" : "5-01-01-010",
          description: `${batch.title} — ${batch.batchNo}`,
          direction: "debit",
          amount: toPesoDecimal(paidTotal),
          dvNumber: `DV-${batch.batchNo}`,
          refType: "disbursement_batch",
          refId: batch.id,
          postedAt: now,
        },
      });
    });

    await ctx.audit({
      action: "wallet.batch.approve",
      entity: "DisbursementBatch",
      entityId: batch.id,
      diff: { paidCentavos: paidTotal.toString(), items: result.results.length },
    });

    return serialize({
      ok: true,
      batchId: batch.id,
      paid: result.results.filter((r) => r.status === "paid").length,
      failed: result.results.filter((r) => r.status === "failed").length,
      otcFallback: batch.items.filter((i) => !i.walletId).length,
      totalPaidCentavos: paidTotal.toString(),
    });
  });

  // ---------------- fee collection (A2 → A10) ----------------

  app.post("/wallet/pay-fee", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("wallet", "view");
    const body = z
      .object({ certificateRequestId: z.string() })
      .parse(req.body);

    const cr = await ctx.db.certificateRequest.findFirst({
      where: { id: body.certificateRequestId },
      include: { type: true },
    });
    if (!cr) return reply.status(404).send({ error: "NotFound", message: "Request not found." });
    if (cr.status !== "awaiting_payment" && cr.status !== "submitted") {
      return reply.status(409).send({
        error: "Conflict",
        message: `Request is '${cr.status}' and cannot be paid.`,
      });
    }

    const feeCentavos = pesoToCentavos(Number(cr.fee));
    if (feeCentavos === 0n) {
      // Exempt (e.g. indigency, first-time jobseeker under RA 11261)
      const updated = await prisma.certificateRequest.update({
        where: { id: cr.id },
        data: { status: "for_approval", paymentMethod: "waived", paidAt: new Date() },
      });
      await ctx.audit({ action: "issuance.fee.waived", entity: "CertificateRequest", entityId: cr.id });
      return serialize({ ok: true, waived: true, request: updated });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { inhabitantId: cr.inhabitantId },
    });
    const treasury = await prisma.wallet.findFirst({
      where: { barangayId: cr.barangayId, ownerType: "treasury" },
    });
    if (!wallet || !treasury) {
      return reply.status(422).send({
        error: "NoWallet",
        message: "No wallet available — pay over the counter at the barangay hall.",
      });
    }
    if (wallet.balanceCentavos < feeCentavos) {
      return reply.status(422).send({
        error: "InsufficientBalance",
        message: "Insufficient wallet balance. Cash-in at an agent or pay over the counter.",
      });
    }

    const emi = getEmiProvider();
    const r = await emi.transfer({
      fromRef: wallet.emiAccountRef,
      toRef: treasury.emiAccountRef,
      amountCentavos: feeCentavos,
      reference: `FEE-${cr.referenceNo}`,
      description: `${cr.type.code} fee`,
    });
    if (r.status !== "completed") {
      return reply.status(422).send({ error: "PaymentFailed", message: r.failureReason });
    }

    const orCount = await prisma.officialReceipt.count({ where: { barangayId: cr.barangayId } });
    const orNumber = `OR-${String(orCount + 1).padStart(6, "0")}`;
    const now = new Date();

    const out = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balanceCentavos: { decrement: feeCentavos } },
      });
      await tx.wallet.update({
        where: { id: treasury.id },
        data: { balanceCentavos: { increment: feeCentavos } },
      });
      const txn = await tx.walletTransaction.create({
        data: {
          barangayId: cr.barangayId,
          type: "fee_collection",
          status: "completed",
          fromWalletId: wallet.id,
          toWalletId: treasury.id,
          amountCentavos: feeCentavos,
          reference: `TXN-FEE-${cr.referenceNo}`,
          description: `${cr.type.name} — ${cr.referenceNo}`,
          certificateRequestId: cr.id,
          emiTxnRef: r.emiTxnRef,
          completedAt: now,
        },
      });
      await tx.officialReceipt.create({
        data: {
          barangayId: cr.barangayId,
          orNumber,
          payorName: "Resident",
          amount: cr.fee,
          particulars: `${cr.type.name} fee`,
          refType: "certificate_request",
          refId: cr.id,
        },
      });
      await tx.ledgerEntry.create({
        data: {
          barangayId: cr.barangayId,
          fund: "general",
          accountCode: "4-02-01-040",
          description: `Clearance & certification fees — ${cr.referenceNo}`,
          direction: "credit",
          amount: cr.fee,
          orNumber,
          refType: "certificate_request",
          refId: cr.id,
          transactionId: txn.id,
          postedAt: now,
        },
      });
      return tx.certificateRequest.update({
        where: { id: cr.id },
        data: {
          status: "for_approval",
          paymentMethod: "wallet",
          paidAt: now,
          orNumber,
        },
      });
    });

    await ctx.audit({
      action: "wallet.fee.collect",
      entity: "CertificateRequest",
      entityId: cr.id,
      diff: { orNumber, amount: Number(cr.fee) },
    });
    return serialize({ ok: true, orNumber, request: out });
  });

  // ---------------- agent CICO ----------------

  app.post("/wallet/cash-out", async (req, reply) => {
    const ctx = await buildContext(req);
    ctx.can("wallet", "encode");
    const body = z
      .object({
        agentId: z.string(),
        inhabitantId: z.string(),
        amountPeso: z.number().positive(),
        /** Government aid cash-out is free by policy. */
        isGovernmentAid: z.boolean().default(true),
      })
      .parse(req.body);

    const [agent, wallet] = await Promise.all([
      prisma.agent.findUnique({ where: { id: body.agentId }, include: { wallet: true } }),
      prisma.wallet.findUnique({ where: { inhabitantId: body.inhabitantId } }),
    ]);
    if (!agent || !wallet) {
      return reply.status(404).send({ error: "NotFound", message: "Agent or wallet not found." });
    }

    const amount = pesoToCentavos(body.amountPeso);
    if (wallet.balanceCentavos < amount) {
      return reply.status(422).send({ error: "InsufficientBalance", message: "Insufficient balance." });
    }
    if (agent.cashOnHandCentavos < amount) {
      return reply.status(422).send({
        error: "AgentOutOfCash",
        message: "This agent is out of cash. Try another outlet — liquidity alert raised.",
      });
    }

    // Fee is zero for government aid — never erode ayuda.
    const fee = body.isGovernmentAid ? 0n : 1000n;

    const emi = getEmiProvider();
    const r = await emi.cashOut({
      agentRef: agent.wallet.emiAccountRef,
      fromRef: wallet.emiAccountRef,
      amountCentavos: amount,
      feeCentavos: fee,
      reference: `CO-${Date.now()}`,
    });
    if (r.status !== "completed") {
      return reply.status(422).send({ error: "CashOutFailed", message: r.failureReason });
    }

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balanceCentavos: { decrement: amount + fee } },
      });
      await tx.wallet.update({
        where: { id: agent.walletId },
        data: { balanceCentavos: { increment: amount } },
      });
      await tx.agent.update({
        where: { id: agent.id },
        data: { cashOnHandCentavos: { decrement: amount } },
      });
      await tx.agentFloatLog.create({
        data: {
          agentId: agent.id,
          kind: "cash_out",
          amountCentavos: amount,
          balanceAfterCentavos: agent.cashOnHandCentavos - amount,
          note: "Resident cash-out",
        },
      });
      await tx.walletTransaction.create({
        data: {
          barangayId: wallet.barangayId,
          type: "cash_out",
          status: "completed",
          fromWalletId: wallet.id,
          toWalletId: agent.walletId,
          amountCentavos: amount,
          feeCentavos: fee,
          reference: `TXN-CO-${Date.now()}`,
          description: `Cash-out at ${agent.outletName}`,
          agentId: agent.id,
          emiTxnRef: r.emiTxnRef,
          completedAt: new Date(),
        },
      });
    });

    await ctx.audit({
      action: "wallet.cash_out",
      entity: "Agent",
      entityId: agent.id,
      diff: { amountPeso: body.amountPeso, fee: Number(fee) / 100 },
    });

    const lowFloat = agent.cashOnHandCentavos - amount < agent.floatAlertThreshold;
    return serialize({ ok: true, lowFloatAlert: lowFloat });
  });

  // ---------------- adoption scorecard ----------------

  app.get("/wallet/scorecard", async (req) => {
    const ctx = await buildContext(req);
    ctx.can("wallet", "view");
    const barangayId = ctx.principal.barangayId;
    const where = barangayId ? { barangayId } : {};

    const since = new Date(Date.now() - 30 * 86400_000);
    const [adults, registered, merchants, agents, activeWalletIds, txnAgg] =
      await Promise.all([
        prisma.inhabitant.count({
          where: { ...where, isDeceased: false, birthDate: { lte: new Date(Date.now() - 18 * 365.25 * 86400_000) } },
        }),
        prisma.wallet.count({ where: { ...where, ownerType: "resident" } }),
        prisma.merchant.count({ where: { ...where, isActive: true } }),
        prisma.agent.count({ where: { ...where, isActive: true } }),
        prisma.walletTransaction.findMany({
          where: { ...where, createdAt: { gte: since }, status: "completed" },
          select: { fromWalletId: true, toWalletId: true },
        }),
        prisma.walletTransaction.groupBy({
          by: ["type"],
          where: { ...where, createdAt: { gte: since }, status: "completed" },
          _sum: { amountCentavos: true },
        }),
      ]);

    const activeSet = new Set<string>();
    for (const t of activeWalletIds) {
      if (t.fromWalletId) activeSet.add(t.fromWalletId);
      if (t.toWalletId) activeSet.add(t.toWalletId);
    }

    const disbursed =
      txnAgg.find((t) => t.type === "disbursement")?._sum.amountCentavos ?? 0n;
    const cashedOut = txnAgg.find((t) => t.type === "cash_out")?._sum.amountCentavos ?? 0n;
    // Watchdog metric: share of disbursed money withdrawn immediately.
    const cashOutRatio =
      disbursed > 0n ? Number((cashedOut * 100n) / disbursed) / 100 : 0;

    return {
      registeredWallets: registered,
      adultPopulation: adults,
      registrationRate: adults ? Math.round((registered / adults) * 1000) / 10 : 0,
      active30d: activeSet.size,
      activeRate: registered ? Math.round((activeSet.size / registered) * 1000) / 10 : 0,
      merchantsAccepting: merchants,
      cashInOutPoints: agents,
      cashOutOnlyRatio: Math.round(cashOutRatio * 1000) / 10,
      targets: {
        registrationRate: "80–90%",
        activeRate: "50–65%",
        merchantsAccepting: "8–15",
        note: "Cash-out-only ratio should trend DOWN over time.",
      },
    };
  });
}
