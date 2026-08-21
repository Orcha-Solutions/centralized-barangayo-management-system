import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";
import { prisma } from "@cbms/db";
import { ForbiddenError } from "@cbms/rbac";
import { UnauthorizedError } from "./context.js";
import { registerRoutes } from "./routes/index.js";

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true, singleLine: true } }
        : undefined,
  },
});

await app.register(cors, {
  origin: (origin, cb) => cb(null, true), // dev: all local apps
  credentials: true,
});

// Action endpoints (e.g. POST /certificates/:id/approve) carry no body.
// Treat an empty application/json body as {} instead of rejecting it.
app.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (_req, body, done) => {
    const raw = typeof body === "string" ? body.trim() : "";
    if (raw === "") return done(null, {});
    try {
      done(null, JSON.parse(raw));
    } catch (err) {
      (err as Error & { statusCode?: number }).statusCode = 400;
      done(err as Error, undefined);
    }
  },
);

await app.register(rateLimit, {
  max: 300,
  timeWindow: "1 minute",
  keyGenerator: (req) => (req.headers.authorization ?? req.ip) as string,
});

// ---- error mapping ----
app.setErrorHandler((error: any, req, reply) => {
  if (error instanceof ZodError) {
    return reply.status(422).send({
      error: "ValidationError",
      message: "Request failed validation.",
      issues: error.issues,
    });
  }
  if (error instanceof UnauthorizedError || error.name === "UnauthorizedError") {
    return reply.status(401).send({ error: "Unauthorized", message: error.message });
  }
  if (error instanceof ForbiddenError || error.name === "ForbiddenError") {
    return reply.status(403).send({ error: "Forbidden", message: error.message });
  }
  if (error.name === "TenantScopeError") {
    // Cross-tenant access attempt — surfaced as 404 to avoid leaking existence.
    req.log.warn({ err: error }, "tenant scope violation");
    return reply.status(404).send({ error: "NotFound", message: "Resource not found." });
  }
  req.log.error({ err: error }, "unhandled error");
  return reply.status(error.statusCode ?? 500).send({
    error: error.name || "InternalServerError",
    message:
      process.env.NODE_ENV === "production" ? "Something went wrong." : error.message,
  });
});

// ---- health & observability ----
app.get("/health", async () => {
  return {
    status: "ok",
    service: "cbms-api",
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
});

await registerRoutes(app);

const port = Number(process.env.API_PORT ?? 4000);
try {
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`CBMS API listening on http://localhost:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
