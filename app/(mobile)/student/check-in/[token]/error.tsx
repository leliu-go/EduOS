"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function StudentCheckInError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="签到页面加载失败"
      description="请重试，或联系老师确认签到入口。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
