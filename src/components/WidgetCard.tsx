import React from "react";

interface WidgetCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * WidgetCard Component.
 * Unified styling wrapper block for individual dashboard widgets.
 */
export default function WidgetCard({ title, icon, children, action }: WidgetCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-card-border bg-card p-6 shadow-sm min-h-[12rem]">
      <div className="flex items-center justify-between border-b border-card-border pb-2 mb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="flex items-center justify-center text-sm">{icon}</div>}
          <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
        </div>
        {action && <div className="text-xs">{action}</div>}
      </div>
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </div>
  );
}
