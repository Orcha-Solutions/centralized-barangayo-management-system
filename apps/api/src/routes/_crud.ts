import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Action, ModuleKey } from "@cbms/rbac";
import { buildContext } from "../context.js";

/**
 * Generic list/detail/create/update/delete routes for a Prisma model,
 * with tenant scoping, RBAC and audit applied automatically.
 * Modules with real business rules (wallet, issuance, KP) add bespoke routes on top.
 */
export interface CrudOptions {
  /** URL segment, e.g. "properties" */
  path: string;
  /** Prisma delegate name, e.g. "property" */
  model: string;
  /** RBAC module key */
  module: ModuleKey;
  /** Fields the list endpoint may search over (case-insensitive contains). */
  searchFields?: string[];
  /** Prisma `include` for detail reads. */
  include?: Record<string, unknown>;
  /** Prisma `include`/`select` for list reads. */
  listInclude?: Record<string, unknown>;
  /** Default ordering. */
  orderBy?: Record<string, "asc" | "desc">;
  /** Zod schema for create. */
  createSchema?: z.ZodTypeAny;
  /** Zod schema for update. */
  updateSchema?: z.ZodTypeAny;
  /** Extra equality filters accepted from the query string. */
  filterFields?: string[];
  /** Disable specific verbs. */
  disable?: Partial<Record<"list" | "get" | "create" | "update" | "remove", boolean>>;
  /** Action required for writes (default "encode"). */
  writeAction?: Action;
}

const listQuery = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
  sort: z.string().optional(),
  dir: z.enum(["asc", "desc"]).optional(),
});

export function crudRoutes(app: FastifyInstance, opts: CrudOptions) {
  const base = `/${opts.path}`;
  const writeAction: Action = opts.writeAction ?? "encode";

  if (!opts.disable?.list) {
    app.get(base, async (req) => {
      const ctx = await buildContext(req);
      ctx.can(opts.module, "view");

      const query = listQuery.parse(req.query ?? {});
      const raw = (req.query ?? {}) as Record<string, string>;

      const where: Record<string, unknown> = {};
      if (query.q && opts.searchFields?.length) {
        where.OR = opts.searchFields.map((f) => ({
          [f]: { contains: query.q, mode: "insensitive" },
        }));
      }
      for (const f of opts.filterFields ?? []) {
        if (raw[f] !== undefined && raw[f] !== "" && raw[f] !== "all") {
          where[f] = raw[f];
        }
      }

      const orderBy = query.sort
        ? { [query.sort]: query.dir ?? "desc" }
        : (opts.orderBy ?? { createdAt: "desc" });

      const delegate = (ctx.db as never as Record<string, any>)[opts.model];
      const [items, total] = await Promise.all([
        delegate.findMany({
          where,
          include: opts.listInclude,
          orderBy,
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        }),
        delegate.count({ where }),
      ]);

      return {
        items: serialize(items),
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      };
    });
  }

  if (!opts.disable?.get) {
    app.get(`${base}/:id`, async (req, reply) => {
      const ctx = await buildContext(req);
      ctx.can(opts.module, "view");
      const { id } = z.object({ id: z.string() }).parse(req.params);
      const delegate = (ctx.db as never as Record<string, any>)[opts.model];
      const item = await delegate.findFirst({ where: { id }, include: opts.include });
      if (!item) return reply.status(404).send({ error: "NotFound", message: "Not found." });
      return serialize(item);
    });
  }

  if (!opts.disable?.create && opts.createSchema) {
    app.post(base, async (req, reply) => {
      const ctx = await buildContext(req);
      ctx.can(opts.module, writeAction);
      const data = opts.createSchema!.parse(req.body);
      const delegate = (ctx.db as never as Record<string, any>)[opts.model];
      const created = await delegate.create({ data });
      await ctx.audit({
        action: `${opts.path}.create`,
        entity: opts.model,
        entityId: created.id,
        diff: data,
      });
      return reply.status(201).send(serialize(created));
    });
  }

  if (!opts.disable?.update && opts.updateSchema) {
    app.patch(`${base}/:id`, async (req) => {
      const ctx = await buildContext(req);
      ctx.can(opts.module, writeAction);
      const { id } = z.object({ id: z.string() }).parse(req.params);
      const data = opts.updateSchema!.parse(req.body);
      const delegate = (ctx.db as never as Record<string, any>)[opts.model];
      const updated = await delegate.update({ where: { id }, data });
      await ctx.audit({
        action: `${opts.path}.update`,
        entity: opts.model,
        entityId: id,
        diff: data,
      });
      return serialize(updated);
    });
  }

  if (!opts.disable?.remove) {
    app.delete(`${base}/:id`, async (req) => {
      const ctx = await buildContext(req);
      ctx.can(opts.module, "configure");
      const { id } = z.object({ id: z.string() }).parse(req.params);
      const delegate = (ctx.db as never as Record<string, any>)[opts.model];
      await delegate.delete({ where: { id } });
      await ctx.audit({ action: `${opts.path}.delete`, entity: opts.model, entityId: id });
      return { ok: true };
    });
  }
}

/** BigInt and Decimal are not JSON-serializable by default. */
export function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_k, v) => {
      if (typeof v === "bigint") return v.toString();
      if (v && typeof v === "object" && "toFixed" in v && "s" in v && "e" in v) {
        return Number(v as never);
      }
      return v;
    }),
  );
}
