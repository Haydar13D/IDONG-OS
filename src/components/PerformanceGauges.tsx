"use client";

import React from "react";
import WidgetCard from "./WidgetCard";

interface GaugeProps {
  label: string;
  percentage: number;
  color: string;
  subtext: string;
}

function ProgressGauge({ label, percentage, color, subtext }: GaugeProps) {
  const radius = 36;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="flex flex-col items-center text-center p-3 space-y-3">
      {/* Circular SVG progress */}
      <div className="relative h-24 w-24">
        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 96 96">
          {/* Background track */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/15"
          />
          {/* Progress fill */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Percentage Label inside */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-base font-bold text-foreground">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="space-y-0.5">
        <h4 className="font-sans text-xs font-bold text-foreground">{label}</h4>
        <p className="font-sans text-[10px] text-muted-foreground">{subtext}</p>
      </div>
    </div>
  );
}

interface PerformanceGaugesProps {
  standupCompletionRate: number;
  contractSuccessRate: number;
  taskCompletionRate: number;
}

/**
 * PerformanceGauges Component.
 * SVG circular ring meters monitoring consistency ratios across sprint milestones.
 */
export default function PerformanceGauges({
  standupCompletionRate,
  contractSuccessRate,
  taskCompletionRate,
}: PerformanceGaugesProps) {
  return (
    <WidgetCard title="Indikator Performansi Kerja" icon="🎯">
      <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-card-border/60">
        <ProgressGauge
          label="Konsistensi Standup"
          percentage={standupCompletionRate}
          color="#3b82f6" // Blue
          subtext="Standup terisi vs 30 hari"
        />
        <ProgressGauge
          label="Kontrak Mingguan"
          percentage={contractSuccessRate}
          color="#10b981" // Green/Success
          subtext="Rasio kelulusan komitmen"
        />
        <ProgressGauge
          label="Rasio Tugas Selesai"
          percentage={taskCompletionRate}
          color="#f59e0b" // Amber/Warning
          subtext="Total tasks berstatus DONE"
        />
      </div>
    </WidgetCard>
  );
}
