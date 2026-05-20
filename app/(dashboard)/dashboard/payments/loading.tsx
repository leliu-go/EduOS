import { LoadingState } from "@/components/ui/loading-state";

export default function DashboardPaymentsLoading() {
  return <LoadingState title="正在加载支付流水" description="正在读取订单收款和支付状态。" />;
}
