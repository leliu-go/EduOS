import { LoadingState } from "@/components/ui/loading-state";

export default function FinanceReportsLoading() {
  return <LoadingState title="正在加载财务报表" description="正在汇总支付、退款和课消数据。" />;
}
