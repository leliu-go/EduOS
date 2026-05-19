import { LoadingState } from "@/components/ui/loading-state";

export default function AccountCreationLoading() {
  return (
    <LoadingState title="正在加载账号开通目标" description="请稍候，正在读取未开通账号的档案。" />
  );
}
