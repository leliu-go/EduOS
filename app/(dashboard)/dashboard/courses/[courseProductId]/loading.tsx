import { LoadingState } from "@/components/ui/loading-state";

export default function CourseProductDetailLoading() {
  return <LoadingState title="正在加载课程详情" description="正在读取课程、班级和报名信息。" />;
}
