import { LoadingState } from "@/components/ui/loading-state";

export default function CourseAccountLoading() {
  return <LoadingState title="正在加载课时账户" description="请稍候，正在读取学生课时余额。" />;
}
