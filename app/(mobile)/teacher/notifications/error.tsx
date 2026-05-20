"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function TeacherNotificationsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="通知加载失败"
      description="请重试，或稍后再查看教师端通知。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
