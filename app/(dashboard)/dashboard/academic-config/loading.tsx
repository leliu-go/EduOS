import { LoadingState } from "@/components/ui/loading-state";

export default function AcademicConfigLoading() {
  return <LoadingState title="正在加载基础配置" description="请稍候，正在读取当前机构配置。" />;
}
