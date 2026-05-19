"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      data-slot="toaster"
      richColors
      closeButton
      position="top-center"
      containerAriaLabel="通知"
      toastOptions={{
        classNames: {
          toast: "border-border bg-background text-foreground",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
