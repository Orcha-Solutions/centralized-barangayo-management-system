/* eslint-disable no-console */
/**
 * End-to-end smoke test against a running API + seeded DB.
 * Run: pnpm --filter @cbms/api exec tsx src/__smoke__/smoke.ts
 */
import { totpCode } from "@cbms/auth";
import { prisma } from "@cbms/db";

const API = process.env.API_URL ?? "http://localhost:4000";
const PASSWORD = "Cbms#2026";

let pass = 0;
let fail = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    pass++;
    console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    fail++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function api(path: string, opts: RequestInit = {}, token?: string) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });
  const text = await res.text();
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

/** Logs in a staff user, completing MFA enrolment if needed. */
async function loginStaff(email: string): Promise<string> {
  let r = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (r.body?.mfaEnrollmentRequired || r.body?.mfaRequired) {
    // Enrolment returns the secret once; afterwards read it from the DB
    // (only a test can do this — the API never re-exposes it).
    let secret: string | undefined = r.body.secret;
    if (!secret) {
      const u = await prisma.user.findUnique({
        where: { email },
        select: { mfaSecret: true },
      });
      secret = u?.mfaSecret ?? undefined;
    }
    if (!secret) throw new Error(`MFA required for ${email} but no secret available.`);
    r = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: PASSWORD, totp: totpCode(secret) }),
    });
  }
  if (!r.body?.token) throw new Error(`Login failed for ${email}: ${JSON.stringify(r.body)}`);
  return r.body.token;
}

