"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function ParentReportsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="学习报告加载失败"
      description="请重试，或稍后再访问。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
