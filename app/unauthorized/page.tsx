import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="grid w-full max-w-md justify-items-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border bg-muted text-muted-foreground">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold tracking-normal">无权访问</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            当前账号没有访问该页面的权限，请联系机构管理员调整角色或返回首页。
          </p>
        </div>
        <Button asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </section>
    </main>
  );
}
