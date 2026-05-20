import { LoadingState } from "@/components/ui/loading-state";

export default function TeacherHomeLoading() {
  return <LoadingState title="正在加载教师看板" description="正在汇总今日课次和待处理事项。" />;
}
