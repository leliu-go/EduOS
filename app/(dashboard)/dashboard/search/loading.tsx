import { LoadingState } from "@/components/ui/loading-state";

export default function DashboardSearchLoading() {
  return <LoadingState title="正在搜索" description="正在根据当前角色权限匹配结果。" />;
}
