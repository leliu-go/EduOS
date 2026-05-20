import { LoadingState } from "@/components/ui/loading-state";

export default function RenewalWarningLoading() {
  return <LoadingState title="正在加载续费预警" description="正在分析课时、到课和作业表现。" />;
}
