import { LoadingState } from "@/components/ui/loading-state";

export default function SchedulingCalendarLoading() {
  return <LoadingState title="正在加载排课日历" description="请稍候，正在读取排课和筛选条件。" />;
}
