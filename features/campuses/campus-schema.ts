import { z } from "zod";

export const campusStatusValues = ["ACTIVE", "INACTIVE"] as const;
export const roomStatusValues = ["ACTIVE", "INACTIVE", "MAINTENANCE"] as const;

export const campusStatusLabels = {
  ACTIVE: "启用",
  INACTIVE: "停用",
} as const satisfies Record<(typeof campusStatusValues)[number], string>;

export const roomStatusLabels = {
  ACTIVE: "可用",
  INACTIVE: "停用",
  MAINTENANCE: "维护",
} as const satisfies Record<(typeof roomStatusValues)[number], string>;

function optionalText(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength).optional(),
  );
}

const capacitySchema = z
  .preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.coerce.number().int().min(1).max(999).optional(),
  )
  .optional();

export const campusFormSchema = z.object({
  name: z.string().trim().min(1).max(80),
  address: optionalText(200),
  businessHours: optionalText(200),
  status: z.enum(campusStatusValues),
});

export const roomFormSchema = z.object({
  campusId: z.string().cuid(),
  name: z.string().trim().min(1).max(80),
  capacity: capacitySchema,
  equipment: optionalText(300),
  status: z.enum(roomStatusValues),
});

export const campusIdSchema = z.string().cuid();
export const roomIdSchema = z.string().cuid();

export type CampusFormValues = z.infer<typeof campusFormSchema>;
export type RoomFormValues = z.infer<typeof roomFormSchema>;
export type CampusStatusValue = (typeof campusStatusValues)[number];
export type RoomStatusValue = (typeof roomStatusValues)[number];

export function getCampusFormValues(formData: FormData) {
  return campusFormSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    businessHours: formData.get("businessHours"),
    status: formData.get("status"),
  });
}

export function getRoomFormValues(formData: FormData) {
  return roomFormSchema.safeParse({
    campusId: formData.get("campusId"),
    name: formData.get("name"),
    capacity: formData.get("capacity"),
    equipment: formData.get("equipment"),
    status: formData.get("status"),
  });
}
