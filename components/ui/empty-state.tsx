import { Inbox } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = React.ComponentProps<"div"> & {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <Inbox className="size-9 text-muted-foreground" aria-hidden="true" />
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
