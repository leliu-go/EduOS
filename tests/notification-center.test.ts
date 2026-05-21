import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("notification center", () => {
  it("defines notification model, events, and tenant-scoped indexes", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");

    expect(schema).toContain("enum NotificationEventType");
    for (const event of [
      "SCHEDULE_CREATED",
      "SCHEDULE_CHANGED",
      "ATTENDANCE_CONFIRMED",
      "COURSE_CONSUMPTION_CREATED",
      "HOMEWORK_ASSIGNED",
      "HOMEWORK_CORRECTED",
      "REPORT_AVAILABLE",
    ]) {
      expect(schema).toContain(event);
    }

    expect(schema).toContain("enum NotificationStatus");
    expect(schema).toContain("model Notification");
    expect(schema).toContain("tenantId");
    expect(schema).toContain("recipientUserId");
    expect(schema).toContain("recipientRoleKey");
    expect(schema).toContain("@@index([tenantId, recipientUserId, status])");
    expect(schema).toContain("@@index([tenantId, recipientRoleKey, status])");
  });

  it("reads only user or role relevant notifications", async () => {
    const modulePath = "../features/notifications/queries";
    const notificationModule = (await import(/* @vite-ignore */ modulePath).catch(() => null)) as {
      getNotificationRecipientWhere?: (userId: string, roleKey: string) => unknown;
    } | null;

    expect(notificationModule?.getNotificationRecipientWhere).toBeTypeOf("function");
    if (!notificationModule?.getNotificationRecipientWhere) {
      return;
    }

    expect(notificationModule.getNotificationRecipientWhere("user_1", "TEACHER")).toEqual({
      OR: [{ recipientUserId: "user_1" }, { recipientRoleKey: "TEACHER" }],
    });

    const source = readFileSync(join(process.cwd(), "features/notifications/queries.ts"), "utf8");

    expect(source).toContain("getUserNotifications");
    expect(source).toContain("prisma.notification.findMany");
    expect(source).toContain("tenantId");
    expect(source).toContain("status");
    expect(source).toContain("getNotificationRecipientWhere");
  });

  it("renders notification centers for dashboard and role portals", () => {
    const dashboardPage = join(process.cwd(), "app/(dashboard)/dashboard/notifications/page.tsx");
    const teacherPage = join(process.cwd(), "app/(mobile)/teacher/notifications/page.tsx");
    const studentPage = join(process.cwd(), "app/(mobile)/student/notifications/page.tsx");
    const parentPage = join(process.cwd(), "app/(mobile)/parent/notifications/page.tsx");
    const listPath = join(process.cwd(), "features/notifications/notification-list.tsx");
    const topbarPath = join(process.cwd(), "components/layout/app-topbar.tsx");
    const mobilePageHeaderPath = join(process.cwd(), "components/mobile/MobilePageHeader.tsx");
    const e2ePath = join(process.cwd(), "tests/e2e/auth.spec.ts");

    for (const file of [dashboardPage, teacherPage, studentPage, parentPage, listPath]) {
      expect(existsSync(file)).toBe(true);
    }

    if (
      !existsSync(dashboardPage) ||
      !existsSync(teacherPage) ||
      !existsSync(studentPage) ||
      !existsSync(parentPage) ||
      !existsSync(listPath)
    ) {
      return;
    }

    const dashboardSource = readFileSync(dashboardPage, "utf8");
    const teacherSource = readFileSync(teacherPage, "utf8");
    const studentSource = readFileSync(studentPage, "utf8");
    const parentSource = readFileSync(parentPage, "utf8");
    const listSource = readFileSync(listPath, "utf8");
    const topbarSource = readFileSync(topbarPath, "utf8");
    const mobilePageHeaderSource = readFileSync(mobilePageHeaderPath, "utf8");
    const e2eSource = readFileSync(e2ePath, "utf8");

    expect(dashboardSource).toContain('requirePermission("route:dashboard"');
    expect(teacherSource).toContain('requirePermission("route:teacher"');
    expect(studentSource).toContain('requirePermission("route:student"');
    expect(parentSource).toContain('requirePermission("route:parent"');
    for (const source of [dashboardSource, teacherSource, studentSource, parentSource]) {
      expect(source).toContain("getUserNotifications");
      expect(source).toContain("NotificationList");
    }

    for (const copy of ["通知中心", "未读", "已读", "暂无通知"]) {
      expect(dashboardSource + teacherSource + studentSource + parentSource + listSource).toContain(
        copy,
      );
    }

    expect(topbarSource).toContain("/dashboard/notifications");
    expect(mobilePageHeaderSource).toContain("/notifications");
    for (const route of [
      "/dashboard/notifications",
      "/teacher/notifications",
      "/student/notifications",
      "/parent/notifications",
    ]) {
      expect(e2eSource).toContain(route);
    }
  });
});
