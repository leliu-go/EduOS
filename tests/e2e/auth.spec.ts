import { expect, test } from "@playwright/test";

const protectedRoutes = ["/dashboard", "/student", "/teacher", "/parent"];

for (const route of protectedRoutes) {
  test(`redirects unauthenticated ${route} access to login`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(route);
    await expect(page.getByRole("heading", { name: "登录 EduOS" })).toBeVisible();
  });
}
