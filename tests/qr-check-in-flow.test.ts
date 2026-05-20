import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("QR check-in flow", () => {
  it("creates signed, non-guessable tokens that expire", async () => {
    const tokenPath = join(process.cwd(), "features/attendance/check-in-token.ts");

    expect(existsSync(tokenPath)).toBe(true);
    if (!existsSync(tokenPath)) {
      return;
    }

    const modulePath = "../features/attendance/check-in-token";
    const { createCheckInQrToken, verifyCheckInQrToken } = (await import(
      /* @vite-ignore */ modulePath
    )) as {
      createCheckInQrToken: (
        input: { tenantId: string; scheduleId: string; now?: Date; ttlMs?: number },
        secret?: string,
      ) => string;
      verifyCheckInQrToken: (
        token: string,
        now?: Date,
        secret?: string,
      ) => { tenantId: string; scheduleId: string; nonce: string } | null;
    };
    const now = new Date("2026-05-19T10:00:00.000Z");
    const token = createCheckInQrToken(
      { tenantId: "tenant_1", scheduleId: "schedule_1", now, ttlMs: 60_000 },
      "test-secret",
    );
    const payload = verifyCheckInQrToken(
      token,
      new Date("2026-05-19T10:00:30.000Z"),
      "test-secret",
    );

    expect(token.split(".")).toHaveLength(2);
    expect(payload).toMatchObject({ tenantId: "tenant_1", scheduleId: "schedule_1" });
    expect(payload?.nonce.length).toBeGreaterThanOrEqual(32);
    expect(verifyCheckInQrToken(`${token}x`, now, "test-secret")).toBeNull();
    expect(
      verifyCheckInQrToken(token, new Date("2026-05-19T10:02:00.000Z"), "test-secret"),
    ).toBeNull();
  });

  it("generates a QR image URL for lesson check-in", () => {
    const tokenPath = join(process.cwd(), "features/attendance/check-in-token.ts");

    expect(existsSync(tokenPath)).toBe(true);
    if (!existsSync(tokenPath)) {
      return;
    }

    const source = readFileSync(tokenPath, "utf8");

    expect(source).toContain("createScheduleCheckInQrCode");
    expect(source).toContain("QRCode.toDataURL");
    expect(source).toContain("/student/check-in/");
  });

  it("checks in from QR token only for enrolled current students", () => {
    const actionSource = readFileSync(
      join(process.cwd(), "features/attendance/actions.ts"),
      "utf8",
    );
    const schemaSource = readFileSync(
      join(process.cwd(), "features/attendance/attendance-schema.ts"),
      "utf8",
    );

    expect(schemaSource).toContain("qrCheckInFormSchema");
    expect(schemaSource).toContain("getQrCheckInFormValues");
    expect(actionSource).toContain("createStudentQrCheckInAction");
    expect(actionSource).toContain("verifyCheckInQrToken");
    expect(actionSource).toContain('requirePermission("route:student"');
    expect(actionSource).toContain("tenantId: currentUser.tenantId");
    const qrActionBody = actionSource.slice(
      actionSource.indexOf("export async function createStudentQrCheckInAction"),
      actionSource.indexOf("export async function confirmStudentCheckInAction"),
    );

    expect(qrActionBody).toContain("userId: currentUser.id");
    expect(qrActionBody).toContain("enrollments:");
    expect(qrActionBody).toContain('status: "ACTIVE"');
    expect(actionSource).toContain("tx.checkIn.upsert");
  });

  it("renders QR code for teacher schedules and a student QR landing page", () => {
    const rosterForm = readFileSync(
      join(process.cwd(), "features/attendance/attendance-roster-form.tsx"),
      "utf8",
    );
    const landingPath = join(process.cwd(), "app/(mobile)/student/check-in/[token]/page.tsx");

    expect(rosterForm).toContain("createScheduleCheckInQrCode");
    expect(rosterForm).toContain("qrCode.dataUrl");
    expect(existsSync(landingPath)).toBe(true);
    if (!existsSync(landingPath)) {
      return;
    }

    const landingPage = readFileSync(landingPath, "utf8");

    expect(landingPage).toContain("createStudentQrCheckInAction");
    expect(landingPage).toContain("token");
  });
});
