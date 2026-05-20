import { LoadingState } from "@/components/ui/loading-state";

export default function StudentCheckInLoading() {
  return <LoadingState title="正在加载签到" description="正在校验签到入口和课程信息。" />;
}
