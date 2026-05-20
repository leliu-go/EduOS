import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="grid w-full max-w-md justify-items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border bg-muted text-muted-foreground">
          <SearchX className="size-6" aria-hidden="true" />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold tracking-normal">页面不存在</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            你访问的页面已删除、移动，或当前账号没有可用入口。请返回首页，或重新登录后再试。
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/">返回首页</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">重新登录</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
