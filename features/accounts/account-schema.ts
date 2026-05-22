import { z } from "zod";

import { getFormDataString } from "@/lib/forms/form-data";
import type { RoleKey } from "@/lib/rbac/permissions";

export const accountTargetTypes = ["TEACHER", "STUDENT", "GUARDIAN"] as const;

export const accountTargetLabels = {
  TEACHER: "教师",
  STUDENT: "学生",
  GUARDIAN: "监护人",
} as const satisfies Record<(typeof accountTargetTypes)[number], string>;

export const accountTargetRoleMap = {
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  GUARDIAN: "PARENT",
} as const satisfies Record<(typeof accountTargetTypes)[number], RoleKey>;

export const accountRoleNameMap = {
  SUPER_ADMIN: "超级管理员",
  ORG_ADMIN: "机构管理员",
  CAMPUS_ADMIN: "校区管理员",
  ACADEMIC: "教务",
  FINANCE: "财务",
  TEACHER: "教师",
  STUDENT: "学生",
  PARENT: "家长",
} as const satisfies Partial<Record<RoleKey, string>>;

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );
}

const optionalEmailSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().email().max(120).optional(),
);

export const accountInvitationSchema = z
  .object({
    targetType: z.enum(accountTargetTypes),
    targetId: z.string().cuid(),
    email: optionalEmailSchema,
    phone: optionalText(30),
    initialPassword: z.string().min(8).max(100),
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

export type AccountInvitationValues = z.infer<typeof accountInvitationSchema>;
export type AccountTargetType = (typeof accountTargetTypes)[number];

export function getAccountInvitationValues(formData: FormData) {
  return accountInvitationSchema.safeParse({
    targetType: getFormDataString(formData, "targetType"),
    targetId: getFormDataString(formData, "targetId"),
    email: getFormDataString(formData, "email"),
    phone: getFormDataString(formData, "phone"),
    initialPassword: getFormDataString(formData, "initialPassword"),
  });
}
