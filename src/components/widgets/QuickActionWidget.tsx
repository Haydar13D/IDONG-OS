import React from "react";
import WidgetCard from "../WidgetCard";

interface QuickActionWidgetProps {
  onLogStandupClick?: () => void;
}

/**
 * QuickActionWidget Component.
 * Interactive shortcut triggers enabling fast navigation or modals for daily standups.
 */
export default function QuickActionWidget({ onLogStandupClick }: QuickActionWidgetProps) {
  const actions = [
    { label: "Log Standup", icon: "📢", onClick: onLogStandupClick },
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
            onClick={act.onClick}
            className="flex flex-col items-center justify-center rounded border border-card-border bg-card p-4 transition hover:bg-muted/30 cursor-pointer disabled:opacity-50"
            disabled={act.label === "Log Standup" && !onLogStandupClick}
          >
            <span className="text-lg mb-1">{act.icon}</span>
            <span className="font-sans text-[10px] font-semibold text-foreground text-center">{act.label}</span>
          </button>
        ))}
      </div>
    </WidgetCard>
  );
}
