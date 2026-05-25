import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("CSV download response helper", () => {
  it("standardizes no-store CSV download headers", async () => {
    const helperPath = join(process.cwd(), "lib/http/csv-response.ts");

    expect(existsSync(helperPath)).toBe(true);

    const { createCsvDownloadResponse } = (await import("../lib/http/csv-response")) as {
      createCsvDownloadResponse: (csv: string, filename: string) => Response;
    };

    const response = createCsvDownloadResponse("metric,value\npaid,100", "finance-report.csv");

    expect(await response.text()).toBe("metric,value\npaid,100");
    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="finance-report.csv"',
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("rejects unsafe CSV filenames before writing headers", async () => {
    const helperPath = join(process.cwd(), "lib/http/csv-response.ts");

    expect(existsSync(helperPath)).toBe(true);

    const { createCsvDownloadResponse } = (await import("../lib/http/csv-response")) as {
      createCsvDownloadResponse: (csv: string, filename: string) => Response;
    };

    expect(() => createCsvDownloadResponse("a,b", "bad\nname.csv")).toThrow(
      "Unsafe CSV filename.",
    );
  });
});
