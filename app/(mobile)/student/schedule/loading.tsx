import { LoadingState } from "@/components/ui/loading-state";

export default function StudentScheduleLoading() {
  return <LoadingState title="正在加载课表" description="正在读取你的上课安排。" />;
}
