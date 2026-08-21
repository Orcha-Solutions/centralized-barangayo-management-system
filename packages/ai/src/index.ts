/**
 * B2 — AI agentic layer.
 *
 * Provider-agnostic. Every answer must carry citations back to tenant data, every
 * action is audited by the caller, and anything official passes through a human gate.
 * The default provider is a deterministic mock so demos and tests never need a key.
 */

export type AiSurface =
  | "resident_assistant"
  | "staff_copilot"
  | "analytics_copilot"
  | "oversight";

export interface Citation {
  module: string;
  type: string;
  id?: string;
  label?: string;
}

export interface AiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AiRequest {
  surface: AiSurface;
  prompt: string;
  /** Records the caller is permitted to see — the model never gets more than this. */
  context?: Array<{ module: string; type: string; id?: string; summary: string }>;
  history?: AiMessage[];
  /** "fast" routes cheap/high-volume traffic; "complex" for genuinely hard tasks. */
  tier?: "fast" | "complex";
  locale?: "en" | "fil";
}

export interface AiResponse {
  text: string;
  citations: Citation[];
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  latencyMs: number;
  /** True when the model could not answer from tenant data and a ticket should be raised. */
  escalate?: boolean;
}

export interface AiProvider {
  readonly name: string;
  readonly isMock: boolean;
  complete(req: AiRequest): Promise<AiResponse>;
}

// ---------------------------------------------------------------
// Model routing — cheap models for volume, capable models for hard work.
// ---------------------------------------------------------------

export function modelFor(tier: "fast" | "complex" = "fast"): string {
  return tier === "complex"
    ? process.env.AI_MODEL_COMPLEX ?? "claude-opus-4-8"
    : process.env.AI_MODEL_FAST ?? "claude-haiku-4-5-20251001";
}

// ---------------------------------------------------------------
// Guardrails
// ---------------------------------------------------------------

export const SYSTEM_PROMPT = `You are the assistant inside CBMS, a barangay management platform in the Philippines.

Rules you must follow:
1. Answer ONLY from the barangay records provided in context. If the answer is not there, say so plainly and offer to raise a support ticket. Never invent a fee, a requirement, a deadline, or a rule.
2. Cite the records you used.
3. You draft and recommend. You never approve, issue, or release anything — a named official signs.
4. Personal data stays inside this conversation. Never repeat another resident's details.
5. Match the language of the question. Filipino or Taglish is normal and welcome; keep it warm and plain.`;

/** Redacts obvious PII before anything is logged or sent to a provider. */
export function redact(text: string): string {
  return text
    .replace(/\b\d{4}-\d{4}-\d{4}-\d{4}\b/g, "[PHILSYS-REDACTED]")
    .replace(/\b09\d{9}\b/g, "[MOBILE-REDACTED]")
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, "[EMAIL-REDACTED]");
}

// ---------------------------------------------------------------
// Mock provider — deterministic, offline, good enough to demo.
// ---------------------------------------------------------------

export class MockAiProvider implements AiProvider {
  readonly name = "MockAI (dev)";
  readonly isMock = true;

  async complete(req: AiRequest): Promise<AiResponse> {
    const started = Date.now();
    const citations: Citation[] = (req.context ?? []).map((c) => ({
      module: c.module,
      type: c.type,
      id: c.id,
      label: c.summary.slice(0, 80),
    }));

    const text = this.answer(req);
    return {
      text,
      citations,
      model: `${modelFor(req.tier)} (mocked)`,
      latencyMs: Date.now() - started + 40,
      escalate: citations.length === 0 && req.surface === "resident_assistant",
    };
  }

