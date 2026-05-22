import { expect, test, type Page } from "@playwright/test";

const qaPassword = process.env.EDUOS_QA_PASSWORD ?? "EduOS-qa-123456";
const runSchedulingMonthE2E =
  Boolean(process.env.DATABASE_URL) && process.env.EDUOS_RUN_GOLDEN_PATH_E2E === "true";

async function login(page: Page, email: string, landingPath: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(qaPassword);
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(new RegExp(`${landingPath}$`));
}

test.describe("scheduling month view", () => {
  test.skip(
    !runSchedulingMonthE2E,
    "Run scripts/seed-golden-path.ts and set EDUOS_RUN_GOLDEN_PATH_E2E=true.",
  );

  test("admin can switch months and open a daily schedule from month view", async ({ page }) => {
    await login(page, "qa-admin@eduos.test", "/dashboard");

    await page.goto("/dashboard/scheduling?view=month&date=2026-05-15");
    await expect(page).toHaveURL(/view=month/);
    await expect(page.getByTestId("scheduling-month-calendar-desktop")).toBeVisible();
    await expect(page.getByText("月视图")).toBeVisible();
    await expect(page.getByText(/2 节课/)).toBeVisible();

    await page.getByRole("link", { name: "下个月" }).click();
    await expect(page).toHaveURL(/view=month&date=2026-06-15/);
    await page.getByRole("link", { name: "上个月" }).click();
    await expect(page).toHaveURL(/view=month&date=2026-05-15/);
    await page.getByRole("link", { name: "今天" }).click();
    await expect(page).toHaveURL(/view=month/);

    await page.goto("/dashboard/scheduling?view=month&date=2026-05-15");
    await page.locator('[data-testid="scheduling-month-day-2026-05-23"]:visible').first().click();
    await expect(page).toHaveURL(/view=day&date=2026-05-23/);
  });

  test("month view is usable on mobile without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page, "qa-admin@eduos.test", "/dashboard");

    await page.goto("/dashboard/scheduling?view=month&date=2026-05-15");
    await expect(page.getByTestId("scheduling-month-calendar-mobile")).toBeVisible();
    await expect(page.getByRole("link", { name: "查看当天" }).first()).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("teacher and student cannot open internal scheduling month view", async ({ page }) => {
    await login(page, "qa-teacher-math@eduos.test", "/teacher");
    await page.goto("/dashboard/scheduling?view=month&date=2026-05-15");
    await expect(page).toHaveURL(/\/unauthorized$/);

    await page.context().clearCookies();
    await login(page, "qa-student-001@eduos.test", "/student");
    await page.goto("/dashboard/scheduling?view=month&date=2026-05-15");
    await expect(page).toHaveURL(/\/unauthorized$/);
  });
});
