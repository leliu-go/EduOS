import Link from "next/link";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardGlobalSearch, type GlobalSearchResult } from "@/features/search/global-search";
import { requirePermission } from "@/lib/rbac/require-permission";

type DashboardSearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ResultSectionProps = {
  title: string;
  results: GlobalSearchResult[];
};

function getSearchQuery(params: Record<string, string | string[] | undefined>) {
  return typeof params.q === "string" ? params.q.trim() : "";
}

function ResultSection({ title, results }: ResultSectionProps) {
  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-normal text-foreground">{title}</h2>
        <Badge variant="secondary">{results.length}</Badge>
      </div>
      {results.length > 0 ? (
        <div className="grid gap-2">
          {results.map((result) => (
            <Link key={result.id} href={result.href} className="block">
              <Card className="shadow-none transition-colors hover:bg-accent/40">
                <CardContent className="flex items-start gap-3 p-4">
                  <Search className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">
                      {result.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {result.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
          暂无匹配结果
        </p>
      )}
    </section>
  );
}

export default async function DashboardSearchPage({ searchParams }: DashboardSearchPageProps) {
  const currentUser = await requirePermission("route:dashboard", {
    nextPath: "/dashboard/search",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const params = (await searchParams) ?? {};
  const query = getSearchQuery(params);
  const results = await getDashboardGlobalSearch(currentUser, query);
  const total =
    results.students.length +
    results.teachers.length +
    results.classes.length +
    results.courses.length;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-foreground">全局搜索</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          搜索学生、老师、班级和课程，结果会按当前角色权限展示。
        </p>
      </div>

      {!query ? (
        <EmptyState
          title="输入关键词开始搜索"
          description="可在顶部搜索框输入姓名、班级或课程名称。"
        />
      ) : null}

      {query && total === 0 ? (
        <EmptyState
          title="暂无搜索结果"
          description="请更换关键词，或确认当前账号有对应数据权限。"
        />
      ) : null}

      {query ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <ResultSection title="学生" results={results.students} />
          <ResultSection title="老师" results={results.teachers} />
          <ResultSection title="班级" results={results.classes} />
          <ResultSection title="课程" results={results.courses} />
        </div>
      ) : null}
    </div>
  );
}
