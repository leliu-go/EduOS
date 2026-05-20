import { LoadingState } from "@/components/ui/loading-state";

export default function DashboardLoading() {
  return <LoadingState title="正在加载机构看板" description="正在汇总招生、课消和教学数据。" />;
}
