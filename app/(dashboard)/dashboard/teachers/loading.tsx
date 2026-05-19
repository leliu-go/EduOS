import { LoadingState } from "@/components/ui/loading-state";

export default function TeacherManagementLoading() {
  return <LoadingState title="正在加载教师档案" description="请稍候，正在读取当前机构数据。" />;
}
