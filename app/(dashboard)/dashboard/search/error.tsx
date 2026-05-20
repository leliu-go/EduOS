"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardSearchError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="搜索失败"
      description="请重试，或稍后再进行全局搜索。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
