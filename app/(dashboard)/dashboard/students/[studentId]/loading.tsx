import { LoadingState } from "@/components/ui/loading-state";

export default function StudentDetailLoading() {
  return (
    <LoadingState title="正在加载学生详情" description="正在读取学生档案、监护人和报名信息。" />
  );
}
