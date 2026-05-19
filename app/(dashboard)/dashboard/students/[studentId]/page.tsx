import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/rbac/require-permission";
import { getStudentById } from "@/features/students/queries";
import {
  formatStudentBirthday,
  studentGenderLabels,
  studentStatusLabels,
} from "@/features/students/student-schema";
import { StudentEditDialog } from "@/features/students/student-form-dialog";

type StudentDetailPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border px-3 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const currentUser = await requirePermission("students:manage", {
    nextPath: "/dashboard/students",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const { studentId } = await params;
  const student = await getStudentById(currentUser.tenantId, studentId);

  if (!student) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              {student.name}
            </h1>
            <Badge variant="secondary">{studentStatusLabels[student.status]}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">学生基础档案仅对授权员工可见。</p>
        </div>
        <StudentEditDialog student={student} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="姓名" value={student.name} />
            <DetailItem
              label="性别"
              value={student.gender ? studentGenderLabels[student.gender] : "未填写"}
            />
            <DetailItem label="生日" value={formatStudentBirthday(student.birthday) || "未填写"} />
            <DetailItem label="年级" value={student.grade} />
            <DetailItem label="学校" value={student.school ?? "未填写"} />
            <DetailItem label="状态" value={studentStatusLabels[student.status]} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>内部备注</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {student.notes || "暂无备注"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
