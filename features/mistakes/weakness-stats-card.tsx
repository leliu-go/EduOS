import { Card, CardContent } from "@/components/ui/card";

import type { KnowledgePointWeaknessStat } from "./weakness-stats";

type KnowledgePointWeaknessStatsProps = {
  title: string;
  stats: KnowledgePointWeaknessStat[];
};

export function KnowledgePointWeaknessStats({ title, stats }: KnowledgePointWeaknessStatsProps) {
  const total = stats.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-normal text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">共 {total} 题</span>
      </div>
      <Card className="shadow-none">
        <CardContent className="grid gap-3 p-4">
          {stats.length > 0 ? (
            stats.map((stat, index) => (
              <div key={stat.knowledgePointId} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-secondary-foreground">
                    {index + 1}
                  </span>
                  <p className="line-clamp-2 text-sm font-medium text-foreground">{stat.label}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-foreground">
                  {stat.count} 次
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">暂无薄弱点</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
