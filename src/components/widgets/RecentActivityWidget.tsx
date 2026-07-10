import React from "react";
import WidgetCard from "../WidgetCard";

/**
 * RecentActivityWidget Placeholder.
 * Chronological timelines mapping historical audit logs.
 */
export default function RecentActivityWidget() {
  const logs = [
    { title: "Logged Daily Standup", time: "10 minutes ago", detail: "What finished: scoring skripsi decision matrix" },
    { title: "Scored Thesis Matrix", time: "2 hours ago", detail: "Scored 3 candidate thesis topics" },
    { title: "Committed to Weekly Contract", time: "1 day ago", detail: "Created contract for Week 28, Year 2026" },
  ];

  return (
    <WidgetCard title="Recent Activity" icon="⏱️">
      <div className="relative border-l border-card-border pl-4 space-y-4 py-2 ml-2">
        {logs.map((log, index) => (
          <div key={index} className="relative">
            <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-card bg-primary" />
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-sans text-xs font-semibold text-foreground">{log.title}</h4>
                <span className="font-sans text-[10px] text-muted-foreground">{log.time}</span>
              </div>
              <p className="font-sans text-[10px] text-muted-foreground mt-0.5">{log.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
