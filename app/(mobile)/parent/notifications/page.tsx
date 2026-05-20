import { NotificationList } from "@/features/notifications/notification-list";
import { getUserNotifications } from "@/features/notifications/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

export default async function ParentNotificationsPage() {
  const currentUser = await requirePermission("route:parent", {
    nextPath: "/parent/notifications",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const notifications = await getUserNotifications(
    currentUser.tenantId,
    currentUser.id,
    currentUser.roleKey,
  );

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-normal text-foreground">通知中心</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          只显示与你绑定学生相关的课程和报告通知。
        </p>
      </div>
      <NotificationList notifications={notifications} />
    </div>
  );
}
