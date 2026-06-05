import { expect, test } from "@playwright/test";

const demoPassword = process.env.EDUOS_DEMO_PASSWORD ?? "EduOS-demo-123456";
const hasDatabase = Boolean(process.env.DATABASE_URL);

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.locator('input[name="identifier"]').fill(email);
  await page.locator('input[name="password"]').fill(demoPassword);
  await page.locator('button[type="submit"]').click();
}

test.describe("seeded role permission boundaries", () => {
  test.skip(!hasDatabase, "Requires a seeded demo database.");

  test("students cannot open staff, teacher, or finance surfaces", async ({ page }) => {
    await login(page, "student.lin@eduos.test");
    await expect(page).toHaveURL(/\/student$/);

    for (const route of ["/dashboard", "/teacher", "/dashboard/finance-reports"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/unauthorized$/);
    }
  });

  test("teachers cannot open finance or admin resource-management surfaces", async ({ page }) => {
    await login(page, "teacher@eduos.test");
    await expect(page).toHaveURL(/\/teacher$/);

    await page.goto("/dashboard/finance-reports");
    await expect(page).toHaveURL(/\/unauthorized$/);
  });

  test("parents cannot open teacher or staff dashboards", async ({ page }) => {
    await login(page, "parent.lin@eduos.test");
    await expect(page).toHaveURL(/\/parent$/);

    for (const route of ["/teacher/resources", "/dashboard"]) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/unauthorized$/);
    }
  });

  test("finance users cannot manage teaching resources", async ({ page }) => {
    await login(page, "finance@eduos.test");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/dashboard/resources");
    await expect(page).toHaveURL(/\/unauthorized$/);
  });
});
