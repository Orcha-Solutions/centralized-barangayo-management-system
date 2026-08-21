import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Tenant scope carried by every request (derived from the authenticated session).
 * ABAC by LGU affiliation, mirroring LGUSS-BIMS §4.3.2.
 */
export interface TenantScope {
  /** platform | region | province | city | barangay | self */
  level: "platform" | "region" | "province" | "city" | "barangay" | "self";
  barangayId?: string;
  cityId?: string;
  /** Set for RESIDENT — restricts row access to their own inhabitant record. */
  inhabitantId?: string;
  /** DILG_VIEWER may only read aggregates; raw PII reads are refused. */
  aggregatesOnly?: boolean;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Models that carry a direct `barangayId` column and are therefore
 * auto-scoped for barangay-level actors.
 */
const BARANGAY_SCOPED_MODELS = new Set<string>([
  "Household",
  "Inhabitant",
  "ConsentRecord",
  "CertificateType",
  "CertificateRequest",
  "BlotterEntry",
  "KpCase",
  "Property",
  "Material",
  "Hazard",
  "EvacuationCenter",
  "DisasterEvent",
  "GadPlan",
  "Legislation",
  "DevelopmentPlan",
  "Institution",
  "Budget",
  "LedgerEntry",
  "OfficialReceipt",
  "SitePage",
  "SitePost",
  "ReportRun",
  "Ticket",
  "FileObject",
  "Wallet",
  "WalletTransaction",
  "DisbursementBatch",
  "Merchant",
  "Agent",
  "BillPayment",
  "Concern",
  "SosAlert",
  "Announcement",
  "Appointment",
  "Feedback",
  "HealthCampaign",
  "JobPost",
  "BenefitApplication",
  "PbCycle",
  "Assembly",
  "AuditLog",
  "AiInteraction",
  "AiWorkflowRun",
  "BimsSyncRun",
]);

/** Read operations we inject a tenant filter into. */
const READ_OPS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
  "updateMany",
  "deleteMany",
]);

export class TenantScopeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TenantScopeError";
  }
}

/**
 * Returns a Prisma client that transparently constrains every query to the
 * caller's tenant scope. Server-side only — never trust a client-supplied
 * barangayId.
 */
export function createScopedClient(scope: TenantScope) {
  // Platform admins bypass row scoping (still audited).
  if (scope.level === "platform") return prisma;

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !BARANGAY_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          if (scope.aggregatesOnly && READ_OPS.has(operation)) {
            // DILG viewers may only run aggregate shapes.
            if (!["count", "aggregate", "groupBy"].includes(operation)) {
              throw new TenantScopeError(
                `Role is limited to aggregate reads; '${operation}' on ${model} is not permitted.`,
              );
            }
          }

          const tenantFilter = buildTenantFilter(scope, model);
          if (!tenantFilter) return query(args);

          const a = (args ?? {}) as Record<string, unknown>;

          if (READ_OPS.has(operation)) {
            // findUnique with a scoped filter must degrade to findFirst.
            if (operation === "findUnique" || operation === "findUniqueOrThrow") {
              const where = { ...(a.where as object), ...tenantFilter };
              const next =
                operation === "findUnique" ? "findFirst" : "findFirstOrThrow";
              return (prisma as any)[lowerFirst(model)][next]({ ...a, where });
            }
            a.where = { ...(a.where as object), ...tenantFilter };
            return query(a as never);
          }

          if (operation === "create") {
            const data = (a.data ?? {}) as Record<string, unknown>;
            if (scope.barangayId && data.barangayId === undefined) {
              data.barangayId = scope.barangayId;
            }
            if (
              scope.barangayId &&
              data.barangayId !== undefined &&
              data.barangayId !== scope.barangayId
            ) {
              throw new TenantScopeError(
                `Cross-tenant write blocked on ${model}.`,
              );
            }
            a.data = data;
            return query(a as never);
          }

          if (operation === "createMany") {
            const rows = (a.data ?? []) as Record<string, unknown>[];
            for (const row of rows) {
              if (scope.barangayId && row.barangayId === undefined) {
                row.barangayId = scope.barangayId;
              }
              if (
                scope.barangayId &&
                row.barangayId !== undefined &&
                row.barangayId !== scope.barangayId
              ) {
                throw new TenantScopeError(
                  `Cross-tenant write blocked on ${model}.`,
                );
              }
            }
            return query(a as never);
          }

          if (operation === "update" || operation === "delete") {
            // Verify the target row belongs to the tenant before mutating.
            const existing = await (prisma as any)[lowerFirst(model)].findFirst({
              where: { ...(a.where as object), ...tenantFilter },
              select: { id: true },
            });
            if (!existing) {
              throw new TenantScopeError(
                `${model} not found within tenant scope.`,
              );
            }
            return query(a as never);
          }

          if (operation === "upsert") {
            const create = (a.create ?? {}) as Record<string, unknown>;
            if (scope.barangayId && create.barangayId === undefined) {
              create.barangayId = scope.barangayId;
            }
            a.create = create;
            return query(a as never);
          }

          return query(args);
        },
      },
    },
  });
}

function buildTenantFilter(
  scope: TenantScope,
  model: string,
): Record<string, unknown> | null {
  switch (scope.level) {
    case "barangay":
      if (!scope.barangayId) {
        throw new TenantScopeError("barangayId required for barangay scope.");
      }
      return { barangayId: scope.barangayId };

    case "self": {
      if (!scope.inhabitantId) {
        throw new TenantScopeError("inhabitantId required for self scope.");
      }
      // Residents see their own rows within their barangay.
      const base: Record<string, unknown> = scope.barangayId
        ? { barangayId: scope.barangayId }
        : {};
      if (SELF_OWNED_MODELS.has(model)) {
        base.inhabitantId = scope.inhabitantId;
      }
      return base;
    }

    case "city":
      if (!scope.cityId) {
        throw new TenantScopeError("cityId required for city scope.");
      }
      return { barangay: { cityId: scope.cityId } };

    case "province":
    case "region":
      // Handled by explicit aggregate queries in the hub service.
      return null;

    default:
      return null;
  }
}

/** Models a resident may only see their own rows of. */
const SELF_OWNED_MODELS = new Set<string>([
  "CertificateRequest",
  "Concern",
  "SosAlert",
  "Appointment",
  "Feedback",
  "BenefitApplication",
  "Wallet",
]);

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export type { Prisma };
