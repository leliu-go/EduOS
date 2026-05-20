import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("final project review", () => {
  it("records the T80 handoff review with verification and demo flow evidence", () => {
    const reviewPath = join(rootDir, "docs/FINAL_REVIEW.md");

    expect(existsSync(reviewPath)).toBe(true);

    const review = readProjectFile("docs/FINAL_REVIEW.md");

    expect(review).toContain("T80 Final project review");
    expect(review).toContain("P0/P1 review");
    expect(review).toContain("MVP demo flows");
    expect(review).toContain("Documentation");
    expect(review).toContain("pnpm lint");
    expect(review).toContain("pnpm typecheck");
    expect(review).toContain("pnpm test");
    expect(review).toContain("pnpm test:e2e");
    expect(review).toContain("pnpm build");
    expect(review).toContain("seeded MVP demo login flows");
  });
});
