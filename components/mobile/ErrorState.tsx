import type * as React from "react";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

type MobileErrorStateProps = React.ComponentProps<"div"> & {
  title: string;
  description?: string;
};

function MobileErrorState({ title, description, className, ...props }: MobileErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      <AlertTriangle className="size-9 text-destructive" aria-hidden="true" />
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export { MobileErrorState };
