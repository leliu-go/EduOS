"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function TeacherHomeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="教师看板加载失败"
      description="请重试，或稍后再查看今日教学安排。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
