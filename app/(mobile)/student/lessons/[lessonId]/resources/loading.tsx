import { LoadingState } from "@/components/ui/loading-state";

export default function StudentLessonResourcesLoading() {
  return <LoadingState title="正在加载课次资源" description="请稍候，正在读取已开放资源。" />;
}
