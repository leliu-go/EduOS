"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function DashboardPaymentsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="支付流水加载失败"
      description="请重试，或稍后再查看支付记录。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
