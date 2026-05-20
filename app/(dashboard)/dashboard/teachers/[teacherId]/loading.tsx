import { LoadingState } from "@/components/ui/loading-state";

export default function TeacherDetailLoading() {
  return <LoadingState title="正在加载教师详情" description="正在读取教师档案、班级和课酬信息。" />;
}
