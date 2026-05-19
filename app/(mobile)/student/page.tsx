import { BookOpen, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { calculateCourseAccountBalance } from "@/features/course-accounts/balance";
import { getStudentEnrolledCourses } from "@/features/enrollments/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type StudentEnrollment = Awaited<ReturnType<typeof getStudentEnrolledCourses>>[number];

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function StudentEnrollmentCard({ enrollment }: { enrollment: StudentEnrollment }) {
  const balance = calculateCourseAccountBalance(enrollment.courseAccount);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{enrollment.courseProduct.name}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {enrollment.courseProduct.subject.name} · {enrollment.courseProduct.grade.name}
            </p>
          </div>
          <Badge variant="secondary">剩余 {balance.remainingHours} 课时</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <BookOpen className="size-4" aria-hidden="true" />
          {enrollment.classGroup?.name ?? "暂未分班"}
        </p>
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4" aria-hidden="true" />
          报名日期：{formatDate(enrollment.enrolledAt)}
        </p>
      </CardContent>
    </Card>
  );
}

export default async function StudentHomePage() {
  const currentUser = await requirePermission("route:student", {
    nextPath: "/student",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const enrolledCourses = await getStudentEnrolledCourses(currentUser.tenantId, currentUser.id);

  if (enrolledCourses.length === 0) {
    return <EmptyState title="暂无已报名课程" description="报名完成后，可在这里查看自己的课程。" />;
  }

  return (
    <div className="grid gap-4">
      {enrolledCourses.map((enrollment) => (
        <StudentEnrollmentCard key={enrollment.id} enrollment={enrollment} />
      ))}
    </div>
  );
}
