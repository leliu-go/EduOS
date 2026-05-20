import { LoadingState } from "@/components/ui/loading-state";

export default function DashboardNotificationsLoading() {
  return <LoadingState title="正在加载通知中心" description="正在读取当前账号的通知。" />;
}
