import { LoadingState } from "@/components/ui/loading-state";

export default function StudentPaymentsLoading() {
  return <LoadingState title="正在加载支付状态" description="正在读取你的课程订单支付记录。" />;
}
