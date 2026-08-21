import { describe, it, expect } from "vitest";
import {
  computeKpDeadlines,
  kpDeadlineStatus,
  KP_MEDIATION_DAYS,
  KP_CONCILIATION_DAYS,
} from "./kp.js";

const DAY = 86400_000;
const filed = new Date("2026-01-01T00:00:00.000Z");

describe("Katarungang Pambarangay timelines (RA 7160 §410)", () => {
  it("gives the Punong Barangay 15 days to mediate", () => {
    const dl = computeKpDeadlines(filed);
    expect(dl.mediationDueAt.getTime()).toBe(filed.getTime() + KP_MEDIATION_DAYS * DAY);
  });

  it("gives the Pangkat a further 15 days to conciliate", () => {
    const dl = computeKpDeadlines(filed);
    expect(dl.conciliationDueAt.getTime()).toBe(
      filed.getTime() + (KP_MEDIATION_DAYS + KP_CONCILIATION_DAYS) * DAY,
    );
  });

  it("allows a 15-day extension", () => {
    const dl = computeKpDeadlines(filed);
    expect(dl.extendedDueAt.getTime()).toBe(filed.getTime() + 45 * DAY);
  });
});

describe("deadline status by stage", () => {
  it("tracks the mediation deadline while filed or in mediation", () => {
    const at = new Date(filed.getTime() + 10 * DAY);
    for (const stage of ["filed", "mediation"]) {
      const s = kpDeadlineStatus(stage, filed, at);
      expect(s.daysRemaining).toBe(5);
      expect(s.breached).toBe(false);
    }
  });

  it("flags a breach once mediation runs past 15 days", () => {
    const at = new Date(filed.getTime() + 17 * DAY);
    const s = kpDeadlineStatus("mediation", filed, at);
    expect(s.breached).toBe(true);
    expect(s.daysRemaining).toBeLessThan(0);
  });

  it("switches to the conciliation deadline at the Pangkat stage", () => {
    const at = new Date(filed.getTime() + 20 * DAY);
    const s = kpDeadlineStatus("conciliation", filed, at);
    expect(s.daysRemaining).toBe(10); // 30-day mark
    expect(s.breached).toBe(false);
  });

  it("stops tracking once the case is closed", () => {
    for (const stage of ["settled", "cfa_issued", "dismissed", "withdrawn", "repudiated"]) {
      const s = kpDeadlineStatus(stage, filed, new Date(filed.getTime() + 400 * DAY));
      expect(s.dueAt).toBeNull();
      expect(s.breached).toBe(false);
    }
  });

  it("reports the exact due date it is measuring against", () => {
    const s = kpDeadlineStatus("filed", filed, filed);
    expect(s.dueAt?.getTime()).toBe(filed.getTime() + 15 * DAY);
    expect(s.daysRemaining).toBe(15);
  });
});
