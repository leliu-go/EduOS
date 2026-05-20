import { LoadingState } from "@/components/ui/loading-state";

export default function ParentProfileLoading() {
  return <LoadingState title="正在加载我的信息" description="正在读取账号和绑定孩子信息。" />;
}
