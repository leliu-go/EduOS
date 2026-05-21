"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardSecuritySettingsError({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      title="安全中心加载失败"
      description="请重试，或稍后再查看 MFA 与审计日志状态。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
