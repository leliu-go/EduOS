import type * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MobileStatusTone = "neutral" | "info" | "success" | "warning" | "danger";

const toneClassName: Record<MobileStatusTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
};

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: MobileStatusTone;
  className?: string;
};

function StatusBadge({ children, tone = "neutral", className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(toneClassName[tone], className)}>
      {children}
    </Badge>
  );
}

export { StatusBadge };
