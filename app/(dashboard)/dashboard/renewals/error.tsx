"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function RenewalWarningError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="续费预警加载失败"
      description="请重试，或稍后再查看续费跟进名单。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
