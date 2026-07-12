import React from "react";
import WidgetCard from "../WidgetCard";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
}

/**
 * StreakWidget Component.
 * Displays dynamic streak counts and warning flags.
 */
export default function StreakWidget({ currentStreak, longestStreak }: StreakWidgetProps) {
  const isHealthy = currentStreak > 0;

  return (
    <WidgetCard title="Streak Tracker" icon="🔥">
      <div className="flex items-center gap-6 py-2">
        <div className="text-4.5xl">🔥</div>
        <div>
          <div className="font-sans text-3xl font-bold text-foreground">
            {currentStreak} <span className="text-sm font-medium text-muted-foreground">Hari</span>
          </div>
          <div className="font-sans text-[9px] text-muted-foreground uppercase tracking-wider mt-1 font-mono">
            Longest Streak: {longestStreak} Hari
          </div>
        </div>
        <div className="ml-auto">
          {isHealthy ? (
            <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 font-sans text-[10px] font-semibold text-success">
              Healthy
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-warning/15 px-2.5 py-0.5 font-sans text-[10px] font-semibold text-warning">
              Pending Log
            </span>
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
