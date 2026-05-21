"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardSettingsError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="系统设置加载失败"
      description="请重试，或稍后再查看产品化设置状态。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
