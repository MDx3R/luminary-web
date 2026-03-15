"use client";

import { useQuery } from "@tanstack/react-query";
import { Bot, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { listAssistants } from "@/lib/api/assistants-api";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

interface AssistantSelectorProps {
  /** Current assistant id (null = none). */
  value: string | null;
  /** Current assistant display name (for trigger label when value is set). */
  valueLabel?: string | null;
  onSelect: (assistantId: string | null) => void;
  /** Label when no assistant is selected (e.g. "Ассистент папки" in chat sidebar). */
  emptyLabel?: string;
  /** Optional: disable while mutation is in progress. */
  disabled?: boolean;
  /** Trigger size / variant. */
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm";
  className?: string;
}

const DEFAULT_EMPTY_LABEL = "Без ассистента";

export function AssistantSelector({
  value,
  valueLabel,
  onSelect,
  emptyLabel = DEFAULT_EMPTY_LABEL,
  disabled = false,
  variant = "ghost",
  size = "sm",
  className,
}: AssistantSelectorProps) {
  const { data: assistants = [], isLoading } = useQuery({
    queryKey: queryKeys.assistants,
    queryFn: listAssistants,
  });

  const label = value && valueLabel ? valueLabel : emptyLabel;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || isLoading}
        aria-label="Выбрать ассистента"
        className={cn(buttonVariants({ variant, size }), className)}
      >
        <Bot className="size-3.5 shrink-0 opacity-70" />
        <span className="truncate max-w-[120px]">{label}</span>
        <ChevronDown className="size-3.5 shrink-0 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="min-w-[200px]"
      >
        <DropdownMenuItem
          onClick={() => onSelect(null)}
          className={value === null ? "bg-accent" : undefined}
        >
          {emptyLabel}
        </DropdownMenuItem>
        {assistants.map((a) => (
          <DropdownMenuItem
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={value === a.id ? "bg-accent" : undefined}
          >
            <span className="truncate">{a.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
