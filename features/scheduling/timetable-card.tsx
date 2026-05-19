import { CalendarDays, MapPin, School, UserCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scheduleStatusLabels, scheduleStatusValues } from "@/features/scheduling/schedule-schema";

type TimetableCardProps = {
  title: string;
  courseName: string;
  startAt: Date;
  endAt: Date;
  status: (typeof scheduleStatusValues)[number];
  campusName: string;
  classGroupName: string;
  teacherName?: string;
  roomName?: string;
  studentNames?: string;
};

function formatDateTime(startAt: Date, endAt: Date) {
  return `${startAt.toISOString().slice(0, 10)} ${startAt.toISOString().slice(11, 16)}-${endAt
    .toISOString()
    .slice(11, 16)}`;
}

export function TimetableCard({
  title,
  courseName,
  startAt,
  endAt,
  status,
  campusName,
  classGroupName,
  teacherName,
  roomName,
  studentNames,
}: TimetableCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{courseName}</p>
          </div>
          <Badge variant="secondary">{scheduleStatusLabels[status]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden="true" />
          {formatDateTime(startAt, endAt)}
        </p>
        <p className="flex items-center gap-2">
          <School className="size-4" aria-hidden="true" />
          {classGroupName}
        </p>
        {teacherName ? (
          <p className="flex items-center gap-2">
            <UserCircle className="size-4" aria-hidden="true" />
            {teacherName}
          </p>
        ) : null}
        <p className="flex items-center gap-2">
          <MapPin className="size-4" aria-hidden="true" />
          {roomName ? `${campusName}/${roomName}` : campusName}
        </p>
        {studentNames ? (
          <p className="flex items-center gap-2">
            <UserCircle className="size-4" aria-hidden="true" />
            {studentNames}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
