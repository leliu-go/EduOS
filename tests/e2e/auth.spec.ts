import { expect, test } from "@playwright/test";

const protectedRoutes = [
  { route: "/dashboard", next: "/dashboard" },
  { route: "/dashboard/students", next: "/dashboard" },
  { route: "/dashboard/students/sample-student", next: "/dashboard" },
  { route: "/dashboard/teachers", next: "/dashboard" },
  { route: "/dashboard/teachers/sample-teacher", next: "/dashboard" },
  { route: "/dashboard/campuses", next: "/dashboard" },
  { route: "/dashboard/campuses/sample-campus", next: "/dashboard" },
  { route: "/dashboard/accounts", next: "/dashboard" },
  { route: "/dashboard/academic-config", next: "/dashboard" },
  { route: "/dashboard/courses", next: "/dashboard" },
  { route: "/dashboard/courses/sample-course", next: "/dashboard" },
  { route: "/dashboard/classes", next: "/dashboard" },
  { route: "/dashboard/classes/sample-class", next: "/dashboard" },
  { route: "/dashboard/enrollments", next: "/dashboard" },
  { route: "/dashboard/course-accounts", next: "/dashboard" },
  { route: "/dashboard/renewals", next: "/dashboard" },
  { route: "/dashboard/finance-reports", next: "/dashboard" },
  { route: "/dashboard/payments", next: "/dashboard" },
  { route: "/dashboard/course-consumptions", next: "/dashboard" },
  { route: "/dashboard/resources", next: "/dashboard" },
  { route: "/dashboard/homework", next: "/dashboard" },
  { route: "/dashboard/notifications", next: "/dashboard" },
  { route: "/dashboard/search", next: "/dashboard" },
  { route: "/dashboard/scheduling", next: "/dashboard" },
  { route: "/teacher/classes", next: "/teacher" },
  { route: "/teacher/schedule", next: "/teacher" },
  { route: "/teacher/homework", next: "/teacher" },
  { route: "/teacher/notifications", next: "/teacher" },
  { route: "/teacher/resources", next: "/teacher" },
  { route: "/teacher/me", next: "/teacher" },
  { route: "/teacher/lessons/sample-lesson", next: "/teacher" },
  { route: "/student", next: "/student" },
  { route: "/student/schedule", next: "/student" },
  { route: "/student/homework", next: "/student" },
  { route: "/student/mistakes", next: "/student" },
  { route: "/student/notifications", next: "/student" },
  { route: "/student/payments", next: "/student" },
  { route: "/student/reports", next: "/student" },
  { route: "/student/resources", next: "/student" },
  { route: "/student/resources/sample-resource", next: "/student" },
  { route: "/student/resources/sample-resource/download", next: "/student/resources" },
  { route: "/student/lessons/sample-lesson/resources", next: "/student" },
  { route: "/student/check-in/sample-token", next: "/student" },
  { route: "/student/me", next: "/student" },
  { route: "/teacher", next: "/teacher" },
  { route: "/parent", next: "/parent" },
  { route: "/parent/schedule", next: "/parent" },
  { route: "/parent/consumption", next: "/parent" },
  { route: "/parent/mistakes", next: "/parent" },
  { route: "/parent/notifications", next: "/parent" },
  { route: "/parent/payments", next: "/parent" },
  { route: "/parent/reports", next: "/parent" },
  { route: "/parent/me", next: "/parent" },
];

for (const { route, next } of protectedRoutes) {
  test(`redirects unauthenticated ${route} access to login`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(next);
    await expect(page.getByRole("heading", { name: "登录 EduOS" })).toBeVisible();
  });
}
