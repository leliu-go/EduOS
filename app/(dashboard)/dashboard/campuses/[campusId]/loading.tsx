import { LoadingState } from "@/components/ui/loading-state";

export default function CampusDetailLoading() {
  return <LoadingState title="正在加载校区详情" description="正在读取校区、教室和班级信息。" />;
}
