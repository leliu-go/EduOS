import { LoadingState } from "@/components/ui/loading-state";

export default function ParentHomeLoading() {
  return <LoadingState title="正在加载家长首页" description="请稍候，正在读取孩子的学习动态。" />;
}
