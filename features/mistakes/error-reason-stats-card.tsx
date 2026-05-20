import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ErrorReasonStat } from "./error-reason-stats";

type ErrorReasonStatsProps = {
  title: string;
  stats: ErrorReasonStat[];
};

export function ErrorReasonStats({ title, stats }: ErrorReasonStatsProps) {
  const total = stats.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-normal text-foreground">{title}</h2>
        <span className="text-sm text-muted-foreground">共 {total} 题</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <Card key={stat.reason} className="rounded-lg shadow-none">
            <CardHeader className="px-4 pt-4">
              <CardTitle className="text-sm leading-5">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <p className="text-2xl font-semibold leading-none text-foreground">{stat.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
