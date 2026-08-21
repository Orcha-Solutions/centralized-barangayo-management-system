import type { FastifyRequest } from "fastify";
import { verifyToken } from "@cbms/auth";
import {
  createScopedClient,
  prisma,
  type TenantScope,
} from "@cbms/db";
import {
  assertCan,
  effectiveScope,
  isAggregatesOnly,
  type Action,
  type ModuleKey,
  type Principal,
} from "@cbms/rbac";

export interface RequestContext {
  principal: Principal;
  scope: TenantScope;
  /** Tenant-scoped Prisma client — every query is constrained server-side. */
  db: ReturnType<typeof createScopedClient>;
  can: (module: ModuleKey, action: Action) => void;
  audit: (input: AuditInput) => Promise<void>;
}

export interface AuditInput {
  action: string;
  entity: string;
  entityId?: string;
  diff?: unknown;
  isAiAction?: boolean;
}

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Builds the per-request context from the Authorization header. */
export async function buildContext(req: FastifyRequest): Promise<RequestContext> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError();
  }
  const claims = await verifyToken(header.slice(7));
  if (!claims) throw new UnauthorizedError("Invalid or expired token.");

  const principal: Principal = {
    userId: claims.sub,
    roles: claims.roles,
    barangayId: claims.barangayId,
    cityId: claims.cityId,
    inhabitantId: claims.inhabitantId,
    mfaPassed: claims.mfa,
  };

  const level = effectiveScope(principal.roles) as TenantScope["level"];
  const scope: TenantScope = {
    level,
    barangayId: principal.barangayId,
    cityId: principal.cityId,
    inhabitantId: principal.inhabitantId,
    aggregatesOnly: isAggregatesOnly(principal.roles),
  };

  const db = createScopedClient(scope);

  return {
    principal,
    scope,
    db,
    can: (module, action) => assertCan(principal, module, action),
    audit: async (input) => {
      await prisma.auditLog.create({
        data: {
          barangayId: principal.barangayId ?? null,
          actorId: principal.userId,
          actorRole: principal.roles[0] ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          diff: (input.diff as never) ?? undefined,
          ip: req.ip,
          userAgent: req.headers["user-agent"] ?? null,
          isAiAction: input.isAiAction ?? false,
        },
      });
    },
  };
}
