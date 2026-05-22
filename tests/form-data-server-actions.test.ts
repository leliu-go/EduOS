import { describe, expect, it } from "vitest";

import { getFormDataString } from "@/lib/forms/form-data";

describe("server action form data helpers", () => {
  it("reads plain and React server action prefixed fields", () => {
    const plain = new FormData();
    plain.set("email", "admin@example.test");

    const prefixed = new FormData();
    prefixed.set("_1_email", "teacher@example.test");

    expect(getFormDataString(plain, "email")).toBe("admin@example.test");
    expect(getFormDataString(prefixed, "email")).toBe("teacher@example.test");
    expect(getFormDataString(prefixed, "password")).toBeNull();
  });
});