async function main() {
  console.log(`\n🔍 CBMS smoke test → ${API}\n`);

  // ---- health ----
  const health = await api("/health");
  check("health endpoint", health.status === 200 && health.body.status === "ok");

  // ---- public (unauthenticated) ----
  const pub = await api("/public/barangays");
  check("public barangay list", pub.status === 200 && pub.body.items.length >= 16,
    `${pub.body?.items?.length ?? 0} barangays`);

  const noAuth = await api("/inhabitants");
  check("unauthenticated read is refused", noAuth.status === 401);

  // ---- resident ----
  const rLogin = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "resident1@example.ph", password: PASSWORD }),
  });
  const residentToken = rLogin.body.token as string;
  check("resident login (no MFA)", !!residentToken);

  const me = await api("/me/profile", {}, residentToken);
  check("resident profile", me.status === 200 && !!me.body.profile,
    me.body?.profile ? `${me.body.profile.firstName} ${me.body.profile.lastName}` : "");

  // RESIDENT must NOT be able to read the full inhabitant registry of others
  const rInhabitants = await api("/inhabitants", {}, residentToken);
  check("resident blocked from inhabitant registry (RBAC)", rInhabitants.status === 403,
    `status ${rInhabitants.status}`);

  const rWallet = await api("/wallets/me", {}, residentToken);
  check("resident wallet", rWallet.status === 200 || rWallet.status === 404);

  const rExport = await api("/me/data-export", {}, residentToken);
  check("RA 10173 data-subject export", rExport.status === 200 && !!rExport.body.profile);

  // ---- staff (MFA) ----
  const pbToken = await loginStaff("kapitan@barangka.gov.ph");
  check("Punong Barangay login with TOTP MFA", !!pbToken);

  const dash = await api("/dashboard", {}, pbToken);
  check("admin dashboard", dash.status === 200 && dash.body.population?.inhabitants > 0,
    `${dash.body?.population?.inhabitants ?? 0} inhabitants in scope`);

  const inh = await api("/inhabitants?pageSize=5", {}, pbToken);
  check("inhabitant list (tenant-scoped)", inh.status === 200 && inh.body.items.length > 0,
    `${inh.body?.total ?? 0} in this barangay`);

  // Tenant isolation: every returned row must belong to the caller's barangay
  const barangayIds = new Set((inh.body.items ?? []).map((i: any) => i.barangayId));
  check("no cross-tenant rows in list", barangayIds.size === 1,
    `${barangayIds.size} distinct barangayId(s)`);

  const stats = await api("/inhabitants/stats", {}, pbToken);
  check("inhabitant stats", stats.status === 200 && stats.body.total > 0);

  const certs = await api("/certificates?pageSize=5", {}, pbToken);
  check("certificate list", certs.status === 200 && certs.body.items.length > 0,
    `${certs.body?.total ?? 0} requests`);

  const certStats = await api("/certificates/stats", {}, pbToken);
  check("RA 11032 processing metrics", certStats.status === 200,
    `median ${certStats.body?.medianProcessingHours ?? "?"}h, compliant=${certStats.body?.ra11032Compliant}`);

  const kp = await api("/kp/cases", {}, pbToken);
  check("KP case list with statutory deadlines", kp.status === 200 && Array.isArray(kp.body.items),
    `${kp.body?.total ?? 0} cases`);

  const kpDl = await api("/kp/deadlines", {}, pbToken);
  check("KP deadline watch (RA 7160 §410)", kpDl.status === 200);

  const props = await api("/properties?pageSize=5", {}, pbToken);
  check("property register (BAMS parity)", props.status === 200 && props.body.items.length > 0,
    `${props.body?.total ?? 0} assets`);

  const score = await api("/wallet/scorecard", {}, pbToken);
  check("wallet adoption scorecard", score.status === 200 && score.body.registeredWallets > 0,
    `${score.body?.registrationRate}% registered, ${score.body?.merchantsAccepting} merchants`);

  const batches = await api("/wallet/batches", {}, pbToken);
  check("disbursement batches", batches.status === 200 && batches.body.items.length > 0,
    `${batches.body?.items?.length ?? 0} batches`);

  // ---- treasurer: maker–checker ----
  const treasToken = await loginStaff("treasurer@barangka.gov.ph");
  check("Treasurer login", !!treasToken);

  const pendingBatch = (batches.body.items ?? []).find((b: any) => b.status === "for_approval");
  if (pendingBatch) {
    // The treasurer prepared it, so the treasurer must not be able to approve it.
    const selfApprove = await api(
      `/wallet/batches/${pendingBatch.id}/approve`,
      { method: "POST" },
      treasToken,
    );
    check("maker–checker blocks self-approval", selfApprove.status === 403,
      `status ${selfApprove.status}`);
  } else {
    check("maker–checker blocks self-approval", false, "no pending batch seeded");
  }

  // Treasurer must not be able to approve certificates (no issuance:approve)
  const treasCertApprove = await api("/certificates/xxx/approve", { method: "POST" }, treasToken);
  check("treasurer lacks issuance:approve", treasCertApprove.status === 403);

  // ---- VAWC confidentiality ----
  const secToken = await loginStaff("secretary@barangka.gov.ph");
  const secBlotter = await api("/blotter?pageSize=100", {}, secToken);
  const secConfidential = (secBlotter.body.items ?? []).filter((b: any) => b.isConfidential);
  check("secretary cannot see VAWC entries", secConfidential.length === 0,
    `${secConfidential.length} confidential rows visible`);

  const vawToken = await loginStaff("vawdesk@barangka.gov.ph");
  const vawBlotter = await api("/blotter?pageSize=100&category=vawc", {}, vawToken);
  check("VAW desk CAN see VAWC entries",
    vawBlotter.status === 200,
    `${vawBlotter.body?.total ?? 0} vawc rows`);

  // ---- DILG viewer: aggregates only ----
  const dilgToken = await loginStaff("dilg@dilg.gov.ph");
  const dilgRaw = await api("/inhabitants", {}, dilgToken);
  check("DILG viewer blocked from raw PII", dilgRaw.status === 404 || dilgRaw.status === 403,
    `status ${dilgRaw.status}`);

  const dilgReport = await api("/reports/quarterly", {}, dilgToken);
  check("DILG viewer can read aggregates", dilgReport.status === 200,
    dilgReport.body?.period ?? "");

  // ---- hub scorecard ----
  const lguToken = await loginStaff("lgu@marikina.gov.ph");
  const hub = await api("/hub/scorecard", {}, lguToken);
  check("LGU hub scorecard across Marikina", hub.status === 200 && hub.body.rows?.length >= 16,
    `${hub.body?.barangayCount ?? 0} barangays, ${hub.body?.totals?.registeredWallets ?? 0} wallets`);

  console.log(`\n${fail === 0 ? "✅" : "⚠️"}  ${pass} passed, ${fail} failed\n`);
  await prisma.$disconnect();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("smoke test error:", e);
  process.exit(1);
});
