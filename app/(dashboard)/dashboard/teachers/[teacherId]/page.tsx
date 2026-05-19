import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/rbac/require-permission";
import { getTeacherById } from "@/features/teachers/queries";
import { formatTeacherList, teacherStatusLabels } from "@/features/teachers/teacher-schema";
import { TeacherEditDialog } from "@/features/teachers/teacher-form-dialog";

type TeacherDetailPageProps = {
  params: Promise<{
    teacherId: string;
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

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const currentUser = await requirePermission("teachers:manage", {
    nextPath: "/dashboard/teachers",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const { teacherId } = await params;
  const teacher = await getTeacherById(currentUser.tenantId, teacherId);

  if (!teacher) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              {teacher.name}
            </h1>
            <Badge variant="secondary">{teacherStatusLabels[teacher.status]}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">教师档案仅对授权员工可见。</p>
        </div>
        <TeacherEditDialog teacher={teacher} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="姓名" value={teacher.name} />
            <DetailItem label="手机号" value={teacher.phone} />
            <DetailItem label="邮箱" value={teacher.email ?? "未填写"} />
            <DetailItem label="科目" value={formatTeacherList(teacher.subjects)} />
            <DetailItem label="年级" value={formatTeacherList(teacher.grades)} />
            <DetailItem label="状态" value={teacherStatusLabels[teacher.status]} />
            <DetailItem label="可授课时间" value={teacher.availableTimeNotes ?? "未填写"} />
            <DetailItem label="资质文件" value={teacher.qualificationFileName ?? "未上传"} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>内部备注</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {teacher.notes || "暂无备注"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
