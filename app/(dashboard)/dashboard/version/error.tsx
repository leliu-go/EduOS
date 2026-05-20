"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardVersionError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="版本信息加载失败"
      description="请重试，或稍后再查看版本与更新状态。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
