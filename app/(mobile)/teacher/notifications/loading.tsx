import { LoadingState } from "@/components/ui/loading-state";

export default function TeacherNotificationsLoading() {
  return <LoadingState title="正在加载通知" description="正在读取教师端通知。" />;
}
