import { LoadingState } from "@/components/ui/loading-state";

export default function CampusManagementLoading() {
  return <LoadingState title="正在加载校区和教室" description="请稍候，正在读取当前机构数据。" />;
}
