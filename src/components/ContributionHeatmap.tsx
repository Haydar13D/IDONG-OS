"use client";

import React from "react";
import WidgetCard from "./WidgetCard";

interface ContributionHeatmapProps {
  dailyLogs: Array<{ date: string; energy: number; mood: number; logged: boolean }>;
}

/**
 * ContributionHeatmap Component.
 * GitHub-style grid visualization mapping daily standup completions over the past 90 days.
 */
export default function ContributionHeatmap({ dailyLogs }: ContributionHeatmapProps) {
  // We have exactly 90 days. Let's arrange them into columns of 7 days (representing weeks).
  // Total columns = Math.ceil(90 / 7) = 13 columns.
  const columns: typeof dailyLogs[] = [];
  let currentColumn: typeof dailyLogs = [];

  dailyLogs.forEach((day, index) => {
    currentColumn.push(day);
    if (currentColumn.length === 7 || index === dailyLogs.length - 1) {
      columns.push(currentColumn);
      currentColumn = [];
    }
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  // Get unique months labels based on days list to align at the top
  const getMonthLabels = () => {
    const labels: Array<{ label: string; index: number }> = [];
    let lastMonth = -1;

    columns.forEach((col, colIdx) => {
      if (col.length > 0) {
        const dateObj = new Date(col[0].date);
        const m = dateObj.getMonth();
        if (m !== lastMonth) {
          labels.push({ label: months[m], index: colIdx });
          lastMonth = m;
        }
      }
    });

    return labels;
  };

  const monthLabels = getMonthLabels();

  return (
    <WidgetCard title="Absensi Standup Heatmap (90 Hari Terakhir)" icon="🧱">
      <div className="space-y-4 py-2 overflow-x-auto">
        <div className="min-w-[400px]">
          {/* Months Headers */}
          <div className="relative h-4 mb-1 flex font-sans text-[9px] text-muted-foreground">
            <div className="w-8 shrink-0" />
            <div className="flex-1 flex relative">
              {monthLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  className="absolute font-semibold"
                  style={{ left: `${(lbl.index / columns.length) * 100}%` }}
                >
                  {lbl.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {/* Days Labels (Sunday, Tue, Thu, Sat) */}
            <div className="flex flex-col justify-between h-[84px] text-right font-sans text-[8px] text-muted-foreground w-8 pr-2 shrink-0 py-0.5 font-bold uppercase tracking-wider">
              <span>Min</span>
              <span>Sel</span>
              <span>Kam</span>
              <span>Sab</span>
            </div>

            {/* Grid Columns */}
            <div className="flex-1 flex gap-1.5">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5">
                  {col.map((day) => {
                    const formattedDate = new Date(day.date).toLocaleDateString("id-ID", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                    return (
                      <span
                        key={day.date}
                        title={`${formattedDate}: ${day.logged ? "Log Standup Terisi" : "Pending"}`}
                        className={`h-2.5 w-2.5 rounded-sm transition duration-150 hover:scale-125 cursor-help ${
                          day.logged
                            ? "bg-success border border-success/30 shadow-sm shadow-success/10"
                            : "bg-muted/30 border border-card-border/10"
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legends */}
          <div className="flex justify-end items-center gap-1.5 pt-3 font-sans text-[9px] text-muted-foreground">
            <span>Kurang</span>
            <span className="h-2.5 w-2.5 rounded-sm bg-muted/30 border border-card-border/10" />
            <span className="h-2.5 w-2.5 rounded-sm bg-success border border-success/30" />
            <span>Lebih</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
