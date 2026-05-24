import { LoadingState } from "@/components/ui/loading-state";

export default function AcademicConfigLoading() {
  return <LoadingState title="正在加载教务规则" description="请稍候，正在读取当前机构配置。" />;
}
