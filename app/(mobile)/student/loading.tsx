import { LoadingState } from "@/components/ui/loading-state";

export default function StudentHomeLoading() {
  return <LoadingState title="正在加载学生首页" description="正在读取今日课程、作业和学习提醒。" />;
}
