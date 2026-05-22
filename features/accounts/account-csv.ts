import { z } from "zod";

import { roleKeys, type RoleKey } from "@/lib/rbac/permissions";

export const accountCsvColumns = [
  "role",
  "name",
  "email",
  "phone",
  "initialPassword",
  "status",
] as const;

export type AccountCsvRow = {
  role: RoleKey;
  name: string;
  email?: string;
  phone?: string;
  initialPassword?: string;
  status: "ACTIVE" | "DISABLED";
};

const accountImportRowSchema = z
  .object({
    role: z.enum(roleKeys),
    name: z.string().trim().min(1).max(80),
    email: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().email().max(120).optional(),
    ),
    phone: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().max(30).optional(),
    ),
    initialPassword: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().min(8).max(100).optional(),
    ),
    status: z.enum(["ACTIVE", "DISABLED"]).default("ACTIVE"),
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      context.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email or phone is required.",
      });
    }
  });

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && quoted && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);

  return cells.map((cell) => cell.trim());
}

function formatCsvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);

  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

export function buildAccountImportTemplate() {
  return [
    accountCsvColumns.join(","),
    ["STUDENT", "学生姓名", "student@example.test", "", "EduOS-demo-123456", "ACTIVE"].join(","),
    ["TEACHER", "老师姓名", "teacher@example.test", "", "EduOS-demo-123456", "ACTIVE"].join(","),
    ["ORG_ADMIN", "管理员姓名", "admin@example.test", "", "EduOS-demo-123456", "ACTIVE"].join(
      ",",
    ),
  ].join("\n");
}

export function buildAccountCsv(rows: Omit<AccountCsvRow, "initialPassword">[]) {
  const body = rows
    .map((row) =>
      [
        row.role,
        row.name,
        row.email ?? "",
        row.phone ?? "",
        "",
        row.status,
      ]
        .map(formatCsvCell)
        .join(","),
    )
    .join("\n");

  return `\uFEFF${accountCsvColumns.join(",")}\n${body}`;
}

export function parseAccountImportCsv(csv: string) {
  const normalized = csv.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const [headerLine, ...dataLines] = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!headerLine) {
    return [];
  }

  const header = parseCsvLine(headerLine);
  const columnIndexes = new Map(header.map((column, index) => [column, index]));

  for (const column of accountCsvColumns) {
    if (!columnIndexes.has(column)) {
      throw new Error(`Missing CSV column: ${column}`);
    }
  }

  return dataLines.map((line) => {
    const cells = parseCsvLine(line);
    const rawRow = Object.fromEntries(
      accountCsvColumns.map((column) => [column, cells[columnIndexes.get(column) ?? -1] ?? ""]),
    );
    const parsed = accountImportRowSchema.parse(rawRow);

    return parsed;
  });
}
