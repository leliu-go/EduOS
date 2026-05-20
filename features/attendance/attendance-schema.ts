import { z } from "zod";

export const attendanceStatusValues = ["PRESENT", "LATE", "EXCUSED", "ABSENT", "MAKE_UP"] as const;

export const attendanceStatusLabels = {
  PRESENT: "已到",
  LATE: "迟到",
  EXCUSED: "请假",
  ABSENT: "缺勤",
  MAKE_UP: "补课",
} as const satisfies Record<(typeof attendanceStatusValues)[number], string>;

function optionalText(maxLength: number) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    return value.trim() === "" ? undefined : value;
  }, z.string().trim().max(maxLength).optional());
}

export const attendanceRecordEntrySchema = z.object({
  studentId: z.string().cuid(),
  status: z.enum(attendanceStatusValues),
  notes: optionalText(300),
});

export const attendanceRecordFormSchema = z.object({
  scheduleId: z.string().cuid(),
  entries: z.array(attendanceRecordEntrySchema).min(1),
});

export const studentCheckInFormSchema = z.object({
  scheduleId: z.string().cuid(),
});

export const checkInConfirmFormSchema = z.object({
  checkInId: z.string().cuid(),
});

export const qrCheckInFormSchema = z.object({
  token: z.string().trim().min(32).max(1200),
});

export function getAttendanceRecordFormValues(formData: FormData) {
  const studentIds = formData
    .getAll("studentId")
    .filter((value): value is string => typeof value === "string");

  return attendanceRecordFormSchema.safeParse({
    scheduleId: formData.get("scheduleId"),
    entries: studentIds.map((studentId) => ({
      studentId,
      status: formData.get(`status:${studentId}`),
      notes: formData.get(`notes:${studentId}`),
    })),
  });
}

export function getStudentCheckInFormValues(formData: FormData) {
  return studentCheckInFormSchema.safeParse({
    scheduleId: formData.get("scheduleId"),
  });
}

export function getCheckInConfirmFormValues(formData: FormData) {
  return checkInConfirmFormSchema.safeParse({
    checkInId: formData.get("checkInId"),
  });
}

export function getQrCheckInFormValues(formData: FormData) {
  return qrCheckInFormSchema.safeParse({
    token: formData.get("token"),
  });
}

export type AttendanceStatusValue = (typeof attendanceStatusValues)[number];
export type AttendanceRecordFormValues = z.infer<typeof attendanceRecordFormSchema>;
export type StudentCheckInFormValues = z.infer<typeof studentCheckInFormSchema>;
export type CheckInConfirmFormValues = z.infer<typeof checkInConfirmFormSchema>;
export type QrCheckInFormValues = z.infer<typeof qrCheckInFormSchema>;
