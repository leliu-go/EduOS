"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function CampusDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="校区详情加载失败"
      description="请重试，或稍后再查看校区详情。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
