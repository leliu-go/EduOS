import { z } from "zod";

const requiredIdSchema = z.string().trim().min(1);
const optionalIdSchema = z.string().trim().min(1).optional();
const amountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/);

export const refundRequestSchema = z.object({
  orderId: optionalIdSchema,
  paymentId: optionalIdSchema,
  courseAccountId: requiredIdSchema,
  studentId: requiredIdSchema,
  guardianId: optionalIdSchema,
  amount: amountSchema,
  currency: z.string().trim().length(3).default("CNY"),
  refundHours: z.coerce.number().int().positive(),
  reason: z.string().trim().min(2).max(500),
});

export const refundApprovalSchema = z.object({
  refundId: requiredIdSchema,
  approvalNote: z.string().trim().min(2).max(500),
});

export type RefundRequestValues = z.infer<typeof refundRequestSchema>;
export type RefundApprovalValues = z.infer<typeof refundApprovalSchema>;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getOptionalString(formData: FormData, key: string) {
  const value = getString(formData, key).trim();

  return value.length > 0 ? value : undefined;
}

export function getRefundRequestFormValues(formData: FormData) {
  return refundRequestSchema.safeParse({
    orderId: getOptionalString(formData, "orderId"),
    paymentId: getOptionalString(formData, "paymentId"),
    courseAccountId: getString(formData, "courseAccountId"),
    studentId: getString(formData, "studentId"),
    guardianId: getOptionalString(formData, "guardianId"),
    amount: getString(formData, "amount"),
    currency: getOptionalString(formData, "currency"),
    refundHours: getString(formData, "refundHours"),
    reason: getString(formData, "reason"),
  });
}

export function getRefundApprovalFormValues(formData: FormData) {
  return refundApprovalSchema.safeParse({
    refundId: getString(formData, "refundId"),
    approvalNote: getString(formData, "approvalNote"),
  });
}