  private answer(req: AiRequest): string {
    const ctx = req.context ?? [];
    const fil = req.locale === "fil";
    const q = req.prompt.toLowerCase();

    if (ctx.length === 0) {
      return fil
        ? "Pasensya na po — wala po akong makitang record dito sa barangay na sumasagot diyan. Gusto n'yo po bang gumawa ako ng ticket para matulungan kayo ng staff?"
        : "I couldn't find a barangay record that answers that. Would you like me to raise a support ticket so staff can help?";
    }

    if (req.surface === "resident_assistant") {
      const lines = ctx.slice(0, 4).map((c) => `• ${c.summary}`).join("\n");
      if (q.includes("clearance") || q.includes("magkano") || q.includes("fee")) {
        return fil
          ? `Narito po ang nakita ko sa records ng barangay:\n\n${lines}\n\nPwede po kayong mag-request online dito sa app. Kapag bayad na, ang Punong Barangay na po ang mag-a-approve bago ito ma-release.`
          : `Here's what the barangay's records show:\n\n${lines}\n\nYou can file the request in this app. Once it's paid, the Punong Barangay approves it before release.`;
      }
      return fil
        ? `Base po sa records ng barangay:\n\n${lines}`
        : `Based on the barangay's records:\n\n${lines}`;
    }

    if (req.surface === "staff_copilot") {
      return `Draft prepared from ${ctx.length} record(s):\n\n${ctx
        .slice(0, 6)
        .map((c) => `• ${c.summary}`)
        .join("\n")}\n\nReview and edit before signing — this is a draft, not an issued document.`;
    }

    if (req.surface === "analytics_copilot") {
      return `Aggregate view over ${ctx.length} grouped row(s):\n\n${ctx
        .slice(0, 8)
        .map((c) => `• ${c.summary}`)
        .join("\n")}\n\nThese are aggregates only — no personal data was read.`;
    }

    return ctx.map((c) => `• ${c.summary}`).join("\n");
  }
}

// ---------------------------------------------------------------
// Anthropic provider (used when ANTHROPIC_API_KEY is present)
// ---------------------------------------------------------------

export class AnthropicProvider implements AiProvider {
  readonly name = "Anthropic";
  readonly isMock = false;

  constructor(private apiKey: string) {}

  async complete(req: AiRequest): Promise<AiResponse> {
    const started = Date.now();
    const model = modelFor(req.tier);

    const contextBlock = (req.context ?? [])
      .map((c) => `[${c.module}/${c.type}${c.id ? `#${c.id}` : ""}] ${c.summary}`)
      .join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          ...(req.history ?? []).map((m) => ({ role: m.role, content: m.content })),
          {
            role: "user",
            content: contextBlock
              ? `Barangay records available to you:\n${contextBlock}\n\nQuestion: ${req.prompt}`
              : req.prompt,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
    }
    const body = (await res.json()) as {
      content: Array<{ type: string; text?: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };

    return {
      text: body.content.map((c) => c.text ?? "").join("").trim(),
      citations: (req.context ?? []).map((c) => ({
        module: c.module,
        type: c.type,
        id: c.id,
        label: c.summary.slice(0, 80),
      })),
      model,
      tokensIn: body.usage?.input_tokens,
      tokensOut: body.usage?.output_tokens,
      latencyMs: Date.now() - started,
    };
  }
}

let _provider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (_provider) return _provider;
  const which = process.env.AI_PROVIDER ?? "mock";
  const key = process.env.ANTHROPIC_API_KEY;
  _provider = which === "anthropic" && key ? new AnthropicProvider(key) : new MockAiProvider();
  return _provider;
}

export function setAiProvider(p: AiProvider) {
  _provider = p;
}

// ---------------------------------------------------------------
// Agentic workflow — an inspectable state machine, not a black box.
// ---------------------------------------------------------------

export interface WorkflowStep {
  seq: number;
  name: string;
  status: "completed" | "failed" | "awaiting_approval";
  isHumanGate: boolean;
  input?: unknown;
  output?: unknown;
}

/**
 * The certificate-issuance workflow. Step 4 is a hard human gate: the run pauses
 * until a named official approves. Nothing is issued by the agent itself.
 */
export const CERTIFICATE_WORKFLOW = [
  { name: "verify_identity", isHumanGate: false, describe: "Match the requester against the inhabitant registry (BIPS)." },
  { name: "check_blockers", isHumanGate: false, describe: "Check for unpaid fees and open KP matters." },
  { name: "draft_certificate", isHumanGate: false, describe: "Render the certificate body from the barangay's template." },
  { name: "human_approval", isHumanGate: true, describe: "Punong Barangay reviews and signs." },
  { name: "issue_and_notify", isHumanGate: false, describe: "Release the document and notify the resident." },
] as const;

export function nextStep(completed: string[]): (typeof CERTIFICATE_WORKFLOW)[number] | null {
  return CERTIFICATE_WORKFLOW.find((s) => !completed.includes(s.name)) ?? null;
}

export function requiresHuman(stepName: string): boolean {
  return CERTIFICATE_WORKFLOW.find((s) => s.name === stepName)?.isHumanGate ?? false;
}
