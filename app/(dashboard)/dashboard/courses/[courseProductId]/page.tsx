import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseProductArchiveForm } from "@/features/courses/course-product-archive-form";
import { CourseProductEditDialog } from "@/features/courses/course-product-form-dialog";
import {
  classTypeLabels,
  courseProductStatusLabels,
  courseTypeLabels,
} from "@/features/courses/course-product-schema";
import { getCourseProductById, getCourseProductFormOptions } from "@/features/courses/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type CourseProductDetailPageProps = {
  params: Promise<{
    courseProductId: string;
  }>;
};

type CourseProductDetail = NonNullable<Awaited<ReturnType<typeof getCourseProductById>>>;

function formatPrice(price: { toString(): string }) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  }).format(Number(price.toString()));
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border px-3 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function getCourseProductDetailItems(courseProduct: CourseProductDetail) {
  return [
    {
      label: "科目",
      value: courseProduct.subject.name,
    },
    {
      label: "年级",
      value: courseProduct.grade.name,
    },
    {
      label: "课程类型",
      value: courseTypeLabels[courseProduct.courseType],
    },
    {
      label: "授课方式",
      value: classTypeLabels[courseProduct.classType],
    },
    {
      label: "总课时",
      value: `${courseProduct.totalHours} 课时`,
    },
    {
      label: "价格",
      value: formatPrice(courseProduct.price),
    },
  ];
}

export default async function CourseProductDetailPage({ params }: CourseProductDetailPageProps) {
  const currentUser = await requirePermission("courses:manage", {
    nextPath: "/dashboard/courses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const { courseProductId } = await params;
  const [courseProduct, options] = await Promise.all([
    getCourseProductById(currentUser.tenantId, courseProductId),
    getCourseProductFormOptions(currentUser.tenantId),
  ]);

  if (!courseProduct) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              {courseProduct.name}
            </h1>
            <Badge variant="secondary">{courseProductStatusLabels[courseProduct.status]}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            课程产品仅供员工管理招生、排班和后续课时账户使用，不向未报名学生开放。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CourseProductEditDialog options={options} courseProduct={courseProduct} />
          {courseProduct.status !== "ARCHIVED" ? (
            <CourseProductArchiveForm courseProductId={courseProduct.id} />
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>课程信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 md:grid-cols-3">
            {getCourseProductDetailItems(courseProduct).map((item) => (
              <DetailItem key={item.label} label={item.label} value={item.value} />
            ))}
          </dl>
          <div className="mt-4 rounded-md border px-3 py-3">
            <h2 className="text-xs text-muted-foreground">课程说明</h2>
            <p className="mt-1 text-sm text-foreground">{courseProduct.description ?? "未填写"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
