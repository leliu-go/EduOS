import { expect, test } from "@playwright/test";

const demoPassword = process.env.EDUOS_DEMO_PASSWORD ?? "EduOS-demo-123456";
const hasDatabase = Boolean(process.env.DATABASE_URL);

const demoLogins = [
  { email: "admin@eduos.test", landingPath: "/dashboard" },
  { email: "teacher@eduos.test", landingPath: "/teacher" },
  { email: "student.lin@eduos.test", landingPath: "/student" },
  { email: "parent.lin@eduos.test", landingPath: "/parent" },
] as const;

test.describe("seeded MVP demo login flows", () => {
  test.skip(!hasDatabase, "Requires a seeded demo database.");

  for (const demoLogin of demoLogins) {
    test(`${demoLogin.email} lands on ${demoLogin.landingPath}`, async ({ page }) => {
      await page.goto("/login");
      await page.locator('input[name="email"]').fill(demoLogin.email);
      await page.locator('input[name="password"]').fill(demoPassword);
      await page.locator('button[type="submit"]').click();

      await expect(page).toHaveURL(new RegExp(`${demoLogin.landingPath}$`));
      await expect(page).not.toHaveURL(/\/unauthorized/);
    });
  }
});
