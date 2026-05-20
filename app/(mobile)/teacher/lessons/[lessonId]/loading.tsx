import { LoadingState } from "@/components/ui/loading-state";

export default function TeacherLessonResourcesLoading() {
  return <LoadingState title="正在加载课次资源" description="请稍候，正在读取本课次资料。" />;
}
