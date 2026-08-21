import { describe, it, expect } from "vitest";
import {
  can,
  assertCan,
  assertDifferentApprover,
  canSeeConfidentialCase,
  isAggregatesOnly,
  effectiveScope,
  permissionsFor,
  ForbiddenError,
  type Principal,
} from "./guard.js";

const principal = (roles: string[], extra: Partial<Principal> = {}): Principal => ({
  userId: "u1",
  roles,
  mfaPassed: true,
  ...extra,
});

describe("RBAC — role capabilities", () => {
  it("gives the Punong Barangay approval over certificates", () => {
    const pb = principal(["PUNONG_BARANGAY"]);
    expect(can(pb, "issuance", "approve")).toBe(true);
  });

  it("does NOT let the Treasurer approve certificates", () => {
    const t = principal(["BARANGAY_TREASURER"]);
    expect(can(t, "issuance", "approve")).toBe(false);
    expect(() => assertCan(t, "issuance", "approve")).toThrow(ForbiddenError);
  });

  it("lets the Treasurer prepare disbursements but not approve them", () => {
    const t = principal(["BARANGAY_TREASURER"]);
    expect(can(t, "wallet", "encode")).toBe(true);
    expect(can(t, "wallet", "disburse")).toBe(true);
    expect(can(t, "wallet", "approve")).toBe(false);
  });

  it("lets the Punong Barangay approve but not prepare disbursements", () => {
    const pb = principal(["PUNONG_BARANGAY"]);
    expect(can(pb, "wallet", "approve")).toBe(true);
    expect(can(pb, "wallet", "encode")).toBe(false);
  });

  it("blocks residents from the inhabitant registry", () => {
    const r = principal(["RESIDENT"]);
    expect(can(r, "inhabitants", "view")).toBe(false);
    expect(can(r, "concerns", "encode")).toBe(true);
  });

  it("gives the system admin everything", () => {
    const a = principal(["SYSTEM_ADMIN"]);
    expect(can(a, "wallet", "disburse")).toBe(true);
    expect(can(a, "vawc", "view")).toBe(true);
  });

  it("unions permissions across multiple roles", () => {
    const perms = permissionsFor(["BARANGAY_TREASURER", "BARANGAY_SECRETARY"]);
    expect(perms.has("finance:approve")).toBe(true);
    expect(perms.has("inhabitants:encode")).toBe(true);
  });
});

describe("VAWC confidentiality (A3)", () => {
  it("permits only the VAW desk, the Punong Barangay and the system admin", () => {
    expect(canSeeConfidentialCase(principal(["VAW_DESK_OFFICER"]))).toBe(true);
    expect(canSeeConfidentialCase(principal(["PUNONG_BARANGAY"]))).toBe(true);
    expect(canSeeConfidentialCase(principal(["SYSTEM_ADMIN"]))).toBe(true);
  });

  it("refuses everyone else, including the Secretary and Lupon", () => {
    expect(canSeeConfidentialCase(principal(["BARANGAY_SECRETARY"]))).toBe(false);
    expect(canSeeConfidentialCase(principal(["LUPON_SECRETARY"]))).toBe(false);
    expect(canSeeConfidentialCase(principal(["TANOD"]))).toBe(false);
  });
});

describe("maker–checker on public funds (LGC §375)", () => {
  it("blocks the preparer from approving their own batch", () => {
    expect(() => assertDifferentApprover("user-a", "user-a")).toThrow(ForbiddenError);
  });

  it("allows a different approver", () => {
    expect(() => assertDifferentApprover("user-a", "user-b")).not.toThrow();
  });

  it("allows approval when no preparer is recorded", () => {
    expect(() => assertDifferentApprover(null, "user-b")).not.toThrow();
  });
});

describe("scope resolution", () => {
  it("resolves the broadest scope across roles", () => {
    expect(effectiveScope(["RESIDENT"])).toBe("self");
    expect(effectiveScope(["PUNONG_BARANGAY"])).toBe("barangay");
    expect(effectiveScope(["LGU_ADMIN"])).toBe("city");
    expect(effectiveScope(["SYSTEM_ADMIN"])).toBe("platform");
    expect(effectiveScope(["RESIDENT", "LGU_ADMIN"])).toBe("city");
  });

  it("marks the DILG viewer as aggregates-only", () => {
    expect(isAggregatesOnly(["DILG_VIEWER"])).toBe(true);
    expect(isAggregatesOnly(["PUNONG_BARANGAY"])).toBe(false);
    // A system admin who also holds the viewer role is not restricted.
    expect(isAggregatesOnly(["DILG_VIEWER", "SYSTEM_ADMIN"])).toBe(false);
  });
});
