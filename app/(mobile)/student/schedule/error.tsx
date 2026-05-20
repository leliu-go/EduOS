"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function StudentScheduleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="课表加载失败"
      description="请重试，或稍后再查看课表。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
