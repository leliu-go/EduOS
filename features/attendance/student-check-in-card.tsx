import { CalendarCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createStudentCheckInAction } from "@/features/attendance/actions";
import type { getStudentCheckInSchedules } from "@/features/attendance/queries";

type StudentCheckInSchedule = Awaited<ReturnType<typeof getStudentCheckInSchedules>>[number];

type StudentCheckInCardProps = {
  schedule: StudentCheckInSchedule;
};

function formatTime(value: Date) {
  return value.toISOString().slice(11, 16);
}

export function StudentCheckInCard({ schedule }: StudentCheckInCardProps) {
  const checkIn = schedule.checkIns[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{schedule.lesson?.title ?? schedule.classGroup.name}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatTime(schedule.startAt)}-{formatTime(schedule.endAt)}
            </p>
          </div>
          <Badge variant="secondary">{checkIn ? "已签到" : "待签到"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-muted-foreground">
        <p>{schedule.classGroup.courseProduct.name}</p>
        <p>{schedule.campus.name}</p>
        {checkIn ? (
          <p>签到时间：{checkIn.checkedInAt.toISOString().slice(11, 16)}</p>
        ) : (
          <form action={createStudentCheckInAction}>
            <input type="hidden" name="scheduleId" value={schedule.id} />
            <Button type="submit" className="w-full">
              <CalendarCheck aria-hidden="true" />
              签到
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
