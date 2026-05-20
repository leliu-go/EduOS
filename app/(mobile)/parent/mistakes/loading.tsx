import { LoadingState } from "@/components/ui/loading-state";

export default function ParentMistakesLoading() {
  return <LoadingState title="正在加载错题" description="请稍候，正在读取孩子的错题记录。" />;
}
