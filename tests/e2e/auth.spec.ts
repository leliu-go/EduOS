import { expect, test } from "@playwright/test";

const protectedRoutes = [
  { route: "/dashboard", next: "/dashboard" },
  { route: "/dashboard/students", next: "/dashboard" },
  { route: "/dashboard/teachers", next: "/dashboard" },
  { route: "/dashboard/campuses", next: "/dashboard" },
  { route: "/dashboard/accounts", next: "/dashboard" },
  { route: "/dashboard/academic-config", next: "/dashboard" },
  { route: "/student", next: "/student" },
  { route: "/teacher", next: "/teacher" },
  { route: "/parent", next: "/parent" },
];

for (const { route, next } of protectedRoutes) {
  test(`redirects unauthenticated ${route} access to login`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(next);
    await expect(page.getByRole("heading", { name: "登录 EduOS" })).toBeVisible();
  });
}
