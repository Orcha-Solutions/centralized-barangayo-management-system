import { betterAuth } from "better-auth";
import { bearer, jwt, twoFactor } from "better-auth/plugins";
import pg from "pg";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL || "postgresql://cbms:cbms@localhost:5432/cbms";

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4101",
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "cbms-better-auth-secret-key-32-characters-minimum-for-security!",
  database: pool,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "RESIDENT",
        input: false,
      },
      barangayId: {
        type: "string",
        defaultValue: "van6rdk",
        input: false,
      },
      tenantId: {
        type: "string",
        defaultValue: "van6rdk",
        input: false,
      },
      inhabitantId: {
        type: "string",
        required: false,
        input: false,
      },
      scope: {
        type: "string",
        defaultValue: "self",
        input: false,
      },
    },
  },
  plugins: [
    bearer(),
    jwt({
      jwt: {
        expirationTime: "8h",
        definePayload: ({ user }) => ({
          sub: user.id,
          email: user.email,
          name: user.name,
          role: (user as any).role || "RESIDENT",
          barangayId: (user as any).barangayId || "van6rdk",
          tenantId: (user as any).tenantId || "van6rdk",
          inhabitantId: (user as any).inhabitantId || null,
          scope: (user as any).scope || "self",
          iss: "cbms-better-auth",
        }),
      },
    }),
    twoFactor({
      issuer: "CBMS Citizen Portal",
    }),
  ],
});
