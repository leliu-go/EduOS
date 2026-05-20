import Link from "next/link";
import { Bell, Building2, Search, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function AppTopbar() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <form action="/dashboard/search" role="search" className="relative max-w-md flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label="全局搜索"
          className="pr-10 pl-9"
          name="q"
          placeholder="搜索学生、教师、班级、课程"
          type="search"
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="sr-only">搜索</span>
        </Button>
      </form>
      <Button
        variant="outline"
        className="hidden gap-2 sm:inline-flex"
        aria-label="当前校区：全部校区"
      >
        <Building2 className="size-4" aria-hidden="true" />
        全部校区
      </Button>
      <Button asChild variant="ghost" size="icon">
        <Link href="/dashboard/notifications" aria-label="通知">
          <Bell className="size-4" aria-hidden="true" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" aria-label="当前用户">
        <UserCircle className="size-5" aria-hidden="true" />
      </Button>
    </header>
  );
}

export { AppTopbar };
