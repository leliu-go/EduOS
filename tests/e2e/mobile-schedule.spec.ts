import { expect, test } from "@playwright/test";

const demoPassword = process.env.EDUOS_DEMO_PASSWORD ?? "EduOS-demo-123456";
const hasDatabase = Boolean(process.env.DATABASE_URL);

const mobileScheduleFlows = [
  {
    email: "teacher@eduos.test",
    landingPath: "/teacher",
    schedulePath: "/teacher/schedule",
    heading: "我的课表",
  },
  {
    email: "student.lin@eduos.test",
    landingPath: "/student",
    schedulePath: "/student/schedule",
    heading: "我的课表",
  },
  {
    email: "parent.lin@eduos.test",
    landingPath: "/parent",
    schedulePath: "/parent/schedule",
    heading: "孩子课表",
  },
] as const;

test.describe("seeded mobile schedule navigation", () => {
  test.skip(!hasDatabase, "Requires a seeded demo database.");
  test.use({ viewport: { width: 390, height: 844 } });

  for (const flow of mobileScheduleFlows) {
    test(`${flow.email} can open schedule from the mobile tab bar`, async ({ page }) => {
      await page.goto("/login");
      await page.locator('input[name="identifier"]').fill(flow.email);
      await page.locator('input[name="password"]').fill(demoPassword);
      await page.locator('button[type="submit"]').click();

      await expect(page).toHaveURL(new RegExp(`${flow.landingPath}$`));
      await page.locator(`a[href="${flow.schedulePath}"]`).click();

      await expect(page).toHaveURL(new RegExp(`${flow.schedulePath}$`));
      await expect(page.getByRole("heading", { name: flow.heading })).toBeVisible();
      await expect(page.getByText("页面不存在")).toHaveCount(0);
    });
  }
});
