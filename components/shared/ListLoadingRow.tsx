import { InlineSpinner } from "@/components/shared/InlineSpinner";
import { cn } from "@/lib/utils";

export function ListLoadingRow({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn(
        "flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground",
        className
      )}
    >
      <InlineSpinner className="size-3.5" />
      <span>{label}</span>
    </div>
  );
}
