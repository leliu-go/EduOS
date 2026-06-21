import Link from "next/link";
import { Building2, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CampusDeleteForm } from "@/features/campuses/campus-delete-form";
import { requirePermission } from "@/lib/rbac/require-permission";
import { CampusCreateDialog } from "@/features/campuses/campus-form-dialog";
import { getCampusList } from "@/features/campuses/queries";
import { campusStatusLabels } from "@/features/campuses/campus-schema";

type CampusListPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages = {
  invalid_input: "提交内容不完整，请检查后重试。",
  invalid_room: "教室信息不完整，请检查后重试。",
  not_found: "未找到对应校区或教室。",
} as const;

export default async function CampusListPage({ searchParams }: CampusListPageProps) {
  const currentUser = await requirePermission("campus:manage", {
    nextPath: "/dashboard/campuses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const campuses = await getCampusList(currentUser.tenantId);
  const errorMessage =
    typeof params.error === "string"
      ? errorMessages[params.error as keyof typeof errorMessages]
      : null;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">校区和教室</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            管理校区地址、营业时间和教室容量，为后续排课提供基础数据。
          </p>
        </div>
        <CampusCreateDialog />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      {campuses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campuses.map((campus) => (
            <Card key={campus.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                      <Building2 className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle>{campus.name}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {campus._count.rooms} 间教室
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{campusStatusLabels[campus.status]}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p className="flex gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>{campus.address ?? "地址未填写"}</span>
                  </p>
                  <p>营业时间：{campus.businessHours ?? "未填写"}</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/dashboard/campuses/${campus.id}`}>管理教室</Link>
                  </Button>
                  <CampusDeleteForm campusId={campus.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="暂无校区"
          description="创建校区后，可继续维护教室容量和设备信息。"
          action={<CampusCreateDialog />}
        />
      )}
    </div>
  );
}
