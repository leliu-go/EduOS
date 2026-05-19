"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function TeacherManagementError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="教师档案加载失败"
      description="请重试，或稍后再访问。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
