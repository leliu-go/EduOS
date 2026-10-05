import { recoverAdminAccount } from "../lib/auth/admin-recovery";
import { prisma } from "../lib/prisma";

async function readStdin() {
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 4096) throw new Error("Input too large.");
  }
  return input;
}

async function main() {
  if (process.argv.includes("--inspect")) {
    const username = process.argv[process.argv.indexOf("--inspect") + 1];
    if (!username) throw new Error("Username required.");
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        status: true,
        memberships: {
          select: {
            status: true,
            tenant: { select: { slug: true } },
            role: { select: { key: true } },
          },
        },
        mfaCredentials: { select: { status: true } },
      },
    });
    console.log(JSON.stringify(user));
    return;
  }
  if (!process.argv.includes("--stdin")) {
    throw new Error("Use --stdin; never pass passwords in command arguments.");
  }
  const result = await recoverAdminAccount(JSON.parse(await readStdin()));
  console.log(JSON.stringify(result));
}

main()
  .catch(() => {
    console.error("Admin recovery failed. No credentials were printed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
