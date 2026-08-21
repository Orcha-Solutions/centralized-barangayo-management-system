/* eslint-disable no-console */
import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "node:crypto";
import {
  ROLE_PERMISSIONS,
  ROLE_SCOPE,
  ROLE_LABELS,
  STAFF_ROLES,
  ALL_PERMISSIONS,
} from "../../rbac/src/permissions";
import * as R from "./seed/reference";

const prisma = new PrismaClient();

// ------------------------------------------------------------------
// helpers
// ------------------------------------------------------------------

/** scrypt password hash — same scheme as packages/auth. */
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

const DEMO_PASSWORD = "Cbms#2026";
const PASSWORD_HASH = hashPassword(DEMO_PASSWORD);

function fullName(f: string, m: string, l: string) {
  return `${f} ${m.charAt(0)}. ${l}`;
}
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function pad(n: number, w = 4) {
  return n.toString().padStart(w, "0");
}
function ref(prefix: string, n: number) {
  return `${prefix}-${new Date().getFullYear()}-${pad(n, 5)}`;
}
function verifyCode() {
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

async function main() {
  console.log("🌱 CBMS seed starting…\n");
  R.resetRng();

  // ----------------------------------------------------------------
  // 0. Clean (idempotent re-seed)
  // ----------------------------------------------------------------
  console.log("  ⤷ clearing existing data");
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "PbVote","PbOption","PbCycle","Assembly","JobApplication","JobPost",
      "BenefitApplication","HealthRecord","HealthCampaign","DigitalId",
      "Feedback","Appointment","AnnouncementReply","Announcement","SosAlert","Concern",
      "AiWorkflowStep","AiWorkflowRun","AiInteraction",
      "Dispute","BillPayment","Biller","AgentFloatLog","Agent","Merchant",
      "DisbursementBatchItem","DisbursementBatch","WalletTransaction","Wallet",
      "BimsSyncRun","FeatureFlag","FileObject","TicketResponse","Ticket",
      "ReportRun","SitePost","SitePage","OfficialReceipt","LedgerEntry",
      "BudgetLine","Budget","InstitutionMinutes","InstitutionMember","Institution",
      "DevProject","DevelopmentPlan","Legislation","GadActivity","GadPlan",
      "ReliefDistribution","EvacuationRecord","DisasterEvent","EvacuationCenter","Hazard",
      "Material","MaintenanceRecord","Property",
      "KpDocument","KpHearing","KpParty","KpCase","BlotterEntry",
      "CertificateRequest","CertificateType",
      "ResidencyHistory","ConsentRecord","AuditLog","Session","UserRole","User",
      "Inhabitant","Household","Barangay","City","Province","Region",
      "RolePermission","Permission","Role"
    RESTART IDENTITY CASCADE;
  `);

  // ----------------------------------------------------------------
  // 1. RBAC — permissions & roles
  // ----------------------------------------------------------------
  console.log("  ⤷ roles & permissions");
  await prisma.permission.createMany({
    data: ALL_PERMISSIONS.map((key) => {
      const [module, action] = key.split(":");
      return { key, module: module!, action: action! };
    }),
  });
  const permRows = await prisma.permission.findMany();
  const permByKey = new Map(permRows.map((p) => [p.key, p.id]));

  for (const [roleKey, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.create({
      data: {
        key: roleKey as any,
        name: ROLE_LABELS[roleKey] ?? roleKey,
        scope: (ROLE_SCOPE[roleKey] ?? "barangay") as any,
        isStaff: (STAFF_ROLES as readonly string[]).includes(roleKey),
      },
    });
    await prisma.rolePermission.createMany({
      data: perms
        .map((p) => permByKey.get(p))
        .filter(Boolean)
        .map((permissionId) => ({ roleId: role.id, permissionId: permissionId! })),
      skipDuplicates: true,
    });
  }
  const roles = await prisma.role.findMany();
  const roleId = (k: string) => roles.find((r) => r.key === k)!.id;

  // ----------------------------------------------------------------
  // 2. PSGC — region → provinces → cities → barangays
  // ----------------------------------------------------------------
  console.log("  ⤷ PSGC geography");
  const region = await prisma.region.create({ data: R.REGION });
  const provinces = [];
  for (const p of R.PROVINCES) {
    provinces.push(
      await prisma.province.create({
        data: { psgcCode: p.psgcCode, name: p.name, regionId: region.id },
      }),
    );
  }
  const cities = [];
  for (const c of R.CITIES) {
    cities.push(
      await prisma.city.create({
        data: {
          psgcCode: c.psgcCode,
          name: c.name,
          isCity: c.isCity,
          provinceId: provinces[c.provinceIdx]!.id,
        },
      }),
    );
  }
  const marikina = cities[0]!;

  const barangays = [];
  for (const b of R.MARIKINA_BARANGAYS) {
    barangays.push(
      await prisma.barangay.create({
        data: {
          psgcCode: b.psgcCode,
          name: b.name,
          cityId: marikina.id,
          status: "active",
          mode: "companion",
          addressLine: `${b.name} Barangay Hall, Marikina City`,
          contactPhone: `(02) 8646-${R.randInt(1000, 9999)}`,
          contactEmail: `${slugify(b.name)}@marikina.gov.ph`,
          hotline: "16-1111",
          puroks: R.PUROKS,
          approvedAt: R.daysAgo(R.randInt(60, 400)),
          brandPrimary: "#0A2463",
          brandAccent: "#FDB913",
        },
      }),
    );
  }
  // One pending barangay to demo the onboarding/approval flow (MC 2025-104 §4.2.1)
  for (const ob of R.OTHER_BARANGAYS) {
    barangays.push(
      await prisma.barangay.create({
        data: {
          psgcCode: ob.psgcCode,
          name: ob.name,
          cityId: cities[ob.cityIdx]!.id,
          status: ob.psgcCode.endsWith("1002") ? "pending" : "active",
          mode: "standalone",
          puroks: R.PUROKS.slice(0, 4),
        },
      }),
    );
  }
  const demoBrgy = barangays[0]!; // Barangka — the primary demo tenant
  console.log(`     ${barangays.length} barangays (${R.MARIKINA_BARANGAYS.length} in Marikina)`);

  // ----------------------------------------------------------------
  // 3. Inhabitants & households
  // ----------------------------------------------------------------
  console.log("  ⤷ households & inhabitants");
  type InhRow = { id: string; barangayId: string; sex: string; age: number; isSenior: boolean };
  const inhabitantsByBrgy = new Map<string, InhRow[]>();
  let hhCounter = 0;
  let totalInh = 0;

  for (const b of barangays) {
    if (b.status === "pending") continue;
    // Demo barangay gets a richer dataset.
    const households = b.id === demoBrgy.id ? 60 : R.randInt(22, 34);
    const list: InhRow[] = [];

    for (let h = 0; h < households; h++) {
      hhCounter++;
      const purok = R.pick(R.PUROKS);
      const street = R.pick(R.STREETS);
      const lastName = R.pick(R.LAST);
      const hh = await prisma.household.create({
        data: {
          barangayId: b.id,
          householdNo: `HH-${pad(hhCounter, 5)}`,
          purok,
          addressLine: `${R.randInt(1, 250)} ${street}, ${purok}`,
          latitude: 14.63 + R.rng() * 0.05,
          longitude: 121.09 + R.rng() * 0.05,
          dwellingType: R.pick(R.DWELLING),
          tenureStatus: R.pick(R.TENURE),
          waterSource: R.pick(R.WATER),
          toiletFacility: R.pick(R.TOILET),
          electricitySource: "Meralco",
          monthlyIncomeBand: R.pick(R.INCOME_BANDS),
          is4Ps: R.chance(0.18),
        },
      });

      const memberCount = R.randInt(2, 6);
      let headId: string | null = null;

      for (let m = 0; m < memberCount; m++) {
        const isHead = m === 0;
        const sex = isHead ? (R.chance(0.6) ? "male" : "female") : R.chance(0.5) ? "male" : "female";
        const first = sex === "male" ? R.pick(R.FIRST_M) : R.pick(R.FIRST_F);
        // Head 28–70; spouse similar; children younger.
        const age = isHead
          ? R.randInt(28, 72)
          : m === 1
            ? R.randInt(26, 68)
            : R.randInt(1, 24);
        const birthDate = new Date(
          Date.now() - age * 365.25 * 24 * 3600 * 1000 - R.randInt(0, 364) * 24 * 3600 * 1000,
        );
        const isSenior = age >= 60;
        const isPwd = R.chance(0.045);

        const inh = await prisma.inhabitant.create({
          data: {
            barangayId: b.id,
            householdId: hh.id,
            relationToHead: isHead ? "Head" : m === 1 ? "Spouse" : "Child",
            firstName: first,
            middleName: R.pick(R.MIDDLE),
            lastName,
            sex: sex as any,
            birthDate,
            birthPlace: "Marikina City",
            civilStatus: age < 20 ? "single" : R.pickWeighted([
              ["married", 5], ["single", 3], ["widowed", 1], ["separated", 1],
            ]) as any,
            philsysNo: R.chance(0.65)
              ? `${R.randInt(1000, 9999)}-${R.randInt(1000, 9999)}-${R.randInt(1000, 9999)}-${R.randInt(1000, 9999)}`
              : null,
            contactPhone: age >= 15 && R.chance(0.8) ? `09${R.randInt(100000000, 999999999)}` : null,
            occupation: age >= 18 ? R.pick(R.OCCUPATIONS) : "Student",
            educationLevel: age >= 12 ? R.pick(R.EDUCATION) : null,
            religion: R.pick(R.RELIGIONS),
            bloodType: R.chance(0.5) ? R.pick(R.BLOOD) : null,
            isSenior,
            isPwd,
            pwdType: isPwd ? R.pick(["Visual", "Mobility", "Hearing", "Intellectual"]) : null,
            isSoloParent: !isHead && m === 1 ? false : R.chance(0.05),
            is4Ps: hh.is4Ps,
            isIndigenous: R.chance(0.02),
            isPregnant: sex === "female" && age >= 18 && age <= 42 && R.chance(0.05),
            isBedridden: isSenior && R.chance(0.06),
            isOfw: age >= 22 && R.chance(0.05),
            isVoter: age >= 18 && R.chance(0.85),
            residencyStart: R.daysAgo(R.randInt(400, 7000)),
            source: b.mode === "companion" && R.chance(0.7) ? "BIMS" : "CBMS",
            bimsRef: R.chance(0.7) ? `BIPS-${pad(R.randInt(1, 99999), 6)}` : null,
          },
        });
        if (isHead) headId = inh.id;
        list.push({ id: inh.id, barangayId: b.id, sex, age, isSenior });
        totalInh++;
      }

      if (headId) {
        await prisma.household.update({ where: { id: hh.id }, data: { headId } });
        // Consent artifacts (RA 10173) — required before any sharing/disbursement use.
        await prisma.consentRecord.createMany({
          data: [
            {
              barangayId: b.id,
              householdId: hh.id,
              purpose: "SERVICE_DELIVERY",
              grantedBy: "Household Head",
              grantedAt: R.daysAgo(R.randInt(30, 300)),
            },
            ...(R.chance(0.85)
              ? [{
                  barangayId: b.id,
                  householdId: hh.id,
                  purpose: "DISBURSEMENT" as const,
                  grantedBy: "Household Head",
                  grantedAt: R.daysAgo(R.randInt(10, 200)),
                }]
              : []),
            ...(R.chance(0.7)
              ? [{
                  barangayId: b.id,
                  householdId: hh.id,
                  purpose: "BIMS_SHARING" as const,
                  grantedBy: "Household Head",
                  grantedAt: R.daysAgo(R.randInt(10, 200)),
                }]
              : []),
          ],
        });
      }
    }
    inhabitantsByBrgy.set(b.id, list);
  }
  console.log(`     ${totalInh} inhabitants in ${hhCounter} households`);

  // ----------------------------------------------------------------
  // 4. Users (login as these)
  // ----------------------------------------------------------------
  console.log("  ⤷ users");
  const demoList = inhabitantsByBrgy.get(demoBrgy.id)!;

  async function mkUser(
    email: string,
    name: string,
    role: string,
    opts: { barangayId?: string; cityId?: string; inhabitantId?: string } = {},
  ) {
    const u = await prisma.user.create({
      data: {
        email,
        fullName: name,
        passwordHash: PASSWORD_HASH,
        mfaEnabled: (STAFF_ROLES as readonly string[]).includes(role),
        barangayId: opts.barangayId,
        cityId: opts.cityId,
        inhabitantId: opts.inhabitantId,
        lastLoginAt: R.daysAgo(R.randInt(0, 5)),
      },
    });
    await prisma.userRole.create({ data: { userId: u.id, roleId: roleId(role) } });
    return u;
  }

  await mkUser("admin@cbms.gov.ph", "Sofia R. Mendoza", "SYSTEM_ADMIN");
  await mkUser("lgu@marikina.gov.ph", "Ramon T. Villanueva", "LGU_ADMIN", { cityId: marikina.id });
  const pb = await mkUser("kapitan@barangka.gov.ph", "Eduardo M. Santos", "PUNONG_BARANGAY", { barangayId: demoBrgy.id });
  const sec = await mkUser("secretary@barangka.gov.ph", "Maria L. Reyes", "BARANGAY_SECRETARY", { barangayId: demoBrgy.id });
  const treas = await mkUser("treasurer@barangka.gov.ph", "Carmen D. Bautista", "BARANGAY_TREASURER", { barangayId: demoBrgy.id });
  await mkUser("lupon@barangka.gov.ph", "Alfredo P. Cruz", "LUPON_SECRETARY", { barangayId: demoBrgy.id });
  await mkUser("vawdesk@barangka.gov.ph", "Teresita G. Flores", "VAW_DESK_OFFICER", { barangayId: demoBrgy.id });
  await mkUser("bhw@barangka.gov.ph", "Nenita S. Ramos", "BHW", { barangayId: demoBrgy.id });
  await mkUser("tanod@barangka.gov.ph", "Danilo B. Aguilar", "TANOD", { barangayId: demoBrgy.id });
  await mkUser("dilg@dilg.gov.ph", "Atty. Jose P. Lim", "DILG_VIEWER");

  // Resident logins tied to real inhabitant records
  const residentInhabitants = demoList.filter((i) => i.age >= 18).slice(0, 3);
  const residentUsers = [];
  for (let i = 0; i < residentInhabitants.length; i++) {
    const inh = await prisma.inhabitant.findUnique({ where: { id: residentInhabitants[i]!.id } });
    residentUsers.push(
      await mkUser(
        `resident${i + 1}@example.ph`,
        `${inh!.firstName} ${inh!.lastName}`,
        "RESIDENT",
        { barangayId: demoBrgy.id, inhabitantId: inh!.id },
      ),
    );
  }

  // ----------------------------------------------------------------
  // 5. A13 — feature flags, tickets
  // ----------------------------------------------------------------
  await prisma.featureFlag.createMany({
    data: [
      { key: "wallet.enabled", enabled: true, notes: "B1 e-wallet" },
      { key: "ai.enabled", enabled: true, notes: "B2 agentic layer" },
      { key: "resident.selfservice", enabled: true, notes: "B3 suite" },
      { key: "bims.sync", enabled: true, notes: "companion-mode adapter (mock)" },
      { key: "sms.otp_only", enabled: true, notes: "SMS reserved for OTP + critical alerts" },
    ],
  });

  // ----------------------------------------------------------------
  // 6. A2 — certificate types
  // ----------------------------------------------------------------
  console.log("  ⤷ certificate types & requests");
  const certTypeByBrgy = new Map<string, { id: string; code: string; fee: number }[]>();
  for (const b of barangays) {
    if (b.status === "pending") continue;
    const created = [];
    for (const t of R.CERTIFICATE_TYPES) {
      const ct = await prisma.certificateType.create({
        data: {
          barangayId: b.id,
          code: t.code,
          name: t.name,
          fee: new Prisma.Decimal(t.fee),
          validityDays: t.validityDays,
          requirements: t.requirements,
          exemptNote: (t as any).exemptNote ?? null,
          description: (t as any).note ?? null,
          templateBody: `TO WHOM IT MAY CONCERN:\n\nThis is to certify that {{fullName}}, {{age}} years old, is a bona fide resident of {{barangay}}, Marikina City.\n\nThis certification is issued upon the request of the above-named person for {{purpose}}.\n\nIssued this {{date}}.`,
        },
      });
      created.push({ id: ct.id, code: t.code, fee: t.fee });
    }
    certTypeByBrgy.set(b.id, created);
  }

  // ----------------------------------------------------------------
  // 7. B1 — wallets (treasury + residents + merchants + agents)
  // ----------------------------------------------------------------
  console.log("  ⤷ wallets, merchants, agents");
  const treasuryWallet = await prisma.wallet.create({
    data: {
      barangayId: demoBrgy.id,
      ownerType: "treasury",
      emiAccountRef: `EMI-TRS-${demoBrgy.psgcCode}`,
      kycTier: "tier2",
      balanceCentavos: 250_000_00n, // ₱250,000 float
    },
  });

  const walletByInhabitant = new Map<string, string>();
  for (const b of barangays) {
    if (b.status === "pending") continue;
    const list = inhabitantsByBrgy.get(b.id) ?? [];
    const adults = list.filter((i) => i.age >= 18);
    // ~82% of adults registered — matches the proposal's saturation scorecard.
    const take = Math.floor(adults.length * 0.82);
    for (let i = 0; i < take; i++) {
      const inh = adults[i]!;
      const w = await prisma.wallet.create({
        data: {
          barangayId: b.id,
          ownerType: "resident",
          inhabitantId: inh.id,
          emiAccountRef: `EMI-R-${inh.id.slice(-10)}`,
          kycTier: R.chance(0.25) ? "tier2" : "tier1",
          balanceCentavos: BigInt(R.randInt(0, 350000)),
        },
      });
      walletByInhabitant.set(inh.id, w.id);
    }
  }

  // Merchants & agents in the demo barangay
  for (let i = 0; i < R.MERCHANT_NAMES.length; i++) {
    const w = await prisma.wallet.create({
      data: {
        barangayId: demoBrgy.id,
        ownerType: "merchant",
        emiAccountRef: `EMI-M-${pad(i, 6)}`,
        kycTier: "tier2",
        balanceCentavos: BigInt(R.randInt(50000, 800000)),
      },
    });
    await prisma.merchant.create({
      data: {
        barangayId: demoBrgy.id,
        walletId: w.id,
        businessName: R.MERCHANT_NAMES[i]!,
        ownerName: `${R.pick(R.FIRST_F)} ${R.pick(R.LAST)}`,
        category: R.pick(["sari_sari", "eatery", "market_stall", "transport", "services"]),
        addressLine: `${R.randInt(1, 200)} ${R.pick(R.STREETS)}`,
        qrCode: `QRPH-${demoBrgy.psgcCode}-${pad(i, 4)}`,
        mdrBps: 0, // 0% at launch to build acceptance
      },
    });
  }
  const agents = [];
  for (let i = 0; i < R.AGENT_NAMES.length; i++) {
    const w = await prisma.wallet.create({
      data: {
        barangayId: demoBrgy.id,
        ownerType: "agent",
        emiAccountRef: `EMI-A-${pad(i, 6)}`,
        kycTier: "tier2",
        balanceCentavos: BigInt(R.randInt(2000000, 9000000)),
      },
    });
    agents.push(
      await prisma.agent.create({
        data: {
          barangayId: demoBrgy.id,
          walletId: w.id,
          outletName: R.AGENT_NAMES[i]!,
          ownerName: `${R.pick(R.FIRST_M)} ${R.pick(R.LAST)}`,
          addressLine: `${R.randInt(1, 200)} ${R.pick(R.STREETS)}`,
          commissionBps: 50,
          cashOnHandCentavos: BigInt(R.randInt(1500000, 6000000)),
        },
      }),
    );
  }

  await prisma.biller.createMany({
    data: R.BILLERS.map((b) => ({
      code: b.code,
      name: b.name,
      category: b.category,
      commissionCentavos: BigInt(b.commission),
    })),
  });

  // ----------------------------------------------------------------
  // 8. A10 — budget & ledger opening
  // ----------------------------------------------------------------
  console.log("  ⤷ budget & ledger");
  const year = new Date().getFullYear();
  const budget = await prisma.budget.create({
    data: {
      barangayId: demoBrgy.id,
      year,
      totalAmount: new Prisma.Decimal(18_500_000),
      skFundAmount: new Prisma.Decimal(1_850_000),
      status: "enacted",
      lines: {
        create: [
          { expenseClass: "PS", accountCode: "5-01-01-010", description: "Honoraria — Barangay Officials", amount: new Prisma.Decimal(5_400_000) },
          { expenseClass: "PS", accountCode: "5-01-02-010", description: "Honoraria — BHW / Tanod / Day Care", amount: new Prisma.Decimal(2_100_000) },
          { expenseClass: "MOOE", accountCode: "5-02-03-010", description: "Office Supplies", amount: new Prisma.Decimal(600_000) },
          { expenseClass: "MOOE", accountCode: "5-02-13-060", description: "Repairs & Maintenance", amount: new Prisma.Decimal(900_000) },
          { expenseClass: "MOOE", accountCode: "5-02-99-990", description: "Social Services / Ayuda", amount: new Prisma.Decimal(3_200_000) },
          { expenseClass: "CO", accountCode: "1-07-04-990", description: "Infrastructure Projects", amount: new Prisma.Decimal(4_450_000) },
          { expenseClass: "MOOE", accountCode: "5-02-99-991", description: "GAD Programs", amount: new Prisma.Decimal(950_000) },
          { expenseClass: "MOOE", accountCode: "5-02-99-992", description: "BDRRM Fund (5%)", amount: new Prisma.Decimal(925_000) },
        ],
      },
    },
  });
  await prisma.ledgerEntry.create({
    data: {
      barangayId: demoBrgy.id,
      fund: "general",
      accountCode: "1-01-01-010",
      description: `Opening cash balance — treasury wallet funding, FY${year}`,
      direction: "debit",
      amount: new Prisma.Decimal(250_000),
      refType: "manual",
      postedAt: R.daysAgo(45),
    },
  });

  // ----------------------------------------------------------------
  // 9. A2/B1 — certificate requests, some paid via wallet
  // ----------------------------------------------------------------
  let orSeq = 1;
  let certSeq = 1;
  const feedbackSeeds: { certId: string; inhId: string }[] = [];

  for (const b of barangays) {
    if (b.status === "pending") continue;
    const types = certTypeByBrgy.get(b.id)!;
    const list = inhabitantsByBrgy.get(b.id) ?? [];
    const adults = list.filter((i) => i.age >= 18);
    const count = b.id === demoBrgy.id ? 45 : R.randInt(8, 16);

    for (let i = 0; i < count; i++) {
      const inh = R.pick(adults);
      const t = R.pick(types);
      const status = R.pickWeighted([
        ["released", 6], ["approved", 2], ["for_approval", 2],
        ["awaiting_payment", 2], ["submitted", 2], ["rejected", 1],
      ]) as string;
      const submittedAt = R.daysAgo(R.randInt(0, 90));
      const isDone = status === "released";
      const paid = ["paid", "for_approval", "approved", "released"].includes(status);
      const feeNum = t.fee;

      const cr = await prisma.certificateRequest.create({
        data: {
          barangayId: b.id,
          typeId: t.id,
          inhabitantId: inh.id,
          referenceNo: ref("CR", certSeq++),
          purpose: R.pick(R.CERT_PURPOSES),
          status: status as any,
          fee: new Prisma.Decimal(feeNum),
          paymentMethod: paid ? (feeNum === 0 ? "waived" : R.chance(0.65) ? "wallet" : "otc_cash") : null,
          paidAt: paid ? submittedAt : null,
          orNumber: paid && feeNum > 0 ? `OR-${pad(orSeq++, 6)}` : null,
          approvedById: ["approved", "released"].includes(status) ? pb.id : null,
          approvedAt: ["approved", "released"].includes(status)
            ? new Date(submittedAt.getTime() + 3600_000 * R.randInt(1, 30))
            : null,
          rejectedReason: status === "rejected" ? "Incomplete requirements — no valid ID presented." : null,
          issuedAt: isDone ? new Date(submittedAt.getTime() + 3600_000 * 24) : null,
          expiresAt: isDone ? R.daysAhead(t.fee === 0 ? 90 : 180) : null,
          verifyCode: isDone ? verifyCode() : null,
          submittedAt,
          releasedAt: isDone ? new Date(submittedAt.getTime() + 3600_000 * 26) : null,
          processingMs: isDone ? R.randInt(900_000, 90_000_000) : null,
          source: "CBMS",
        },
      });

      if (paid && feeNum > 0) {
        await prisma.officialReceipt.create({
          data: {
            barangayId: b.id,
            orNumber: cr.orNumber!,
            payorName: "Resident",
            amount: new Prisma.Decimal(feeNum),
            particulars: `${t.code} fee`,
            issuedAt: submittedAt,
            refType: "certificate_request",
            refId: cr.id,
          },
        });
        await prisma.ledgerEntry.create({
          data: {
            barangayId: b.id,
            fund: "general",
            accountCode: "4-02-01-040",
            description: `Clearance & certification fees — ${cr.referenceNo}`,
            direction: "credit",
            amount: new Prisma.Decimal(feeNum),
            orNumber: cr.orNumber,
            refType: "certificate_request",
            refId: cr.id,
            postedAt: submittedAt,
          },
        });

        // Wallet-paid ones get a real transaction (B1 → A10 tie-out)
        const wId = walletByInhabitant.get(inh.id);
        if (wId && cr.paymentMethod === "wallet" && b.id === demoBrgy.id) {
          await prisma.walletTransaction.create({
            data: {
              barangayId: b.id,
              type: "fee_collection",
              status: "completed",
              fromWalletId: wId,
              toWalletId: treasuryWallet.id,
              amountCentavos: BigInt(Math.round(feeNum * 100)),
              reference: `TXN-FEE-${cr.referenceNo}`,
              description: `${t.code} fee — ${cr.referenceNo}`,
              certificateRequestId: cr.id,
              emiTxnRef: `MOCK-${crypto.randomBytes(5).toString("hex")}`,
              completedAt: submittedAt,
              createdAt: submittedAt,
            },
          });
        }
      }

      if (isDone && R.chance(0.55)) feedbackSeeds.push({ certId: cr.id, inhId: inh.id });
    }
  }

  // ----------------------------------------------------------------
  // 10. B1 — disbursement batches (honoraria + ayuda)
  // ----------------------------------------------------------------
  console.log("  ⤷ disbursement batches");
  const demoAdults = demoList.filter((i) => i.age >= 18);

  // Honoraria batch — 60 officials/BHW/tanod
  const honorariaPayees = demoAdults.slice(0, 60);
  let honTotal = 0n;
  const honBatch = await prisma.disbursementBatch.create({
    data: {
      barangayId: demoBrgy.id,
      batchNo: `DB-${year}-0001`,
      kind: "payroll_honoraria",
      title: `Honoraria — Barangay Officials & Frontline Workers (${new Date().toLocaleString("en-PH", { month: "long" })})`,
      fund: "general",
      status: "completed",
      preparedById: treas.id,
      approvedById: pb.id, // maker–checker: preparer ≠ approver
      approvedAt: R.daysAgo(6),
      executedAt: R.daysAgo(5),
    },
  });
  for (const p of honorariaPayees) {
    const inh = await prisma.inhabitant.findUnique({ where: { id: p.id } });
    const amt = BigInt(R.randInt(3000, 12000) * 100);
    honTotal += amt;
    const wId = walletByInhabitant.get(p.id);
    const item = await prisma.disbursementBatchItem.create({
      data: {
        batchId: honBatch.id,
        inhabitantId: p.id,
        walletId: wId ?? null,
        payeeName: `${inh!.firstName} ${inh!.lastName}`,
        amountCentavos: amt,
        status: wId ? "paid" : "otc_fallback", // no wallet → over the counter
        paidAt: wId ? R.daysAgo(5) : null,
        remarks: wId ? null : "No wallet — released over the counter.",
      },
    });
    if (wId) {
      await prisma.walletTransaction.create({
        data: {
          barangayId: demoBrgy.id,
          type: "disbursement",
          status: "completed",
          fromWalletId: treasuryWallet.id,
          toWalletId: wId,
          amountCentavos: amt,
          reference: `TXN-DIS-${item.id.slice(-10)}`,
          description: `Honoraria — ${honBatch.batchNo}`,
          batchItemId: item.id,
          emiTxnRef: `MOCK-${crypto.randomBytes(5).toString("hex")}`,
          completedAt: R.daysAgo(5),
          createdAt: R.daysAgo(5),
        },
      });
    }
  }
  await prisma.disbursementBatch.update({
    where: { id: honBatch.id },
    data: { totalCentavos: honTotal, itemCount: honorariaPayees.length },
  });
  await prisma.ledgerEntry.create({
    data: {
      barangayId: demoBrgy.id,
      fund: "general",
      accountCode: "5-01-01-010",
      description: `Honoraria disbursement — ${honBatch.batchNo}`,
      direction: "debit",
      amount: new Prisma.Decimal((Number(honTotal) / 100).toFixed(2)),
      dvNumber: `DV-${year}-0001`,
      refType: "disbursement_batch",
      refId: honBatch.id,
      postedAt: R.daysAgo(5),
    },
  });

  // ----------------------------------------------------------------
  // 11. A5 — disaster event + ayuda batch (200 households)
  // ----------------------------------------------------------------
  console.log("  ⤷ disaster event, evacuation & relief");
  for (const b of barangays.slice(0, 6)) {
    if (b.status === "pending") continue;
    for (const purok of R.PUROKS.slice(0, 4)) {
      await prisma.hazard.create({
        data: {
          barangayId: b.id,
          purok,
          hazardType: R.pick(R.HAZARD_TYPES),
          riskLevel: R.pickWeighted([["high", 2], ["medium", 3], ["low", 3]]) as string,
          notes: "Derived from the city hazard map.",
        },
      });
    }
  }

  // Properties first (evacuation centers link to them)
  console.log("  ⤷ properties & materials");
  const evacCenters = [];
  for (const b of barangays) {
    if (b.status === "pending") continue;
    const set = b.id === demoBrgy.id ? R.PROPERTY_SEED : R.PROPERTY_SEED.slice(0, 8);
    for (const p of set) {
      const prop = await prisma.property.create({
        data: {
          barangayId: b.id,
          name: p.name,
          type: p.type as any,
          status: p.status as any,
          category: R.pick(R.PROPERTY_CATEGORIES),
          capacity: p.capacity,
          acquiredAt: R.daysAgo(R.randInt(200, 3000)),
          acquisitionCost: new Prisma.Decimal(R.randInt(25, 4000) * 1000),
          custodian: `${R.pick(R.FIRST_M)} ${R.pick(R.LAST)}`,
          latitude: 14.63 + R.rng() * 0.05,
          longitude: 121.09 + R.rng() * 0.05,
          addressLine: `${R.pick(R.STREETS)}, ${b.name}`,
          isEvacuationCenter: p.name.includes("EVACUATION") || p.name.includes("COVERED COURT"),
          source: b.mode === "companion" && R.chance(0.5) ? "BIMS" : "CBMS",
        },
      });
      if (prop.isEvacuationCenter) {
        const ec = await prisma.evacuationCenter.create({
          data: {
            barangayId: b.id,
            propertyId: prop.id,
            name: prop.name,
            capacity: prop.capacity || 250,
            addressLine: prop.addressLine,
            latitude: prop.latitude,
            longitude: prop.longitude,
          },
        });
        if (b.id === demoBrgy.id) evacCenters.push(ec);
      }
      if (R.chance(0.4)) {
        await prisma.maintenanceRecord.create({
          data: {
            propertyId: prop.id,
            performedAt: R.daysAgo(R.randInt(10, 500)),
            kind: R.pick(["repair", "inspection", "upgrade"]),
            cost: new Prisma.Decimal(R.randInt(2, 90) * 1000),
            remarks: "Routine maintenance.",
          },
        });
      }
    }
    await prisma.material.createMany({
      data: R.MATERIALS_SEED.map((m) => ({
        barangayId: b.id,
        name: m.name,
        unit: m.unit,
        quantity: m.quantity + R.randInt(-20, 60),
        reorderLevel: m.reorderLevel,
        location: "Barangay Stockroom",
      })),
    });
  }
  // Ensure the demo barangay has 3 evacuation centers
  while (evacCenters.length < 3) {
    const ec = await prisma.evacuationCenter.create({
      data: {
        barangayId: demoBrgy.id,
        name: `TEMPORARY EVACUATION SITE ${evacCenters.length + 1}`,
        capacity: 200,
        addressLine: `${R.pick(R.STREETS)}, ${demoBrgy.name}`,
        latitude: 14.63 + R.rng() * 0.05,
        longitude: 121.09 + R.rng() * 0.05,
      },
    });
    evacCenters.push(ec);
  }

  const typhoon = await prisma.disasterEvent.create({
    data: {
      barangayId: demoBrgy.id,
      name: "Bagyong Rosita — Flooding along the Marikina River",
      hazardType: "flood",
      status: "recovery",
      declaredAt: R.daysAgo(12),
      summary:
        "Marikina River breached the second alarm. Pre-emptive evacuation of riverside puroks; relief distributed to affected households.",
    },
  });
  const demoHouseholds = await prisma.household.findMany({
    where: { barangayId: demoBrgy.id },
    take: 200,
  });
  for (let i = 0; i < demoHouseholds.length; i++) {
    const hh = demoHouseholds[i]!;
    if (i < 90) {
      await prisma.evacuationRecord.create({
        data: {
          eventId: typhoon.id,
          centerId: evacCenters[i % evacCenters.length]!.id,
          householdId: hh.id,
          headcount: R.randInt(2, 6),
          checkInAt: R.daysAgo(12),
          checkOutAt: R.chance(0.8) ? R.daysAgo(9) : null,
        },
      });
    }
    await prisma.reliefDistribution.create({
      data: {
        eventId: typhoon.id,
        householdId: hh.id,
        goods: "Family Food Pack",
        quantity: 1,
        cashAmount: new Prisma.Decimal(1000),
        releasedAt: R.daysAgo(R.randInt(7, 11)),
        releasedBy: "BDRRMC Team",
        receivedBy: "Household Head",
      },
    });
  }

  // Ayuda batch — 200 households @ ₱1,000, consent-checked
  let ayudaTotal = 0n;
  const ayudaBatch = await prisma.disbursementBatch.create({
    data: {
      barangayId: demoBrgy.id,
      batchNo: `DB-${year}-0002`,
      kind: "ayuda_social",
      title: "Calamity Ayuda — Bagyong Rosita affected households",
      fund: "disaster",
      status: "completed",
      preparedById: treas.id,
      approvedById: pb.id,
      approvedAt: R.daysAgo(8),
      executedAt: R.daysAgo(7),
      sourceNote:
        "Beneficiary list snapshotted from the relief distribution log; households with DISBURSEMENT consent on file.",
      disasterEventId: typhoon.id,
    },
  });
  for (const hh of demoHouseholds) {
    const head = await prisma.inhabitant.findFirst({
      where: { householdId: hh.id, relationToHead: "Head" },
    });
    if (!head) continue;
    const amt = 1000_00n;
    ayudaTotal += amt;
    const wId = walletByInhabitant.get(head.id);
    const item = await prisma.disbursementBatchItem.create({
      data: {
        batchId: ayudaBatch.id,
        inhabitantId: head.id,
        walletId: wId ?? null,
        payeeName: `${head.firstName} ${head.lastName}`,
        amountCentavos: amt,
        status: wId ? "paid" : "otc_fallback",
        paidAt: wId ? R.daysAgo(7) : null,
        remarks: wId ? null : "No wallet — cash released at the barangay hall.",
      },
    });
    if (wId) {
      await prisma.walletTransaction.create({
        data: {
          barangayId: demoBrgy.id,
          type: "disbursement",
          status: "completed",
          fromWalletId: treasuryWallet.id,
          toWalletId: wId,
          amountCentavos: amt,
          feeCentavos: 0n, // never charged to ayuda
          reference: `TXN-AYU-${item.id.slice(-10)}`,
          description: `Calamity ayuda — ${ayudaBatch.batchNo}`,
          batchItemId: item.id,
          emiTxnRef: `MOCK-${crypto.randomBytes(5).toString("hex")}`,
          completedAt: R.daysAgo(7),
          createdAt: R.daysAgo(7),
        },
      });
    }
  }
  await prisma.disbursementBatch.update({
    where: { id: ayudaBatch.id },
    data: { totalCentavos: ayudaTotal, itemCount: demoHouseholds.length },
  });
  await prisma.ledgerEntry.create({
    data: {
      barangayId: demoBrgy.id,
      fund: "disaster",
      accountCode: "5-02-99-990",
      description: `Calamity ayuda disbursement — ${ayudaBatch.batchNo}`,
      direction: "debit",
      amount: new Prisma.Decimal((Number(ayudaTotal) / 100).toFixed(2)),
      dvNumber: `DV-${year}-0002`,
      refType: "disbursement_batch",
      refId: ayudaBatch.id,
      postedAt: R.daysAgo(7),
    },
  });

  // A pending batch awaiting PB approval (shows maker–checker in the UI)
  await prisma.disbursementBatch.create({
    data: {
      barangayId: demoBrgy.id,
      batchNo: `DB-${year}-0003`,
      kind: "allowance_stipend",
      title: "SK Youth Allowance — Q2",
      fund: "sk",
      status: "for_approval",
      preparedById: treas.id,
      totalCentavos: 45_000_00n,
      itemCount: 30,
    },
  });

  // ----------------------------------------------------------------
  // 12. B1 — merchant sales, cash-outs, bill payments
  // ----------------------------------------------------------------
  const merchants = await prisma.merchant.findMany({ where: { barangayId: demoBrgy.id } });
  const residentWallets = await prisma.wallet.findMany({
    where: { barangayId: demoBrgy.id, ownerType: "resident" },
    take: 120,
  });
  const billers = await prisma.biller.findMany();

  for (let i = 0; i < 160; i++) {
    const w = R.pick(residentWallets);
    const m = R.pick(merchants);
    const amt = BigInt(R.randInt(2000, 45000));
    await prisma.walletTransaction.create({
      data: {
        barangayId: demoBrgy.id,
        type: "merchant_payment",
        status: "completed",
        fromWalletId: w.id,
        toWalletId: m.walletId,
        amountCentavos: amt,
        reference: `TXN-QR-${pad(i, 6)}-${crypto.randomBytes(3).toString("hex")}`,
        description: `QR Ph payment — ${m.businessName}`,
        merchantId: m.id,
        completedAt: R.daysAgo(R.randInt(0, 25)),
        createdAt: R.daysAgo(R.randInt(0, 25)),
      },
    });
  }
  for (let i = 0; i < 70; i++) {
    const w = R.pick(residentWallets);
    const a = R.pick(agents);
    const amt = BigInt(R.randInt(20000, 300000));
    await prisma.walletTransaction.create({
      data: {
        barangayId: demoBrgy.id,
        type: R.chance(0.7) ? "cash_out" : "cash_in",
        status: "completed",
        fromWalletId: w.id,
        toWalletId: a.walletId,
        amountCentavos: amt,
        feeCentavos: 0n, // government disbursement cash-out is free
        reference: `TXN-CICO-${pad(i, 6)}`,
        description: `Cash-out at ${a.outletName}`,
        agentId: a.id,
        completedAt: R.daysAgo(R.randInt(0, 20)),
        createdAt: R.daysAgo(R.randInt(0, 20)),
      },
    });
    await prisma.agentFloatLog.create({
      data: {
        agentId: a.id,
        kind: "cash_out",
        amountCentavos: amt,
        balanceAfterCentavos: a.cashOnHandCentavos - amt,
        note: "Resident cash-out",
      },
    });
  }
  for (let i = 0; i < 55; i++) {
    const w = R.pick(residentWallets);
    const bl = R.pick(billers);
    await prisma.billPayment.create({
      data: {
        barangayId: demoBrgy.id,
        billerId: bl.id,
        walletId: w.id,
        accountNo: `${R.randInt(100000000, 999999999)}`,
        amountCentavos: BigInt(R.randInt(30000, 250000)),
        convenienceFeeCentavos: 500n,
        status: "completed",
        paidAt: R.daysAgo(R.randInt(0, 28)),
      },
    });
  }

  // ----------------------------------------------------------------
  // 13. A3 — blotter & KP cases (incl. one full lifecycle)
  // ----------------------------------------------------------------
  console.log("  ⤷ blotter & Katarungang Pambarangay");
  let blotterSeq = 1;
  let kpSeq = 1;
  for (const b of barangays.slice(0, 8)) {
    if (b.status === "pending") continue;
    const list = inhabitantsByBrgy.get(b.id) ?? [];
    const adults = list.filter((i) => i.age >= 18);
    const n = b.id === demoBrgy.id ? 14 : R.randInt(3, 6);

    for (let i = 0; i < n; i++) {
      const isVawc = R.chance(0.12);
      const cat = isVawc ? "vawc" : R.pick(["dispute", "theft", "physical_injury", "noise", "vandalism", "other"]);
      const blotter = await prisma.blotterEntry.create({
        data: {
          barangayId: b.id,
          entryNo: `BL-${year}-${pad(blotterSeq++, 4)}`,
          category: cat as any,
          incidentAt: R.daysAgo(R.randInt(1, 120)),
          location: `${R.pick(R.STREETS)}, ${R.pick(R.PUROKS)}`,
          narrative: isVawc
            ? "[RESTRICTED] Confidential VAWC report — details available to the VAW Desk Officer and Punong Barangay only."
            : "Nagkaroon ng alitan ang magkapitbahay tungkol sa hangganan ng bakod. Humingi ng tulong sa barangay para sa mediation.",
          reportedBy: `${R.pick(R.FIRST_F)} ${R.pick(R.LAST)}`,
          respondentName: `${R.pick(R.FIRST_M)} ${R.pick(R.LAST)}`,
          isConfidential: isVawc,
        },
      });

      // Non-VAWC disputes escalate to KP cases
      if (!isVawc && R.chance(0.7)) {
        const filedAt = blotter.incidentAt;
        const stage = R.pickWeighted([
          ["settled", 4], ["mediation", 3], ["conciliation", 2], ["cfa_issued", 1], ["filed", 2],
        ]) as string;
        const kp = await prisma.kpCase.create({
          data: {
            barangayId: b.id,
            caseNo: `KP-${year}-${pad(kpSeq++, 4)}`,
            blotterId: blotter.id,
            subject: "Boundary dispute between neighbors",
            description: "Complainant alleges the respondent's fence encroaches on their lot boundary.",
            stage: stage as any,
            filedAt,
            // RA 7160 §410 statutory timelines
            mediationDueAt: new Date(filedAt.getTime() + 15 * 86400_000),
            conciliationDueAt: new Date(filedAt.getTime() + 30 * 86400_000),
            extendedDueAt: new Date(filedAt.getTime() + 45 * 86400_000),
            closedAt: ["settled", "cfa_issued"].includes(stage)
              ? new Date(filedAt.getTime() + 20 * 86400_000)
              : null,
            settlementTerms:
              stage === "settled"
                ? "Both parties agreed to a joint re-survey; respondent to move the fence within 30 days."
                : null,
            cfaReason: stage === "cfa_issued" ? "Respondent failed to appear at three scheduled hearings." : null,
            pangkatMembers:
              stage === "conciliation" || stage === "settled"
                ? [`${R.pick(R.FIRST_M)} ${R.pick(R.LAST)}`, `${R.pick(R.FIRST_F)} ${R.pick(R.LAST)}`, `${R.pick(R.FIRST_M)} ${R.pick(R.LAST)}`]
                : [],
          },
        });
        const c = R.pick(adults);
        const rsp = R.pick(adults);
        await prisma.kpParty.createMany({
          data: [
            { caseId: kp.id, role: "complainant", inhabitantId: c.id },
            { caseId: kp.id, role: "respondent", inhabitantId: rsp.id },
          ],
        });
        await prisma.kpHearing.create({
          data: {
            caseId: kp.id,
            scheduledAt: new Date(filedAt.getTime() + 7 * 86400_000),
            stage: "mediation",
            attended: stage !== "cfa_issued",
            minutes: "Mediation conducted by the Punong Barangay.",
            outcome: stage === "settled" ? "Amicable settlement reached." : "Referred to the Pangkat.",
          },
        });
        for (const kind of stage === "settled"
          ? ["summons", "notice_of_hearing", "amicable_settlement"]
          : stage === "cfa_issued"
            ? ["summons", "notice_of_hearing", "cfa"]
            : ["summons"]) {
          await prisma.kpDocument.create({ data: { caseId: kp.id, kind, issuedAt: filedAt } });
        }
      }
    }
  }

  // ----------------------------------------------------------------
  // 14. A6–A9 — governance modules
  // ----------------------------------------------------------------
  console.log("  ⤷ governance (GAD, ordinances, dev plan, institutions)");
  for (const b of barangays.slice(0, 8)) {
    if (b.status === "pending") continue;

    const gad = await prisma.gadPlan.create({
      data: {
        barangayId: b.id,
        year,
        totalBudget: new Prisma.Decimal(18_500_000),
        gadBudget: new Prisma.Decimal(950_000), // 5.1% — passes the ≥5% check
        status: "approved",
      },
    });
    await prisma.gadActivity.createMany({
      data: [
        { planId: gad.id, title: "Livelihood training for women", attribution: "client-focused", genderIssue: "Limited economic opportunities for women", budget: new Prisma.Decimal(350_000), actualSpend: new Prisma.Decimal(310_000), targetOutput: "60 women trained", actualOutput: "54 women trained", quarter: 1, status: "completed" },
        { planId: gad.id, title: "VAWC awareness campaign", attribution: "client-focused", genderIssue: "Under-reporting of VAWC cases", budget: new Prisma.Decimal(200_000), actualSpend: new Prisma.Decimal(185_000), targetOutput: "6 purok sessions", actualOutput: "6 sessions held", quarter: 2, status: "completed" },
        { planId: gad.id, title: "Gender sensitivity training for officials", attribution: "organization-focused", genderIssue: "Low GAD capacity among staff", budget: new Prisma.Decimal(150_000), targetOutput: "All officials trained", quarter: 3, status: "ongoing" },
        { planId: gad.id, title: "Day care support for solo parents", attribution: "client-focused", genderIssue: "Childcare burden on solo parents", budget: new Prisma.Decimal(250_000), targetOutput: "40 slots", quarter: 4, status: "planned" },
      ],
    });

    await prisma.legislation.createMany({
      data: [
        {
          barangayId: b.id, kind: "ordinance", number: "01", series: year,
          title: `An Ordinance Adopting the Use of the DILG LGUSS-BIMS and the Barangay Digital Services Platform in ${b.name}`,
          body: "WHEREAS, DILG Memorandum Circular No. 2025-104 directs all barangays to utilize the LGUSS-BIMS as the repository of vital barangay data;\n\nWHEREAS, the Sangguniang Barangay recognizes the need to complement the said system with digital services for residents;\n\nNOW THEREFORE, BE IT ORDAINED...",
          status: "enacted", sponsors: ["Hon. Eduardo M. Santos"], enactedAt: R.daysAgo(120), isPublished: true,
        },
        {
          barangayId: b.id, kind: "ordinance", number: "02", series: year,
          title: "An Ordinance Regulating Noise Levels During Nighttime Hours",
          status: "enacted", sponsors: ["Hon. Carmen D. Bautista"], enactedAt: R.daysAgo(80), isPublished: true,
        },
        {
          barangayId: b.id, kind: "resolution", number: "14", series: year,
          title: `A Resolution Approving the Annual Budget of Barangay ${b.name} for FY ${year}`,
          status: "enacted", sponsors: ["Hon. Alfredo P. Cruz"], enactedAt: R.daysAgo(200), isPublished: true,
        },
        {
          barangayId: b.id, kind: "resolution", number: "15", series: year,
          title: "A Resolution Adopting the Barangay Disaster Risk Reduction and Management Plan",
          status: "enacted", sponsors: ["Hon. Maria L. Reyes"], enactedAt: R.daysAgo(60), isPublished: true,
        },
        {
          barangayId: b.id, kind: "executive_order", number: "03", series: year,
          title: "Creating the Barangay Anti-Drug Abuse Council (BADAC)",
          status: "enacted", enactedAt: R.daysAgo(150), isPublished: true,
        },
        {
          barangayId: b.id, kind: "ordinance", number: "03", series: year,
          title: "An Ordinance Establishing a Segregated Waste Collection Schedule",
          status: "draft", sponsors: ["Hon. Carmen D. Bautista"],
        },
      ],
    });

    const plan = await prisma.developmentPlan.create({
      data: {
        barangayId: b.id,
        title: `Barangay ${b.name} Development Plan ${year}–${year + 2}`,
        vision: `A resilient, digitally-enabled, and inclusive ${b.name} where every resident is served with dignity and speed.`,
        startYear: year,
        endYear: year + 2,
      },
    });
    await prisma.devProject.createMany({
      data: [
        { planId: plan.id, title: "Drainage improvement — Purok 1 to 3", sector: "infrastructure", budget: new Prisma.Decimal(2_400_000), fundingSource: "NTA", status: "ongoing", targetYear: year, progressPct: 65 },
        { planId: plan.id, title: "Barangay health center equipment upgrade", sector: "health", budget: new Prisma.Decimal(850_000), fundingSource: "LGU", status: "approved", targetYear: year, progressPct: 10 },
        { planId: plan.id, title: "Solar streetlights along the riverside", sector: "infrastructure", budget: new Prisma.Decimal(1_200_000), fundingSource: "grant", status: "proposed", targetYear: year + 1, progressPct: 0 },
        { planId: plan.id, title: "Livelihood & skills training center", sector: "livelihood", budget: new Prisma.Decimal(1_800_000), fundingSource: "NTA", status: "proposed", targetYear: year + 1, progressPct: 0 },
        { planId: plan.id, title: "Day care center rehabilitation", sector: "education", budget: new Prisma.Decimal(950_000), fundingSource: "LGU", status: "completed", targetYear: year - 1, progressPct: 100 },
        { planId: plan.id, title: "Materials recovery facility expansion", sector: "environment", budget: new Prisma.Decimal(1_100_000), fundingSource: "national", status: "ongoing", targetYear: year, progressPct: 40 },
        { planId: plan.id, title: "CCTV installation — peace & order", sector: "peace_order", budget: new Prisma.Decimal(1_500_000), fundingSource: "LGU", status: "proposed", targetYear: year + 1, progressPct: 0 },
        { planId: plan.id, title: "Evacuation center retrofitting", sector: "infrastructure", budget: new Prisma.Decimal(3_200_000), fundingSource: "national", status: "deferred", targetYear: year + 2, progressPct: 0 },
      ],
    });

    const bLists = inhabitantsByBrgy.get(b.id) ?? [];
    const bAdults = bLists.filter((i) => i.age >= 18);
    for (const inst of R.INSTITUTIONS) {
      const created = await prisma.institution.create({
        data: {
          barangayId: b.id,
          code: inst.code,
          name: inst.name,
          accreditedAt: R.daysAgo(R.randInt(100, 900)),
        },
      });
      const memberCount = inst.code === "LUPON" ? 12 : R.randInt(5, 9);
      for (let i = 0; i < Math.min(memberCount, bAdults.length); i++) {
        await prisma.institutionMember.create({
          data: {
            institutionId: created.id,
            inhabitantId: bAdults[i]!.id,
            position: i === 0 ? "Chairperson" : i === 1 ? "Vice Chairperson" : "Member",
            termStart: R.daysAgo(400),
            termEnd: R.daysAhead(700),
          },
        });
      }
      await prisma.institutionMinutes.create({
        data: {
          institutionId: created.id,
          meetingAt: R.daysAgo(R.randInt(10, 90)),
          agenda: "Quarterly review of programs and budget utilization.",
          minutes: "The committee reviewed accomplishments and agreed on next quarter's targets.",
        },
      });
    }
  }

  // ----------------------------------------------------------------
  // 15. A11 — website content
  // ----------------------------------------------------------------
  console.log("  ⤷ website content");
  for (const b of barangays.slice(0, 8)) {
    if (b.status === "pending") continue;
    await prisma.sitePage.createMany({
      data: [
        { barangayId: b.id, slug: "about", title: `About Barangay ${b.name}`, body: `Barangay ${b.name} is one of the 16 barangays of Marikina City. This site publishes our ordinances, budget, projects, and service requirements in the open.`, sortOrder: 1 },
        { barangayId: b.id, slug: "services", title: "Services & Requirements", body: "Complete list of certificates, their fees, and requirements. Requests may be filed online through the resident app.", sortOrder: 2 },
        { barangayId: b.id, slug: "transparency", title: "Transparency Board", body: "Our annual budget, ongoing projects, and fee schedule — published under the DILG Full Disclosure Policy.", sortOrder: 3 },
        { barangayId: b.id, slug: "contact", title: "Contact & Hotlines", body: `Barangay Hall: ${b.contactPhone ?? "(02) 8646-0000"}\nEmergency hotline: 16-1111\nEmail: ${b.contactEmail ?? "barangay@marikina.gov.ph"}`, sortOrder: 4 },
      ],
    });
    await prisma.sitePost.createMany({
      data: [
        { barangayId: b.id, slug: "ayuda-distribution", title: "Calamity ayuda distribution completed", excerpt: "200 affected households received ₱1,000 each following Bagyong Rosita.", body: "Following the flooding brought by Bagyong Rosita, the barangay completed the distribution of calamity assistance to 200 affected households. Funds were released through the barangay e-wallet, with over-the-counter release available for households without a wallet.", isPublished: true, publishedAt: R.daysAgo(6) },
        { barangayId: b.id, slug: "online-clearance", title: "Barangay clearance now available online", excerpt: "Request, pay, and book your pickup from your phone.", body: "Residents may now request a barangay clearance through the resident app, pay the fee via e-wallet or over the counter, and book a pickup slot — cutting the usual wait from days to minutes.", isPublished: true, publishedAt: R.daysAgo(20) },
        { barangayId: b.id, slug: "assembly-notice", title: "Notice: Barangay Assembly this quarter", excerpt: "Agenda and minutes are published online.", body: "All residents are invited to the quarterly Barangay Assembly. The agenda, along with the minutes of the previous assembly, is published on this site.", isPublished: true, publishedAt: R.daysAgo(35) },
      ],
    });
  }

  // ----------------------------------------------------------------
  // 16. B3 — resident self-service data
  // ----------------------------------------------------------------
  console.log("  ⤷ resident self-service (311, SOS, CSM, health, jobs, PB)");
  let concernSeq = 1;
  for (const b of barangays.slice(0, 8)) {
    if (b.status === "pending") continue;
    const list = inhabitantsByBrgy.get(b.id) ?? [];
    const adults = list.filter((i) => i.age >= 18);
    const n = b.id === demoBrgy.id ? 32 : R.randInt(5, 10);
    for (let i = 0; i < n; i++) {
      const cat = R.pick(R.CONCERN_CATEGORIES);
      const tmpl = R.pick(R.CONCERN_TEMPLATES[cat] ?? R.CONCERN_TEMPLATES.other!);
      const created = R.daysAgo(R.randInt(0, 60));
      const status = R.pickWeighted([
        ["resolved", 5], ["in_progress", 3], ["acknowledged", 2], ["submitted", 3], ["rejected", 1],
      ]) as string;
      await prisma.concern.create({
        data: {
          barangayId: b.id,
          inhabitantId: R.pick(adults).id,
          referenceNo: ref("CN", concernSeq++),
          category: cat,
          description: tmpl.replace("{street}", R.pick(R.STREETS)),
          latitude: 14.63 + R.rng() * 0.05,
          longitude: 121.09 + R.rng() * 0.05,
          purok: R.pick(R.PUROKS),
          status: status as any,
          slaDueAt: new Date(created.getTime() + 3 * 86400_000), // RA 11032 SLA
          acknowledgedAt: status !== "submitted" ? new Date(created.getTime() + 3600_000 * 5) : null,
          resolvedAt: status === "resolved" ? new Date(created.getTime() + 86400_000 * R.randInt(1, 6)) : null,
          resolutionNote: status === "resolved" ? "Naayos na ng maintenance team." : null,
          createdAt: created,
        },
      });
    }

    // SOS
    for (let i = 0; i < (b.id === demoBrgy.id ? 6 : 2); i++) {
      const st = R.pickWeighted([["resolved", 5], ["dispatched", 1], ["active", 1], ["false_alarm", 1]]) as string;
      await prisma.sosAlert.create({
        data: {
          barangayId: b.id,
          inhabitantId: R.pick(adults).id,
          kind: R.pick(["medical", "fire", "crime", "flood"]),
          latitude: 14.63 + R.rng() * 0.05,
          longitude: 121.09 + R.rng() * 0.05,
          note: "Kailangan ng tulong.",
          status: st as any,
          acknowledgedAt: st !== "active" ? R.daysAgo(R.randInt(1, 30)) : null,
          resolvedAt: st === "resolved" ? R.daysAgo(R.randInt(1, 29)) : null,
          responseNote: st === "resolved" ? "Tanod team responded; resident brought to the health center." : null,
          createdAt: R.daysAgo(R.randInt(0, 30)),
        },
      });
    }

    await prisma.announcement.createMany({
      data: [
        { barangayId: b.id, title: "Water interruption — Purok 1 to 3", body: "Maynilad will conduct pipe repairs. Water service will be interrupted from 10PM to 5AM.", category: "utility", severity: "warning", channels: ["in_app", "email"], isPublished: true, publishedAt: R.daysAgo(3) },
        { barangayId: b.id, title: "Bagyong Rosita — Second alarm raised", body: "Residents in riverside puroks are advised to pre-emptively evacuate to designated centers.", category: "emergency", severity: "critical", channels: ["in_app", "email", "sms"], isPublished: true, publishedAt: R.daysAgo(12) },
        { barangayId: b.id, title: "Free medical check-up this Saturday", body: "The barangay health center will hold a free check-up and immunization drive.", category: "event", severity: "info", channels: ["in_app"], isPublished: true, publishedAt: R.daysAgo(8) },
        { barangayId: b.id, title: "Garbage collection schedule change", body: "Collection moves to Tuesdays and Fridays starting next week.", category: "general", severity: "info", channels: ["in_app"], isPublished: true, publishedAt: R.daysAgo(15) },
      ],
    });

    // Appointments & queue
    for (let i = 0; i < (b.id === demoBrgy.id ? 18 : 5); i++) {
      const st = R.pickWeighted([["completed", 5], ["booked", 3], ["checked_in", 1], ["no_show", 1]]) as string;
      await prisma.appointment.create({
        data: {
          barangayId: b.id,
          inhabitantId: R.pick(adults).id,
          service: R.pick(["certificate", "kp_hearing", "health", "general"]),
          scheduledAt: st === "booked" ? R.daysAhead(R.randInt(1, 10)) : R.daysAgo(R.randInt(1, 20)),
          queueNumber: `A-${pad(i + 1, 3)}`,
          status: st as any,
        },
      });
    }

    // Health campaigns
    const camp = await prisma.healthCampaign.create({
      data: {
        barangayId: b.id,
        name: "Senior Citizens Quarterly Check-up",
        kind: "senior_checkup",
        cohortFilter: { isSenior: true },
        startsAt: R.daysAgo(30),
        endsAt: R.daysAhead(60),
      },
    });
    const seniors = list.filter((i) => i.isSenior).slice(0, 25);
    for (const s of seniors) {
      await prisma.healthRecord.create({
        data: {
          campaignId: camp.id,
          inhabitantId: s.id,
          kind: "senior_checkup",
          notes: "BP monitored; maintenance medicines dispensed.",
          recordedAt: R.daysAgo(R.randInt(1, 28)),
          followUpAt: R.daysAhead(R.randInt(30, 90)),
        },
      });
    }
    await prisma.healthCampaign.create({
      data: {
        barangayId: b.id,
        name: "Child Immunization Drive",
        kind: "immunization",
        cohortFilter: { maxAge: 5 },
        startsAt: R.daysAgo(10),
        endsAt: R.daysAhead(30),
      },
    });

    // Jobs & livelihood
    for (const j of R.JOB_POSTS) {
      await prisma.jobPost.create({
        data: {
          barangayId: b.id,
          title: j.title,
          employer: j.employer,
          kind: j.kind,
          description: `${j.title} — apply through the barangay livelihood desk.`,
          location: `${b.name}, Marikina City`,
          salaryRange: j.salaryRange,
          contact: "livelihood@marikina.gov.ph",
          closesAt: R.daysAhead(R.randInt(10, 60)),
        },
      });
    }
    const jobs = await prisma.jobPost.findMany({ where: { barangayId: b.id }, take: 3 });
    for (const job of jobs) {
      for (let i = 0; i < R.randInt(2, 6); i++) {
        await prisma.jobApplication.upsert({
          where: { jobPostId_inhabitantId: { jobPostId: job.id, inhabitantId: adults[i]!.id } },
          create: { jobPostId: job.id, inhabitantId: adults[i]!.id, status: R.pick(["submitted", "endorsed", "hired"]) },
          update: {},
        });
      }
    }

    // Benefit applications
    for (let i = 0; i < R.randInt(4, 10); i++) {
      await prisma.benefitApplication.create({
        data: {
          barangayId: b.id,
          inhabitantId: R.pick(adults).id,
          program: R.pick(["4ps", "solo_parent", "senior", "pwd", "scholarship"]),
          status: R.pickWeighted([["submitted", 3], ["endorsed", 2], ["approved", 3], ["rejected", 1]]) as string,
        },
      });
    }

    // Participatory budgeting
    const projects = await prisma.devProject.findMany({
      where: { plan: { barangayId: b.id }, status: "proposed" },
      take: 4,
    });
    if (projects.length) {
      const cycle = await prisma.pbCycle.create({
        data: {
          barangayId: b.id,
          title: `Participatory Budgeting ${year + 1} — Choose our next project`,
          year: year + 1,
          opensAt: R.daysAgo(10),
          closesAt: R.daysAhead(20),
          status: "open",
        },
      });
      const options = [];
      for (const p of projects) {
        options.push(
          await prisma.pbOption.create({
            data: { cycleId: cycle.id, projectId: p.id, label: p.title, detail: p.sector },
          }),
        );
      }
      const voters = adults.slice(0, Math.min(adults.length, b.id === demoBrgy.id ? 80 : 20));
      for (const v of voters) {
        const opt = R.pick(options);
        await prisma.pbVote.upsert({
          where: { cycleId_inhabitantId: { cycleId: cycle.id, inhabitantId: v.id } },
          create: { cycleId: cycle.id, optionId: opt.id, inhabitantId: v.id },
          update: {},
        });
      }
      for (const o of options) {
        const c = await prisma.pbVote.count({ where: { optionId: o.id } });
        await prisma.pbOption.update({ where: { id: o.id }, data: { voteCount: c } });
      }
    }

    await prisma.assembly.create({
      data: {
        barangayId: b.id,
        title: `Barangay Assembly — ${new Date().toLocaleString("en-PH", { month: "long" })} ${year}`,
        scheduledAt: R.daysAhead(14),
        agenda: "1. Budget utilization report\n2. Disaster preparedness update\n3. Participatory budgeting results\n4. Open forum",
        isPublished: true,
      },
    });
  }

  // Feedback / CSM (RA 11032)
  for (const f of feedbackSeeds) {
    const cr = await prisma.certificateRequest.findUnique({ where: { id: f.certId } });
    if (!cr) continue;
    const rating = R.pickWeighted([[5, 6], [4, 3], [3, 1], [2, 1], [1, 1]]) as number;
    await prisma.feedback.create({
      data: {
        barangayId: cr.barangayId,
        inhabitantId: f.inhId,
        rating,
        comment: rating >= 4 ? "Mabilis at maayos ang serbisyo. Salamat!" : rating === 3 ? "Okay naman pero medyo matagal ang pila." : "Matagal ang proseso at hindi malinaw ang requirements.",
        service: "certificate",
        certificateRequestId: cr.id,
        isGrievance: rating <= 2,
        createdAt: cr.releasedAt ?? cr.submittedAt,
      },
    });
  }

  // Digital IDs for resident app users
  for (const ru of residentUsers) {
    if (!ru.inhabitantId) continue;
    await prisma.digitalId.create({
      data: {
        inhabitantId: ru.inhabitantId,
        idNumber: `BID-${demoBrgy.psgcCode.slice(-4)}-${pad(R.randInt(1, 99999), 6)}`,
        qrCode: `BIDQR-${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
        expiresAt: R.daysAhead(1095),
      },
    });
  }

  // ----------------------------------------------------------------
  // 17. B2 — AI interactions + one agentic run
  // ----------------------------------------------------------------
  console.log("  ⤷ AI layer samples");
  await prisma.aiInteraction.createMany({
    data: [
      {
        barangayId: demoBrgy.id,
        surface: "resident_assistant",
        prompt: "Paano po kumuha ng barangay clearance? Magkano po?",
        response:
          "Para po sa Barangay Clearance: ₱50 ang bayad, at kailangan po ng (1) Valid ID, (2) Proof of residency, at (3) Cedula. Pwede po kayong mag-request online sa app — mag-babayad kayo gamit ang e-wallet, tapos pipili ng pickup schedule. Karaniwang handa po ito sa loob ng isang araw.",
        citations: [{ module: "issuance", type: "CertificateType", code: "BRGY_CLEARANCE" }],
        model: "claude-haiku-4-5",
        latencyMs: 820,
      },
      {
        barangayId: demoBrgy.id,
        surface: "staff_copilot",
        prompt: "Summarize KP case backlog and flag anything near its statutory deadline.",
        response:
          "There are 9 open KP cases. 2 are within 3 days of the 15-day mediation deadline under RA 7160 §410 and need hearings scheduled this week. 1 case has passed the conciliation window and should be evaluated for a Certificate to File Action.",
        citations: [{ module: "kp", type: "KpCase", note: "9 open cases in scope" }],
        model: "claude-opus-4-8",
        latencyMs: 2140,
      },
      {
        barangayId: demoBrgy.id,
        surface: "analytics_copilot",
        prompt: "Which barangays are slowest on clearances this month?",
        response:
          "Across Marikina's 16 barangays, median release time is 1.2 days. The three slowest are listed with their medians; all remain within the RA 11032 threshold for simple transactions.",
        citations: [{ module: "reports", type: "aggregate", note: "aggregate-only view" }],
        model: "claude-opus-4-8",
        latencyMs: 3300,
      },
    ],
  });
  const aiRun = await prisma.aiWorkflowRun.create({
    data: {
      barangayId: demoBrgy.id,
      workflow: "certificate_issuance",
      status: "completed",
      finishedAt: R.daysAgo(1),
    },
  });
  await prisma.aiWorkflowStep.createMany({
    data: [
      { runId: aiRun.id, seq: 1, name: "verify_identity", output: { matched: true, source: "BIPS" }, status: "completed" },
      { runId: aiRun.id, seq: 2, name: "check_blockers", output: { unpaidFees: false, openKpCase: false }, status: "completed" },
      { runId: aiRun.id, seq: 3, name: "draft_certificate", output: { draftLength: 512 }, status: "completed" },
      { runId: aiRun.id, seq: 4, name: "human_approval", output: { approvedBy: "Punong Barangay" }, status: "completed", isHumanGate: true },
      { runId: aiRun.id, seq: 5, name: "issue_and_notify", output: { pdf: true, notified: true }, status: "completed" },
    ],
  });

  // ----------------------------------------------------------------
  // 18. BIMS sync runs (companion mode) + tickets + audit
  // ----------------------------------------------------------------
  for (const b of barangays.slice(0, 6)) {
    if (b.status === "pending" || b.mode !== "companion") continue;
    for (const ds of ["inhabitants", "issuances", "properties"]) {
      await prisma.bimsSyncRun.create({
        data: {
          barangayId: b.id,
          dataset: ds,
          status: "success",
          pulled: R.randInt(20, 320),
          conflicts: R.chance(0.3) ? R.randInt(1, 4) : 0,
          message: "Mock adapter — no live DILG interface. Pending a data-sharing agreement.",
          startedAt: R.daysAgo(1),
          finishedAt: R.daysAgo(1),
        },
      });
    }
  }
  await prisma.ticket.create({
    data: {
      barangayId: demoBrgy.id,
      subject: "Printer not detected when releasing certificates",
      body: "The certificate PDF downloads but the hall printer is not listed.",
      category: "technical",
      status: "in_progress",
      priority: "normal",
      responses: {
        create: [{ body: "Acknowledged — please confirm the printer model and OS version.", isInternal: false }],
      },
    },
  });
  await prisma.auditLog.createMany({
    data: [
      { barangayId: demoBrgy.id, actorId: pb.id, actorRole: "PUNONG_BARANGAY", action: "disbursement_batch.approve", entity: "DisbursementBatch", entityId: honBatch.id, createdAt: R.daysAgo(6) },
      { barangayId: demoBrgy.id, actorId: treas.id, actorRole: "BARANGAY_TREASURER", action: "disbursement_batch.create", entity: "DisbursementBatch", entityId: honBatch.id, createdAt: R.daysAgo(7) },
      { barangayId: demoBrgy.id, actorId: sec.id, actorRole: "BARANGAY_SECRETARY", action: "inhabitant.create", entity: "Inhabitant", createdAt: R.daysAgo(2) },
      { barangayId: demoBrgy.id, actorId: pb.id, actorRole: "PUNONG_BARANGAY", action: "certificate.approve", entity: "CertificateRequest", createdAt: R.daysAgo(1) },
      { barangayId: demoBrgy.id, actorRole: "AI", action: "ai.workflow.complete", entity: "AiWorkflowRun", entityId: aiRun.id, isAiAction: true, createdAt: R.daysAgo(1) },
    ],
  });

  // ----------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------
  const counts = {
    barangays: await prisma.barangay.count(),
    households: await prisma.household.count(),
    inhabitants: await prisma.inhabitant.count(),
    users: await prisma.user.count(),
    certificates: await prisma.certificateRequest.count(),
    kpCases: await prisma.kpCase.count(),
    properties: await prisma.property.count(),
    wallets: await prisma.wallet.count(),
    transactions: await prisma.walletTransaction.count(),
    concerns: await prisma.concern.count(),
    ledger: await prisma.ledgerEntry.count(),
  };

  console.log("\n✅ Seed complete\n");
  console.table(counts);
  console.log(`\n  Demo barangay: ${demoBrgy.name}, Marikina City`);
  console.log(`  Password for every seeded account: ${DEMO_PASSWORD}\n`);
  console.log("  Logins:");
  console.log("    admin@cbms.gov.ph          System Administrator");
  console.log("    lgu@marikina.gov.ph        LGU Administrator (hub)");
  console.log("    kapitan@barangka.gov.ph    Punong Barangay (approver)");
  console.log("    secretary@barangka.gov.ph  Barangay Secretary (encoder)");
  console.log("    treasurer@barangka.gov.ph  Barangay Treasurer (disbursements)");
  console.log("    lupon@barangka.gov.ph      Lupon Secretary (KP)");
  console.log("    vawdesk@barangka.gov.ph    VAW Desk Officer (restricted)");
  console.log("    bhw@barangka.gov.ph        Barangay Health Worker");
  console.log("    tanod@barangka.gov.ph      Tanod / Responder (SOS)");
  console.log("    dilg@dilg.gov.ph           DILG Viewer (aggregates only)");
  console.log("    resident1@example.ph       Resident\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
