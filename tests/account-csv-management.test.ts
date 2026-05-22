import { describe, expect, it } from "vitest";

import {
  accountCsvColumns,
  buildAccountCsv,
  buildAccountImportTemplate,
  parseAccountImportCsv,
} from "@/features/accounts/account-csv";
import { canManageAccountRole } from "@/features/accounts/account-policy";

describe("account CSV management", () => {
  it("exports account rows and provides an Excel-compatible CSV template", () => {
    expect(accountCsvColumns).toEqual([
      "role",
      "name",
      "email",
      "phone",
      "initialPassword",
      "status",
    ]);

    const template = buildAccountImportTemplate();
    expect(template).toContain("role,name,email,phone,initialPassword,status");
    expect(template).toContain("STUDENT");

    const csv = buildAccountCsv([
      {
        role: "ORG_ADMIN",
        name: "Admin User",
        email: "admin@example.test",
        phone: "",
        status: "ACTIVE",
      },
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("ORG_ADMIN,Admin User,admin@example.test");
  });

  it("parses template rows without logging or exposing password hashes", () => {
    const rows = parseAccountImportCsv(
      "role,name,email,phone,initialPassword,status\nSTUDENT,QA Student,qa-student@example.test,,EduOS-demo-123456,ACTIVE",
    );

    expect(rows).toEqual([
      {
        role: "STUDENT",
        name: "QA Student",
        email: "qa-student@example.test",
        phone: undefined,
        initialPassword: "EduOS-demo-123456",
        status: "ACTIVE",
      },
    ]);
  });

  it("allows admins to manage all tenant accounts and teachers only student accounts", () => {
    expect(canManageAccountRole("ORG_ADMIN", "SUPER_ADMIN")).toBe(true);
    expect(canManageAccountRole("ORG_ADMIN", "TEACHER")).toBe(true);
    expect(canManageAccountRole("TEACHER", "STUDENT")).toBe(true);
    expect(canManageAccountRole("TEACHER", "TEACHER")).toBe(false);
    expect(canManageAccountRole("TEACHER", "ORG_ADMIN")).toBe(false);
  });
});
