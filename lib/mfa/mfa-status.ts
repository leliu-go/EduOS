import type { MfaEnrollmentStatus } from "@/lib/mfa/mfa-policy";

export type MfaCredentialStatusRecord = {
  status: "PENDING_VERIFICATION" | "VERIFIED" | "LOCKED" | "DISABLED";
  lockedUntil: Date | null;
} | null;

export function getMfaEnrollmentStatusFromCredential(
  credential: MfaCredentialStatusRecord,
  now = new Date(),
): MfaEnrollmentStatus {
  if (!credential || credential.status === "DISABLED") {
    return "not_enrolled";
  }

  if (credential.status === "LOCKED") {
    return "locked";
  }

  if (credential.lockedUntil && credential.lockedUntil > now) {
    return "locked";
  }

  if (credential.status === "PENDING_VERIFICATION") {
    return "pending_verification";
  }

  return "verified";
}

export async function getMfaEnrollmentStatus(input: {
  tenantId: string;
  userId: string;
}) {
  const { prisma } = await import("@/lib/prisma");
  const credential = await prisma.userMfaCredential.findUnique({
    where: {
      tenantId_userId_provider: {
        tenantId: input.tenantId,
        userId: input.userId,
        provider: "totp",
      },
    },
    select: {
      status: true,
      lockedUntil: true,
    },
  });

  return getMfaEnrollmentStatusFromCredential(credential);
}
