import { expect, test } from "@playwright/test";

const correctionSurfaces = [
  { route: "/teacher/homework?homework=corrected", next: "/teacher" },
  { route: "/student/homework", next: "/student" },
  { route: "/parent", next: "/parent" },
];

for (const { route, next } of correctionSurfaces) {
  test(`protects homework correction surface ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(next);
    await expect(page.getByRole("heading", { name: "登录 EduOS" })).toBeVisible();
  });
}
