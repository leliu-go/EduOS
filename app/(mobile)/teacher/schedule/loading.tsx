import { LoadingState } from "@/components/ui/loading-state";

export default function TeacherScheduleLoading() {
  return <LoadingState title="正在加载课表" description="正在读取你的授课安排。" />;
}
