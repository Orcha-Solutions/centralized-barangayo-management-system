import crypto from "node:crypto";

/**
 * Field-level encryption for sensitive columns (KP/VAWC narratives, health notes).
 * AES-256-GCM. Ciphertext is stored as `enc:v1:<iv>:<tag>:<data>` (base64 parts).
 */

const PREFIX = "enc:v1:";

function key(): Buffer {
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "FIELD_ENCRYPTION_KEY is not set — refusing to handle sensitive fields.",
    );
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    // Derive a stable 32-byte key from whatever was provided.
    return crypto.createHash("sha256").update(raw).digest();
  }
  return buf;
}

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function encryptField(plaintext: string | null | undefined): string | null {
  if (plaintext === null || plaintext === undefined || plaintext === "") return null;
  if (isEncrypted(plaintext)) return plaintext;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptField(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (!isEncrypted(value)) return value; // legacy/plaintext passthrough

  const body = value.slice(PREFIX.length);
  const [ivB64, tagB64, dataB64] = body.split(":");
  if (!ivB64 || !tagB64 || !dataB64) return null;

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key(),
      Buffer.from(ivB64, "base64"),
    );
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64")),
      decipher.final(),
    ]);
    return dec.toString("utf8");
  } catch {
    return null;
  }
}
