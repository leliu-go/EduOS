import { LoadingState } from "@/components/ui/loading-state";

export default function ParentScheduleLoading() {
  return <LoadingState title="正在加载课表" description="正在读取孩子的上课安排。" />;
}
