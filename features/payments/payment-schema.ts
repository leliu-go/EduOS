import { z } from "zod";

export const manualPaymentMethodValues = [
  "CASH",
  "BANK_TRANSFER",
  "WECHAT",
  "ALIPAY",
  "CARD",
  "OTHER",
] as const;

export const manualPaymentStatusValues = ["PENDING", "CONFIRMED"] as const;

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );
}

export const manualPaymentFormSchema = z.object({
  orderId: z.string().cuid(),
  amount: z.coerce.number().positive().max(99999999),
  method: z.enum(manualPaymentMethodValues),
  status: z.enum(manualPaymentStatusValues),
  paidAt: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    dateStringSchema.transform((value) => new Date(`${value}T00:00:00.000Z`)).optional(),
  ),
  transactionNo: optionalText(120),
  notes: optionalText(500),
});

export type ManualPaymentFormValues = z.infer<typeof manualPaymentFormSchema>;

export function getManualPaymentFormValues(formData: FormData) {
  return manualPaymentFormSchema.safeParse({
    orderId: formData.get("orderId"),
    amount: formData.get("amount"),
    method: formData.get("method"),
    status: formData.get("status"),
    paidAt: formData.get("paidAt"),
    transactionNo: formData.get("transactionNo"),
    notes: formData.get("notes"),
  });
}
