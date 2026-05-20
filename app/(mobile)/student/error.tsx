"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function StudentHomeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="学生首页加载失败"
      description="请重试，或稍后再查看今日学习安排。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
