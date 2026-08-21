import { describe, it, expect } from "vitest";
import {
  MockAiProvider, redact, modelFor, nextStep, requiresHuman, CERTIFICATE_WORKFLOW,
} from "./index.js";

describe("AI guardrails", () => {
  it("redacts PhilSys numbers, mobiles and emails", () => {
    const s = redact("PCN 1234-5678-9012-3456, call 09171234567 or juan@example.ph");
    expect(s).not.toContain("1234-5678-9012-3456");
    expect(s).not.toContain("09171234567");
    expect(s).not.toContain("juan@example.ph");
    expect(s).toContain("[PHILSYS-REDACTED]");
  });

  it("routes volume traffic to the fast model and hard work to the capable one", () => {
    expect(modelFor("fast")).not.toBe(modelFor("complex"));
  });

  it("refuses to answer without tenant context and escalates", async () => {
    const r = await new MockAiProvider().complete({
      surface: "resident_assistant", prompt: "Magkano ang clearance?", locale: "fil",
    });
    expect(r.escalate).toBe(true);
    expect(r.citations).toHaveLength(0);
  });

  it("cites every record it was given", async () => {
    const r = await new MockAiProvider().complete({
      surface: "resident_assistant",
      prompt: "Magkano po ang barangay clearance?",
      locale: "fil",
      context: [
        { module: "issuance", type: "CertificateType", id: "ct1", summary: "Barangay Clearance — ₱50, valid 180 days" },
      ],
    });
    expect(r.citations).toHaveLength(1);
    expect(r.citations[0]!.module).toBe("issuance");
    expect(r.escalate).toBe(false);
  });
});

describe("certificate workflow — a human always signs", () => {
  it("puts a human gate before issuance", () => {
    const gate = CERTIFICATE_WORKFLOW.findIndex((s) => s.isHumanGate);
    const issue = CERTIFICATE_WORKFLOW.findIndex((s) => s.name === "issue_and_notify");
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(issue);
    expect(requiresHuman("human_approval")).toBe(true);
    expect(requiresHuman("draft_certificate")).toBe(false);
  });

  it("advances step by step and finishes", () => {
    expect(nextStep([])!.name).toBe("verify_identity");
    expect(nextStep(["verify_identity", "check_blockers"])!.name).toBe("draft_certificate");
    expect(nextStep(CERTIFICATE_WORKFLOW.map((s) => s.name))).toBeNull();
  });
});
