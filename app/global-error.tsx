"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const digestText = error.digest
    ? `错误编号：${error.digest}`
    : "请稍后重试，或返回首页继续使用。";

  return (
    <html lang="zh-CN">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
          <ErrorState
            className="w-full max-w-md"
            title="系统暂时不可用"
            description={`请求处理失败，数据没有继续提交。${digestText}`}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={reset}>重试</Button>
                <Button asChild variant="outline">
                  <Link href="/">返回首页</Link>
                </Button>
              </div>
            }
          />
        </main>
      </body>
    </html>
  );
}
