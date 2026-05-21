"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardStorageSettingsError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="存储状态加载失败"
      description="请重试，或检查环境变量配置检查脚本。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
