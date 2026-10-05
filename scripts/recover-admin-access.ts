import { recoverAdminAccount } from "../lib/auth/admin-recovery";
import { prisma } from "../lib/prisma";
import { createInterface } from "node:readline";

async function readStdin() {
  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
  try {
    for await (const line of lines) {
      if (line.length > 4096) throw new Error("Input too large.");
      if (line.trim()) return line;
    }
    return "";
  } finally {
    lines.close();
    process.stdin.pause();
  }
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
