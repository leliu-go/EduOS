"use client";

import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

export default function LearningTasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="学习任务加载失败"
      description={error.message}
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
