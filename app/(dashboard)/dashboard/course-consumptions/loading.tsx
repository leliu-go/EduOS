import { LoadingState } from "@/components/ui/loading-state";

export default function CourseConsumptionLedgerLoading() {
  return <LoadingState title="正在加载课消流水" description="请稍候，正在读取扣课历史。" />;
}
