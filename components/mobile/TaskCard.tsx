import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { StatusBadge } from "./StatusBadge";

type TaskCardProps = {
  title: string;
  description: string;
  href?: string;
  icon?: LucideIcon;
  status?: string;
  statusTone?: "neutral" | "info" | "success" | "warning" | "danger";
  meta?: string;
  className?: string;
};

function TaskCard({
  title,
  description,
  href,
  icon: Icon,
  status,
  statusTone,
  meta,
  className,
}: TaskCardProps) {
  const content = (
    <Card className={cn("h-full transition-colors hover:border-primary/40", className)}>
      <CardContent className="flex items-start gap-3 p-4">
        {Icon ? (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-3">
            <span className="truncate text-sm font-semibold text-foreground">{title}</span>
            {status ? <StatusBadge tone={statusTone}>{status}</StatusBadge> : null}
          </span>
          <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
          {meta ? <span className="mt-2 block text-xs text-muted-foreground">{meta}</span> : null}
        </span>
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}

export { TaskCard };
