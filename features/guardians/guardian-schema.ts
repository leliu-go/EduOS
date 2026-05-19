import { z } from "zod";

export const guardianRelationshipValues = [
  "FATHER",
  "MOTHER",
  "GRANDPARENT",
  "RELATIVE",
  "OTHER",
] as const;

export const guardianRelationshipLabels = {
  FATHER: "父亲",
  MOTHER: "母亲",
  GRANDPARENT: "祖辈",
  RELATIVE: "亲属",
  OTHER: "其他",
} as const satisfies Record<(typeof guardianRelationshipValues)[number], string>;

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

const checkboxSchema = z.preprocess((value) => value === "on" || value === "true", z.boolean());

export const guardianBindingSchema = z
  .object({
    studentId: z.string().cuid(),
    guardianId: optionalText(40),
    name: optionalText(50),
    phone: optionalText(30),
    email: optionalEmailSchema,
    relationship: z.enum(guardianRelationshipValues),
    isPrimary: checkboxSchema.default(false),
  })
  .superRefine((value, context) => {
    if (!value.guardianId && !value.name) {
      context.addIssue({
        code: "custom",
        path: ["name"],
        message: "Guardian name is required when guardianId is not provided.",
      });
    }
  });

export type GuardianBindingValues = z.infer<typeof guardianBindingSchema>;

export function getGuardianBindingValues(formData: FormData) {
  return guardianBindingSchema.safeParse({
    studentId: formData.get("studentId"),
    guardianId: formData.get("guardianId"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    relationship: formData.get("relationship"),
    isPrimary: formData.get("isPrimary"),
  });
}
