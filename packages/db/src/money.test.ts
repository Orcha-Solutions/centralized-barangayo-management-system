import { describe, it, expect } from "vitest";
import { money, toPeso, formatPeso, splitEvenly, bpsFee } from "./money.js";

describe("money — peso/centavo conversion", () => {
  it("converts whole pesos", () => {
    expect(money(1000)).toBe(100000n);
    expect(money("1000")).toBe(100000n);
  });

  it("converts fractional pesos without float drift", () => {
    expect(money(1234.56)).toBe(123456n);
    expect(money("1234.56")).toBe(123456n);
    // The classic float trap: 0.1 + 0.2 !== 0.3
    expect(money(0.1) + money(0.2)).toBe(money(0.3));
  });

  it("handles one-decimal and zero-decimal input", () => {
    expect(money("10.5")).toBe(1050n);
    expect(money("10")).toBe(1000n);
  });

  it("strips currency symbols and separators", () => {
    expect(money("₱1,234.56")).toBe(123456n);
    expect(money(" 1,000 ")).toBe(100000n);
  });

  it("handles negatives (reversals)", () => {
    expect(money(-50.25)).toBe(-5025n);
    expect(formatPeso(-5025n)).toBe("-₱50.25");
  });

  it("round-trips through toPeso", () => {
    expect(toPeso(123456n)).toBe(1234.56);
  });

  it("formats with thousands separators", () => {
    expect(formatPeso(0n)).toBe("₱0.00");
    expect(formatPeso(5n)).toBe("₱0.05");
    expect(formatPeso(100000n)).toBe("₱1,000.00");
    expect(formatPeso(123456789n)).toBe("₱1,234,567.89");
  });
});

describe("splitEvenly — no centavo may be lost", () => {
  it("splits evenly when divisible", () => {
    const parts = splitEvenly(100000n, 4);
    expect(parts).toEqual([25000n, 25000n, 25000n, 25000n]);
  });

  it("distributes the remainder without losing centavos", () => {
    const total = 100n; // ₱1.00 across 3 payees
    const parts = splitEvenly(total, 3);
    expect(parts.reduce((a, b) => a + b, 0n)).toBe(total);
    expect(parts).toEqual([34n, 33n, 33n]);
  });

  it("conserves the total for an awkward ayuda split", () => {
    const total = money(1000) * 7n; // 7 households
    const parts = splitEvenly(total, 200);
    expect(parts.reduce((a, b) => a + b, 0n)).toBe(total);
  });

  it("returns an empty array for zero parts", () => {
    expect(splitEvenly(1000n, 0)).toEqual([]);
  });
});

describe("bpsFee — merchant discount rate", () => {
  it("is zero at launch (0 bps) to build acceptance", () => {
    expect(bpsFee(money(500), 0)).toBe(0n);
  });

  it("computes 1.5% (150 bps)", () => {
    expect(bpsFee(money(1000), 150)).toBe(money(15));
  });

  it("rounds half-up", () => {
    // ₱0.01 at 5000 bps = 0.5 centavos -> rounds to 1
    expect(bpsFee(1n, 5000)).toBe(1n);
  });

  it("never exceeds the principal for sane rates", () => {
    const amount = money(250);
    expect(bpsFee(amount, 150) < amount).toBe(true);
  });
});
