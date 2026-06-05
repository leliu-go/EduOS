import { expect, test } from "@playwright/test";

const demoPassword = process.env.EDUOS_DEMO_PASSWORD ?? "EduOS-demo-123456";
const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("seeded mobile parent profile navigation", () => {
  test.skip(!hasDatabase, "Requires a seeded demo database.");
  test.use({ viewport: { width: 390, height: 844 } });

  test("parent can open profile from the mobile tab bar", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="identifier"]').fill("parent.lin@eduos.test");
    await page.locator('input[name="password"]').fill(demoPassword);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/parent$/);
    await page.locator('a[href="/parent/me"]').click();

    await expect(page).toHaveURL(/\/parent\/me$/);
    await expect(page.getByRole("heading", { name: "我的", exact: true })).toBeVisible();
    await expect(page.getByText("页面不存在")).toHaveCount(0);
  });
});
