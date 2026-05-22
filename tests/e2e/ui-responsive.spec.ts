import { expect, test, type Page } from "@playwright/test";

const qaPassword = process.env.EDUOS_QA_PASSWORD ?? "EduOS-qa-123456";
const runUiResponsive =
  Boolean(process.env.DATABASE_URL) && process.env.EDUOS_RUN_GOLDEN_PATH_E2E === "true";

async function login(page: Page, email: string, landingPath: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(qaPassword);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(new RegExp(`${landingPath}$`));
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(2);
}

async function expectHealthyPage(page: Page, path: string) {
  await page.goto(path);
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page).not.toHaveURL(/\/unauthorized$/);
  await expect(page.locator("body")).toBeVisible();
  await expectNoHorizontalOverflow(page);
}

test.describe("frontend design responsive checks", () => {
  test.skip(
    !runUiResponsive,
    "Run scripts/seed-golden-path.ts and set EDUOS_RUN_GOLDEN_PATH_E2E=true.",
  );

  test("student learning app stays usable across key breakpoints", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page, "qa-student-001@eduos.test", "/student");

    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });

      for (const route of ["/student", "/student/schedule", "/student/homework", "/student/me"]) {
        await expectHealthyPage(page, route);
        await expect(page.getByRole("navigation", { name: "学生端导航" })).toBeVisible();
      }
    }
  });

  test("teacher execution workspace keeps actions visible across key breakpoints", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page, "qa-teacher-math@eduos.test", "/teacher");

    for (const width of [375, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });

      for (const route of ["/teacher", "/teacher/schedule", "/teacher/homework", "/teacher/me"]) {
        await expectHealthyPage(page, route);
        await expect(page.getByRole("navigation", { name: "老师端导航" })).toBeVisible();
      }
    }
  });

  test("admin critical pages keep sidebar and version controls visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await login(page, "qa-admin@eduos.test", "/dashboard");

    for (const route of [
      "/dashboard",
      "/dashboard/students",
      "/dashboard/classes",
      "/dashboard/scheduling",
      "/dashboard/payments",
      "/dashboard/finance-reports",
      "/dashboard/settings/version",
    ]) {
      await expectHealthyPage(page, route);
      await expect(page.locator("[data-eduos-sidebar]")).toBeVisible();
    }

    await page.goto("/dashboard/settings/version");
    await expect(page.getByRole("button", { name: /检查更新/ })).toBeVisible();
  });
});
