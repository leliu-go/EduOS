"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="机构看板加载失败"
      description="请重试，或稍后再查看运营数据。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
