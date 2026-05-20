import { LoadingState } from "@/components/ui/loading-state";

export default function StudentReportsLoading() {
  return <LoadingState title="正在加载学习报告" description="正在汇总出勤、作业和错题数据。" />;
}
