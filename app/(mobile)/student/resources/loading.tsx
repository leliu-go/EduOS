import { LoadingState } from "@/components/ui/loading-state";

export default function StudentResourcesLoading() {
  return <LoadingState title="正在加载学习资源" description="请稍候，正在读取已开放资源。" />;
}
