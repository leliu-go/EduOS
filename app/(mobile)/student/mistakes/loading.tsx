import { LoadingState } from "@/components/ui/loading-state";

export default function StudentMistakesLoading() {
  return <LoadingState title="正在加载错题" description="请稍候，正在读取你的错题记录。" />;
}
