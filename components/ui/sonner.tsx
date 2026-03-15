"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "bg-background text-foreground border border-border shadow-lg rounded-lg",
          title: "text-sm font-medium",
          description: "text-sm text-muted-foreground",
          error: "border-destructive",
          success: "border-primary",
        },
      }}
    />
  );
}
