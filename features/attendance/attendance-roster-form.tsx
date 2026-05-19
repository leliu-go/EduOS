import { ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  attendanceStatusLabels,
  attendanceStatusValues,
} from "@/features/attendance/attendance-schema";
import { recordLessonAttendanceAction } from "@/features/attendance/actions";
import type { getTeacherAttendanceSchedules } from "@/features/attendance/queries";

type AttendanceSchedule = Awaited<ReturnType<typeof getTeacherAttendanceSchedules>>[number];

type AttendanceRosterFormProps = {
  schedule: AttendanceSchedule;
};

export function AttendanceRosterForm({ schedule }: AttendanceRosterFormProps) {
  const attendanceByStudentId = new Map(
    schedule.attendances.map((attendance) => [attendance.studentId, attendance]),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="size-4" aria-hidden="true" />
          课堂点名
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={recordLessonAttendanceAction} className="grid gap-3">
          <input type="hidden" name="scheduleId" value={schedule.id} />
          {schedule.classGroup.students.map((classGroupStudent) => {
            const student = classGroupStudent.student;
            const attendance = attendanceByStudentId.get(student.id);

            return (
              <div key={student.id} className="grid gap-2 rounded-md border p-3">
                <input type="hidden" name="studentId" value={student.id} />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.grade}</p>
                  </div>
                  <select
                    name={`status:${student.id}`}
                    defaultValue={attendance?.status ?? "PRESENT"}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    aria-label={`${student.name} 出勤状态`}
                  >
                    {attendanceStatusValues.map((status) => (
                      <option key={status} value={status}>
                        {attendanceStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  name={`notes:${student.id}`}
                  defaultValue={attendance?.notes ?? ""}
                  placeholder="备注"
                  aria-label={`${student.name} 点名备注`}
                />
              </div>
            );
          })}
          <Button type="submit" className="w-full">
            <ClipboardCheck aria-hidden="true" />
            保存点名
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
