import React from "react";
import WidgetCard from "../WidgetCard";

/**
 * QuickActionWidget Placeholder.
 * Interactive trigger tiles directing to logging andscoring modals.
 */
export default function QuickActionWidget() {
  const actions = [
    { label: "Log Standup", icon: "📢" },
    { label: "Add Job Application", icon: "💼" },
    { label: "Score Skripsi Topic", icon: "🎓" },
  ];

  return (
    <WidgetCard title="Quick Actions" icon="⚡">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {actions.map((act, index) => (
          <button
            key={index}
            type="button"
            className="flex flex-col items-center justify-center rounded border border-card-border bg-card p-4 transition hover:bg-muted/30 cursor-pointer"
          >
            <span className="text-lg mb-1">{act.icon}</span>
            <span className="font-sans text-[10px] font-semibold text-foreground text-center">{act.label}</span>
          </button>
        ))}
      </div>
    </WidgetCard>
  );
}
