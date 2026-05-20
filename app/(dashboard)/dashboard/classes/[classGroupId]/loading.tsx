import { LoadingState } from "@/components/ui/loading-state";

export default function ClassGroupDetailLoading() {
  return <LoadingState title="正在加载班级详情" description="正在读取班级、学员和课程信息。" />;
}
