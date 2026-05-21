import { expect, test } from "@playwright/test";

const demoPassword = process.env.EDUOS_DEMO_PASSWORD ?? "EduOS-demo-123456";
const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("seeded mobile resource navigation", () => {
  test.skip(!hasDatabase, "Requires a seeded demo database.");
  test.use({ viewport: { width: 390, height: 844 } });

  test("teacher can open resources from the profile shortcut", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill("teacher@eduos.test");
    await page.locator('input[name="password"]').fill(demoPassword);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/teacher$/);
    await page.locator('a[href="/teacher/me"]').click();
    await expect(page).toHaveURL(/\/teacher\/me$/);

    await page.locator('a[href="/teacher/resources"]').click();

    await expect(page).toHaveURL(/\/teacher\/resources$/);
    await expect(page.getByRole("heading", { name: "课程资源", exact: true })).toBeVisible();
    await expect(page.getByText("课程资源加载失败")).toHaveCount(0);
  });
});
