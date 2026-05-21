import { expect, test, type Page } from "@playwright/test";

const qaPassword = process.env.EDUOS_QA_PASSWORD ?? "EduOS-qa-123456";
const runGoldenPath =
  Boolean(process.env.DATABASE_URL) && process.env.EDUOS_RUN_GOLDEN_PATH_E2E === "true";

async function login(page: Page, email: string, landingPath: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(qaPassword);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(new RegExp(`${landingPath}$`));
}

async function expectHealthyPortalPage(page: Page, path: string) {
  await page.goto(path);
  await expect(page).not.toHaveURL(/\/unauthorized$/);
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByText("页面不存在")).toHaveCount(0);
  await expect(page.getByText("加载失败")).toHaveCount(0);
}

test.describe("Day 5 QA golden path", () => {
  test.skip(!runGoldenPath, "Run scripts/seed-golden-path.ts and set EDUOS_RUN_GOLDEN_PATH_E2E=true.");

  test("admin and finance can inspect the full operations flow without broken routes", async ({ page }) => {
    await login(page, "qa-admin@eduos.test", "/dashboard");

    for (const route of [
      "/dashboard/students",
      "/dashboard/teachers",
      "/dashboard/courses",
      "/dashboard/classes",
      "/dashboard/enrollments",
      "/dashboard/scheduling",
      "/dashboard/resources",
      "/dashboard/homework",
      "/dashboard/course-accounts",
      "/dashboard/course-consumptions",
      "/dashboard/payments",
      "/dashboard/finance-reports",
      "/dashboard/settings/version",
    ]) {
      await expectHealthyPortalPage(page, route);
    }

    await page.goto("/dashboard/payments");
    await expect(page.getByRole("button", { name: /新增收款/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /退费申请/ })).toBeVisible();
  });

  test("teacher can inspect teaching execution data and remains blocked from finance", async ({ page }) => {
    await login(page, "qa-teacher-math@eduos.test", "/teacher");

    for (const route of [
      "/teacher",
      "/teacher/schedule",
      "/teacher/classes",
      "/teacher/homework",
      "/teacher/resources",
      "/teacher/me",
    ]) {
      await expectHealthyPortalPage(page, route);
    }

    await page.goto("/dashboard/finance-reports");
    await expect(page).toHaveURL(/\/unauthorized$/);
  });

  test("student can inspect learning tasks and resource download stays server-authorized", async ({ page }) => {
    await login(page, "qa-student-001@eduos.test", "/student");

    for (const route of [
      "/student",
      "/student/schedule",
      "/student/homework",
      "/student/mistakes",
      "/student/resources",
      "/student/reports",
      "/student/me",
    ]) {
      await expectHealthyPortalPage(page, route);
    }

    await page.goto("/student/resources");
    await page.locator('a[href^="/student/resources/"]:visible').first().click();
    await expect(page).toHaveURL(/\/student\/resources\/[^/]+$/);
    await expect(page.locator('a[href$="/download"]')).toHaveCount(1);

    for (const route of ["/teacher", "/dashboard", "/dashboard/finance-reports"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/unauthorized$/);
    }
  });

  test("finance can use finance surfaces but cannot manage teaching resources", async ({ page }) => {
    await login(page, "qa-finance@eduos.test", "/dashboard");

    for (const route of ["/dashboard/payments", "/dashboard/finance-reports"]) {
      await expectHealthyPortalPage(page, route);
    }

    await page.goto("/dashboard/payments");
    await expect(page.getByRole("button", { name: /退费申请/ })).toBeVisible();
    await page.goto("/dashboard/resources");
    await expect(page).toHaveURL(/\/unauthorized$/);
  });
});
