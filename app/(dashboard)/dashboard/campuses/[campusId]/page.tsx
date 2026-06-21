import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { CampusDeleteForm } from "@/features/campuses/campus-delete-form";
import { requirePermission } from "@/lib/rbac/require-permission";
import { CampusEditDialog } from "@/features/campuses/campus-form-dialog";
import { getCampusById } from "@/features/campuses/queries";
import { campusStatusLabels, roomStatusLabels } from "@/features/campuses/campus-schema";
import { RoomDeleteForm } from "@/features/campuses/room-delete-form";
import { RoomCreateDialog, RoomEditDialog } from "@/features/campuses/room-form-dialog";

type CampusDetailPageProps = {
  params: Promise<{
    campusId: string;
  }>;
};

type CampusDetail = NonNullable<Awaited<ReturnType<typeof getCampusById>>>;
type RoomListItem = CampusDetail["rooms"][number];

function getRoomColumns(): Array<DataTableColumn<RoomListItem>> {
  return [
    {
      key: "name",
      header: "教室",
      cell: (room) => room.name,
    },
    {
      key: "capacity",
      header: "容量",
      cell: (room) => (room.capacity ? `${room.capacity} 人` : "未填写"),
    },
    {
      key: "equipment",
      header: "设备",
      cell: (room) => room.equipment ?? "未填写",
    },
    {
      key: "status",
      header: "状态",
      cell: (room) => <Badge variant="secondary">{roomStatusLabels[room.status]}</Badge>,
    },
    {
      key: "actions",
      header: "操作",
      className: "text-right",
      cell: (room) => (
        <div className="flex justify-end gap-2">
          <RoomEditDialog room={room} />
          <RoomDeleteForm campusId={room.campusId} roomId={room.id} />
        </div>
      ),
    },
  ];
}

export default async function CampusDetailPage({ params }: CampusDetailPageProps) {
  const currentUser = await requirePermission("campus:manage", {
    nextPath: "/dashboard/campuses",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const { campusId } = await params;
  const campus = await getCampusById(currentUser.tenantId, campusId);

  if (!campus) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">
              {campus.name}
            </h1>
            <Badge variant="secondary">{campusStatusLabels[campus.status]}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            教室容量和设备信息仅供内部排课使用，不向学生端展示。
          </p>
        </div>
        <div className="flex gap-2">
          <CampusEditDialog campus={campus} />
          <CampusDeleteForm campusId={campus.id} />
          <RoomCreateDialog campusId={campus.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>校区信息</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border px-3 py-3">
              <dt className="text-xs text-muted-foreground">地址</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {campus.address ?? "未填写"}
              </dd>
            </div>
            <div className="rounded-md border px-3 py-3">
              <dt className="text-xs text-muted-foreground">营业时间</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {campus.businessHours ?? "未填写"}
              </dd>
            </div>
            <div className="rounded-md border px-3 py-3">
              <dt className="text-xs text-muted-foreground">教室数量</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{campus.rooms.length} 间</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {campus.rooms.length > 0 ? (
        <DataTable columns={getRoomColumns()} data={campus.rooms} getRowKey={(room) => room.id} />
      ) : (
        <EmptyState
          title="暂无教室"
          description="新增教室后，后续排课可选择该校区下的可用教室。"
          action={<RoomCreateDialog campusId={campus.id} />}
        />
      )}
    </div>
  );
}
