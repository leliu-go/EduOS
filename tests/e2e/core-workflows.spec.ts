import { expect, test, type Page } from "@playwright/test";

async function expectLoginGate(page: Page, nextPath: string) {
  await expect(page).toHaveURL(/\/login\?next=/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(nextPath);
  await expect(page.locator('input[name="identifier"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
}

test.describe("login flow", () => {
  test("renders the login form and validation error surface", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: /EduOS/ })).toBeVisible();
    await expect(page.locator('input[name="identifier"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    await page.goto("/login?error=invalid_credentials");

    await expect(page.locator('form [role="alert"]')).toBeVisible();
  });
});

const protectedWorkflowRoutes = [
  {
    name: "create student",
    route: "/dashboard/students",
    next: "/dashboard",
  },
  {
    name: "create teacher",
    route: "/dashboard/teachers",
    next: "/dashboard",
  },
  {
    name: "create course",
    route: "/dashboard/courses",
    next: "/dashboard",
  },
  {
    name: "create class",
    route: "/dashboard/classes",
    next: "/dashboard",
  },
  {
    name: "schedule lesson",
    route: "/dashboard/scheduling",
    next: "/dashboard",
  },
  {
    name: "attendance",
    route: "/teacher",
    next: "/teacher",
  },
  {
    name: "course consumption",
    route: "/dashboard/course-consumptions",
    next: "/dashboard",
  },
  {
    name: "homework",
    route: "/dashboard/homework",
    next: "/dashboard",
  },
  {
    name: "mistake notebook",
    route: "/student/mistakes",
    next: "/student",
  },
] as const;

test.describe("core business workflow gates", () => {
  for (const workflow of protectedWorkflowRoutes) {
    test(`protects the ${workflow.name} workflow`, async ({ page }) => {
      await page.goto(workflow.route);

      await expectLoginGate(page, workflow.next);
    });
  }
});
