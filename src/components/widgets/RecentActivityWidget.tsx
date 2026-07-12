import React from "react";
import WidgetCard from "../WidgetCard";

interface ActivityItem {
  id: string;
  event: string;
  time: string;
  details: string;
}

interface RecentActivityWidgetProps {
  activities: ActivityItem[];
}

/**
 * RecentActivityWidget Component.
 * Displays chronological audit log feeds from database transactions.
 */
export default function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {
  return (
    <WidgetCard title="Recent Activity" icon="⏱️">
      <div className="relative border-l border-card-border pl-4 space-y-4 py-2 ml-2">
        {activities.length > 0 ? (
          activities.map((log) => (
            <div key={log.id} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-card bg-primary" />
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="font-sans text-xs font-semibold text-foreground">{log.event}</h4>
                  <span className="font-sans text-[10px] text-muted-foreground whitespace-nowrap">{log.time}</span>
                </div>
                <p className="font-sans text-[10px] text-muted-foreground mt-0.5">{log.details}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-2 text-center">
            <p className="font-sans text-xs text-muted-foreground">Belum ada aktivitas terbaru.</p>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
