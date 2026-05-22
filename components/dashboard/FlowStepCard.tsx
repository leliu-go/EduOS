import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FlowStepTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const toneClassName: Record<FlowStepTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

type FlowStepCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  step?: string;
  badge?: string;
  href?: string;
  tone?: FlowStepTone;
  className?: string;
};

function FlowStepCard({
  title,
  description,
  icon: Icon,
  step,
  badge,
  href,
  tone = "primary",
  className,
}: FlowStepCardProps) {
  const content = (
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-md border bg-card p-4 transition-colors",
        href && "hover:border-primary/35 hover:bg-accent/35",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-md border",
            toneClassName[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {badge ? <Badge variant="outline">{badge}</Badge> : null}
      </div>
      <div className="min-w-0">
        {step ? <p className="text-xs font-medium text-muted-foreground">{step}</p> : null}
        <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
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

export { FlowStepCard };
