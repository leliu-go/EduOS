import { LoadingState } from "@/components/ui/loading-state";

export default function ParentConsumptionLedgerLoading() {
  return <LoadingState title="正在加载课消记录" description="请稍候，正在读取孩子的扣课历史。" />;
}
