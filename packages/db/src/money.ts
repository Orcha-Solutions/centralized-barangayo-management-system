/**
 * Money is handled in centavos (BigInt) everywhere in the wallet and ledger.
 * Never use floating point for pesos.
 */

export type Centavos = bigint;

/** Peso number/string -> centavos. `money(1234.56)` -> 123456n */
export function money(peso: number | string): Centavos {
  const s = typeof peso === "number" ? peso.toFixed(2) : peso.trim();
  const neg = s.startsWith("-");
  const clean = (neg ? s.slice(1) : s).replace(/[₱,\s]/g, "");
  const [whole, frac = ""] = clean.split(".");
  const cents = `${whole}${frac.padEnd(2, "0").slice(0, 2)}`;
  const value = BigInt(cents || "0");
  return neg ? -value : value;
}

/** Alias for readability at call sites. */
export const centavos = money;

/** Centavos -> peso number (display/report only; never for arithmetic). */
export function toPeso(c: Centavos): number {
  return Number(c) / 100;
}

/** Centavos -> "₱1,234.56" */
export function formatPeso(c: Centavos): string {
  const neg = c < 0n;
  const abs = neg ? -c : c;
  const whole = abs / 100n;
  const frac = abs % 100n;
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}₱${wholeStr}.${frac.toString().padStart(2, "0")}`;
}

/** Split an amount into n parts without losing centavos. */
export function splitEvenly(total: Centavos, parts: number): Centavos[] {
  if (parts <= 0) return [];
  const base = total / BigInt(parts);
  const remainder = total - base * BigInt(parts);
  return Array.from({ length: parts }, (_, i) =>
    i < Number(remainder) ? base + 1n : base,
  );
}

/** Basis-points fee (e.g. MDR 150 bps = 1.5%), rounded half-up. */
export function bpsFee(amount: Centavos, bps: number): Centavos {
  if (bps <= 0) return 0n;
  const numerator = amount * BigInt(bps);
  const q = numerator / 10000n;
  const r = numerator % 10000n;
  return r * 2n >= 10000n ? q + 1n : q;
}
