import { NotificationList } from "@/features/notifications/notification-list";
import { getUserNotifications } from "@/features/notifications/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function DashboardNotificationsPage() {
  const currentUser = await requirePermission("route:dashboard", {
    nextPath: "/dashboard/notifications",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const notifications = await getUserNotifications(
    currentUser.tenantId,
    currentUser.id,
    currentUser.roleKey,
  );

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">通知中心</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          查看与当前账号角色相关的教学、作业、课消和报告通知。
        </p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
