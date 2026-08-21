import { describe, it, expect } from "vitest";
import {
  MockBimsGateway, resolveConflict, isValidPcnFormat, normalizePcn, verifyPhilsys,
} from "./index.js";

describe("BIMS adapter — honest about not being connected", () => {
  const gw = new MockBimsGateway();

  it("declares itself a mock", () => {
    expect(gw.isMock).toBe(true);
  });

  it("reports NO authorization until a DILG data-sharing agreement exists", async () => {
    expect(await gw.isAuthorized("1374501001")).toBe(false);
  });

  it("refuses to push a reconciliation voucher", async () => {
    const r = await gw.pushReconVoucher({
      barangayPsgc: "1374501001", period: "2026-Q3",
      totalCollectedCentavos: "100000", totalDisbursedCentavos: "50000", note: "test",
    });
    expect(r.accepted).toBe(false);
  });

  it("exports RBI rows in BIMS Form B column order", async () => {
    const csv = await gw.exportRbiForms([{
      bimsRef: "BIPS-1", householdNo: "HH-00001", lastName: "Dela Cruz", firstName: "Juan",
      sex: "male", birthDate: "1980-05-04T00:00:00.000Z", isSenior: false, isPwd: true,
      updatedAt: new Date().toISOString(),
    }]);
    const [header, row] = csv.split("\n");
    expect(header!.startsWith("HOUSEHOLD_NO,PUROK,ADDRESS,LAST_NAME,FIRST_NAME")).toBe(true);
    expect(row).toContain("Dela Cruz");
    expect(row).toContain("1980-05-04");
    expect(row!.endsWith(",N")).toBe(true); // VOTER = N
  });
});

describe("companion mode conflict policy", () => {
  it("always lets BIMS win — we never overwrite the system of record", () => {
    expect(resolveConflict("ours", "theirs")).toBe("theirs");
  });
});

describe("PhilSys number handling", () => {
  it("accepts 16 digits with or without dashes", () => {
    expect(isValidPcnFormat("1234-5678-9012-3456")).toBe(true);
    expect(isValidPcnFormat("1234567890123456")).toBe(true);
  });
  it("rejects malformed numbers", () => {
    expect(isValidPcnFormat("1234-5678")).toBe(false);
    expect(isValidPcnFormat("abcd-5678-9012-3456")).toBe(false);
  });
  it("normalizes to 4-4-4-4", () => {
    expect(normalizePcn("1234567890123456")).toBe("1234-5678-9012-3456");
  });
  it("never claims a real PSA verification", async () => {
    const v = await verifyPhilsys("1234-5678-9012-3456");
    expect(v.isMock).toBe(true);
    expect(v.reason).toMatch(/no live PSA/i);
  });
});
