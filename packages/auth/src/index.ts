import crypto from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

// ---------------- passwords (scrypt) ----------------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(derived, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---------------- JWT ----------------

export interface JwtClaims {
  sub: string;
  roles: string[];
  barangayId?: string;
  cityId?: string;
  inhabitantId?: string;
  mfa: boolean;
}

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET missing or too short.");
  }
  return new TextEncoder().encode(s);
}

export async function signToken(
  claims: JwtClaims,
  expiresIn = process.env.JWT_EXPIRES_IN ?? "8h",
): Promise<string> {
  return new SignJWT({ ...claims } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("cbms")
    .setExpirationTime(expiresIn)
    .sign(secret());
}

export async function verifyToken(token: string): Promise<JwtClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: "cbms" });
    return {
      sub: String(payload.sub ?? payload["sub"]),
      roles: (payload["roles"] as string[]) ?? [],
      barangayId: payload["barangayId"] as string | undefined,
      cityId: payload["cityId"] as string | undefined,
      inhabitantId: payload["inhabitantId"] as string | undefined,
      mfa: Boolean(payload["mfa"]),
    };
  } catch {
    return null;
  }
}

// ---------------- TOTP (RFC 6238) for staff MFA ----------------

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(bytes = 20): string {
  const buf = crypto.randomBytes(bytes);
  let bits = "";
  for (const b of buf) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += B32[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

function b32Decode(s: string): Buffer {
  const clean = s.replace(/=+$/, "").toUpperCase();
  let bits = "";
  for (const c of clean) {
    const idx = B32.indexOf(c);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function totpCode(secretB32: string, at: number = Date.now(), step = 30): string {
  const counter = Math.floor(at / 1000 / step);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", b32Decode(secretB32)).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const bin =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return (bin % 1_000_000).toString().padStart(6, "0");
}

/** Verifies a TOTP code with a ±1 step window. */
export function verifyTotp(secretB32: string, code: string, at = Date.now()): boolean {
  const c = code.replace(/\s/g, "");
  for (const drift of [-1, 0, 1]) {
    if (totpCode(secretB32, at + drift * 30_000) === c) return true;
  }
  return false;
}

export function totpUri(secretB32: string, account: string, issuer = "CBMS"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secretB32}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

/** Numeric OTP for SMS/email fallback (SMS is OTP-only by policy). */
export function generateNumericOtp(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i++) out += crypto.randomInt(0, 10).toString();
  return out;
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}
