import { Bell, Circle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

import type { getUserNotifications } from "./queries";

type NotificationItem = Awaited<ReturnType<typeof getUserNotifications>>[number];

type NotificationListProps = {
  notifications: NotificationItem[];
};

const notificationEventLabels = {
  SCHEDULE_CREATED: "新排课",
  SCHEDULE_CHANGED: "课表变更",
  ATTENDANCE_CONFIRMED: "考勤确认",
  COURSE_CONSUMPTION_CREATED: "课消完成",
  HOMEWORK_ASSIGNED: "作业发布",
  HOMEWORK_CORRECTED: "作业批改",
  REPORT_AVAILABLE: "报告可查看",
} as const;

const notificationStatusLabels = {
  UNREAD: "未读",
  READ: "已读",
  ARCHIVED: "已归档",
} as const;

function formatNotificationTime(value: Date) {
  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

export function NotificationList({ notifications }: NotificationListProps) {
  if (notifications.length === 0) {
    return <EmptyState title="暂无通知" description="有新的教学或运营事件时，会在这里显示。" />;
  }

  return (
    <section className="grid gap-3">
      {notifications.map((notification) => (
        <Card key={notification.id} className="shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {notification.status === "UNREAD" ? (
                    <Circle className="size-2 fill-primary text-primary" aria-hidden="true" />
                  ) : (
                    <Bell className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  <CardTitle className="line-clamp-1 text-base">{notification.title}</CardTitle>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {notificationEventLabels[notification.eventType]} ·{" "}
                  {formatNotificationTime(notification.createdAt)}
                </p>
              </div>
              <Badge variant={notification.status === "UNREAD" ? "default" : "secondary"}>
                {notificationStatusLabels[notification.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <p>{notification.body}</p>
            {notification.href ? (
              <a className="font-medium text-primary" href={notification.href}>
                查看详情
              </a>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
