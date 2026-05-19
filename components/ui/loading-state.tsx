import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type LoadingStateProps = React.ComponentProps<"div"> & {
  title?: string;
  description?: string;
};

function LoadingState({ title = "加载中", description, className, ...props }: LoadingStateProps) {
  return (
    <div
      data-slot="loading-state"
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-32 flex-col items-center justify-center rounded-lg border bg-card px-6 py-8 text-center",
        className,
      )}
      {...props}
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      <p className="mt-4 text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export { LoadingState };
