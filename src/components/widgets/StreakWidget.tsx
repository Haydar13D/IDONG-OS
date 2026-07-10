import React from "react";
import WidgetCard from "../WidgetCard";

/**
 * StreakWidget Placeholder.
 * Renders fire flame metrics, current active count, peak stats, and alert pills.
 */
export default function StreakWidget() {
  return (
    <WidgetCard title="Streak Tracker" icon="🔥">
      <div className="flex items-center gap-6 py-2">
        <div className="text-4xl">🔥</div>
        <div>
          <div className="font-sans text-3xl font-bold text-foreground">5 Days</div>
          <div className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
            Longest Streak: 12 Days
          </div>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 font-sans text-xs font-semibold text-success">
            Healthy
          </span>
        </div>
      </div>
    </WidgetCard>
  );
}
