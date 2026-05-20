import { LoadingState } from "@/components/ui/loading-state";

export default function ParentPaymentsLoading() {
  return <LoadingState title="正在加载支付状态" description="正在读取绑定学生的订单支付记录。" />;
}
