import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

/**
 * EmptyState Component.
 * Reusable layout block displayed inside empty widgets or columns.
 */
export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "📭",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="text-3xl mb-3" role="img" aria-label="empty state icon">
        {icon}
      </span>
      <h3 className="font-sans text-sm font-semibold text-foreground">{title}</h3>
      <p className="font-sans text-xs text-muted-foreground mt-1 max-w-[200px]">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 rounded bg-muted hover:bg-muted/80 border border-card-border px-3 py-1.5 font-sans text-xs font-semibold text-foreground transition cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
