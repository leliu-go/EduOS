import { LoadingState } from "@/components/ui/loading-state";

export default function StudentResourceDetailLoading() {
  return <LoadingState title="正在加载资源详情" description="正在读取学习资源内容。" />;
}
