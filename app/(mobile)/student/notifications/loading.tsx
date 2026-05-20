import { LoadingState } from "@/components/ui/loading-state";

export default function StudentNotificationsLoading() {
  return <LoadingState title="正在加载通知" description="正在读取学生端通知。" />;
}
