import React from "react";
import WidgetCard from "../WidgetCard";
import EmptyState from "../EmptyState";

interface TodayFocusWidgetProps {
  todayFocus: string | null;
}

/**
 * TodayFocusWidget Component.
 * Displays today's focus task loaded from the database daily log records.
 */
export default function TodayFocusWidget({ todayFocus }: TodayFocusWidgetProps) {
  return (
    <WidgetCard title="Today's Focus" icon="🎯">
      <div className="py-1">
        {todayFocus ? (
          <div>
            <h3 className="font-sans text-sm font-semibold text-foreground leading-snug">
              {todayFocus}
            </h3>
            <p className="font-sans text-[9px] text-muted-foreground mt-2 leading-relaxed font-mono">
              * Target ini ditentukan dari setelan fokus esok hari pada laporan standup harian terakhir Anda.
            </p>
          </div>
        ) : (
          <EmptyState
            title="Tidak ada fokus hari ini"
            description="Isi log standup hari ini untuk memformulasikan fokus esok hari."
            icon="🎯"
          />
        )}
      </div>
    </WidgetCard>
  );
}
