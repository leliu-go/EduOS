import { BookOpen, CalendarDays, UserCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateCourseAccountBalance } from "@/features/course-accounts/balance";

export type CourseConsumptionLedgerCardItem = {
  id: string;
  consumedHours: number;
  createdAt: Date;
  student: {
    name: string;
  };
  courseProduct: {
    name: string;
    subject: {
      name: string;
    };
    grade: {
      name: string;
    };
  };
  courseAccount: {
    purchasedHours: number;
    giftHours: number;
    usedHours: number;
    frozenHours: number;
  };
  schedule: {
    startAt: Date;
    endAt: Date;
    classGroup: {
      name: string;
    };
  };
};

function formatDateTime(value: Date) {
  return value.toISOString().slice(0, 16).replace("T", " ");
}

function CourseConsumptionLedgerCard({
  item,
  showStudent = false,
}: {
  item: CourseConsumptionLedgerCardItem;
  showStudent?: boolean;
}) {
  const balance = calculateCourseAccountBalance(item.courseAccount);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{item.courseProduct.name}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.courseProduct.subject.name} · {item.courseProduct.grade.name}
            </p>
          </div>
          <Badge variant="secondary">扣 {item.consumedHours} 课时</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        {showStudent ? (
          <p className="flex items-center gap-2">
            <UserCircle className="size-4" aria-hidden="true" />
            {item.student.name}
          </p>
        ) : null}
        <p className="flex items-center gap-2">
          <BookOpen className="size-4" aria-hidden="true" />
          {item.schedule.classGroup.name}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden="true" />
          {formatDateTime(item.schedule.startAt)} - {formatDateTime(item.schedule.endAt)}
        </p>
        <p className={balance.isNegative ? "text-destructive" : undefined}>
          当前剩余 {balance.remainingHours} / 总 {balance.totalHours} 课时
        </p>
      </CardContent>
    </Card>
  );
}

export { CourseConsumptionLedgerCard };
