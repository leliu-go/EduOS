import { expect, test } from "@playwright/test";

test("redirects unauthenticated dashboard access to login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?next=(%2Fdashboard|\/dashboard)$/);
  await expect(page.getByRole("heading", { name: "登录 EduOS" })).toBeVisible();
});
