"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function StudentPaymentsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="支付状态加载失败"
      description="请重试，或稍后再查看你的支付记录。"
      action={<Button onClick={reset}>重试</Button>}
    />
  );
}
