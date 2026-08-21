/* eslint-disable no-console */
/**
 * Dev helper: print the CURRENT TOTP code for seeded staff accounts.
 *
 *   pnpm mfa            # all staff accounts
 *   pnpm mfa kapitan    # filter by email substring
 *
 * TOTP codes rotate every 30 seconds — re-run if one expires.
 * This reads mfaSecret straight from the database and is dev-only.
 */
import { PrismaClient } from "@prisma/client";
import { totpCode, totpUri } from "../../auth/src/index.js";

const prisma = new PrismaClient();

async function main() {
  const filter = process.argv[2];

  const users = await prisma.user.findMany({
    where: {
      mfaEnabled: true,
      ...(filter ? { email: { contains: filter, mode: "insensitive" } } : {}),
    },
    select: { email: true, fullName: true, mfaSecret: true },
    orderBy: { email: "asc" },
  });

  if (users.length === 0) {
    console.log(
      filter
        ? `\nNo MFA-enrolled user matches "${filter}".`
        : "\nNo MFA-enrolled users yet.",
    );
    console.log(
      "Staff accounts enrol on their first login attempt — log in once, then re-run this.\n",
    );
    return;
  }

  const secondsLeft = 30 - Math.floor((Date.now() / 1000) % 30);

  console.log(`\n  Current TOTP codes — valid for ${secondsLeft}s (password: Cbms#2026)\n`);
  console.log(`  ${"CODE".padEnd(10)}${"ACCOUNT".padEnd(32)}NAME`);
  console.log(`  ${"─".repeat(74)}`);

  for (const u of users) {
    if (!u.mfaSecret) continue;
    const code = totpCode(u.mfaSecret);
    console.log(`  ${code.padEnd(10)}${(u.email ?? "—").padEnd(32)}${u.fullName}`);
  }

  if (filter && users.length === 1 && users[0]!.mfaSecret) {
    console.log(`\n  Authenticator URI:\n  ${totpUri(users[0]!.mfaSecret!, users[0]!.email ?? "user")}`);
  }

  console.log(
    `\n  Residents (resident1@example.ph …) do NOT use MFA — password only.\n`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
