import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "@cbms/db";
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyTotp,
  generateTotpSecret,
  totpUri,
  randomToken,
} from "@cbms/auth";
import { STAFF_ROLES, permissionsFor, effectiveScope } from "@cbms/rbac";
import { buildContext } from "../context.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  /** Required for staff roles once MFA is enrolled. */
  totp: z.string().optional(),
});

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (req, reply) => {
    const { email, password, totp } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    // Uniform failure response — no user enumeration.
    if (!user || !user.isActive || !verifyPassword(password, user.passwordHash)) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "Invalid email or password.",
      });
    }

    const roles = user.roles.map((r) => r.role.key as string);
    const isStaff = roles.some((r) => (STAFF_ROLES as readonly string[]).includes(r));

    // Staff must pass MFA. In dev, enrollment is lazy: if no secret is set we
    // issue one and ask the client to enrol.
    let mfaPassed = !isStaff;
    if (isStaff) {
      if (!user.mfaSecret) {
        const secret = generateTotpSecret();
        await prisma.user.update({
          where: { id: user.id },
          data: { mfaSecret: secret, mfaEnabled: true },
        });
        return reply.status(200).send({
          mfaEnrollmentRequired: true,
          secret,
          otpauthUri: totpUri(secret, user.email ?? user.id),
          message: "Scan this in your authenticator, then log in again with the 6-digit code.",
        });
      }
      if (!totp) {
        return reply.status(200).send({
          mfaRequired: true,
          message: "Enter the 6-digit code from your authenticator app.",
        });
      }
      if (!verifyTotp(user.mfaSecret, totp)) {
        return reply.status(401).send({ error: "Unauthorized", message: "Invalid MFA code." });
      }
      mfaPassed = true;
    }

    const token = await signToken({
      sub: user.id,
      roles,
      barangayId: user.barangayId ?? undefined,
      cityId: user.cityId ?? undefined,
      inhabitantId: user.inhabitantId ?? undefined,
      mfa: mfaPassed,
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token: randomToken(24),
        ip: req.ip,
        userAgent: req.headers["user-agent"] ?? null,
        mfaPassed,
        expiresAt: new Date(Date.now() + 8 * 3600_000),
      },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await prisma.auditLog.create({
      data: {
        barangayId: user.barangayId,
        actorId: user.id,
        actorRole: roles[0] ?? null,
        action: "auth.login",
        entity: "User",
        entityId: user.id,
        ip: req.ip,
      },
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles,
        scope: effectiveScope(roles),
        barangayId: user.barangayId,
        cityId: user.cityId,
        inhabitantId: user.inhabitantId,
        permissions: [...permissionsFor(roles)],
      },
    };
  });

  app.get("/auth/me", async (req) => {
    const ctx = await buildContext(req);
    const user = await prisma.user.findUnique({
      where: { id: ctx.principal.userId },
      include: {
        roles: { include: { role: true } },
        barangay: { select: { id: true, name: true, mode: true, psgcCode: true } },
        city: { select: { id: true, name: true } },
      },
    });
    if (!user) return { user: null };
    const roles = user.roles.map((r) => r.role.key as string);
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles,
        roleLabels: user.roles.map((r) => r.role.name),
        scope: effectiveScope(roles),
        barangay: user.barangay,
        city: user.city,
        inhabitantId: user.inhabitantId,
        permissions: [...permissionsFor(roles)],
      },
    };
  });

  app.post("/auth/logout", async (req) => {
    const ctx = await buildContext(req);
    await prisma.session.deleteMany({ where: { userId: ctx.principal.userId } });
    await ctx.audit({ action: "auth.logout", entity: "User", entityId: ctx.principal.userId });
    return { ok: true };
  });

  // Password change (self-service)
  app.post("/auth/change-password", async (req, reply) => {
    const ctx = await buildContext(req);
    const body = z
      .object({ current: z.string(), next: z.string().min(8) })
      .parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: ctx.principal.userId } });
    if (!user || !verifyPassword(body.current, user.passwordHash)) {
      return reply.status(401).send({ error: "Unauthorized", message: "Current password is incorrect." });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(body.next) },
    });
    await ctx.audit({ action: "auth.password_change", entity: "User", entityId: user.id });
    return { ok: true };
  });
}
