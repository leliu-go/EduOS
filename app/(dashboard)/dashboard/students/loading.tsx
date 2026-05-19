import { LoadingState } from "@/components/ui/loading-state";

export default function StudentManagementLoading() {
  return <LoadingState title="正在加载学生档案" description="请稍候，正在读取当前机构数据。" />;
}
