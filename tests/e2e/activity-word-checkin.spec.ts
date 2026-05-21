import { expect, test } from "@playwright/test";

const hasDatabase = Boolean(process.env.DATABASE_URL);

test.describe("activity word check-in boundaries", () => {
  test.skip(!hasDatabase, "Requires a seeded demo database and activity fixtures.");

  test("does not expose activity pages before product UI fixtures are seeded", async ({ page }) => {
    await page.goto("/student");
    await expect(page).not.toHaveURL(/\/dashboard/);
  });
});
