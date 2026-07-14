"use client";

import React from "react";
import WidgetCard from "./WidgetCard";

interface EnergyMoodChartProps {
  dailyLogs: Array<{ date: string; energy: number; mood: number; logged: boolean }>;
}

/**
 * EnergyMoodChart Component.
 * Custom SVG Line and Gradient Area Chart mapping Energy & Mood levels over the past 30 days.
 */
export default function EnergyMoodChart({ dailyLogs }: EnergyMoodChartProps) {
  // Filter logs actually recorded
  const loggedEntries = dailyLogs.filter((log) => log.logged);

  // SVG dimensions
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Generate SVG path points
  const getPoints = (key: "energy" | "mood") => {
    if (loggedEntries.length < 2) return "";
    return loggedEntries
      .map((entry, index) => {
        const val = entry[key];
        const x = paddingX + (index / (loggedEntries.length - 1)) * chartWidth;
        // Map 1-5 level to chart height
        const y = paddingY + chartHeight - ((val - 1) / 4) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const energyPoints = getPoints("energy");
  const moodPoints = getPoints("mood");

  // Create area coordinates by closing the path to the baseline
  const getAreaPoints = (pointsStr: string) => {
    if (!pointsStr) return "";
    const firstPoint = pointsStr.split(" ")[0];
    const lastPoint = pointsStr.split(" ").slice(-1)[0];
    if (!firstPoint || !lastPoint) return "";
    const [firstX] = firstPoint.split(",");
    const [lastX] = lastPoint.split(",");
    const baselineY = paddingY + chartHeight;
    return `${firstX},${baselineY} ${pointsStr} ${lastX},${baselineY}`;
  };

  const energyAreaPoints = getAreaPoints(energyPoints);
  const moodAreaPoints = getAreaPoints(moodPoints);

  return (
    <WidgetCard title="Tren Energi &amp; Mood (30 Hari Terakhir)" icon="📈">
      {loggedEntries.length < 2 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center text-muted-foreground">
          <span className="text-xl mb-1">📊</span>
          <span className="font-sans text-xs">Butuh minimal 2 log standup untuk menampilkan grafik tren.</span>
        </div>
      ) : (
        <div className="space-y-4 py-2">
          {/* Chart Canvas */}
          <div className="relative w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = paddingY + (i / 4) * chartHeight;
                const scoreLabel = 5 - i;
                return (
                  <g key={i} className="opacity-10">
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      fill="currentColor"
                      textAnchor="end"
                      className="font-mono text-[9px] font-bold"
                    >
                      {scoreLabel}
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              {energyAreaPoints && (
                <polygon points={energyAreaPoints} fill="url(#energyGrad)" />
              )}
              {moodAreaPoints && (
                <polygon points={moodAreaPoints} fill="url(#moodGrad)" />
              )}

              {/* Line Paths */}
              {energyPoints && (
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={energyPoints}
                />
              )}
              {moodPoints && (
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={moodPoints}
                />
              )}

              {/* Nodes dots */}
              {loggedEntries.map((entry, index) => {
                const x = paddingX + (index / (loggedEntries.length - 1)) * chartWidth;
                const yEnergy = paddingY + chartHeight - ((entry.energy - 1) / 4) * chartHeight;
                const yMood = paddingY + chartHeight - ((entry.mood - 1) / 4) * chartHeight;
                return (
                  <g key={index}>
                    <circle cx={x} cy={yEnergy} r="3" fill="#f59e0b" className="hover:r-5 transition-all cursor-pointer" />
                    <circle cx={x} cy={yMood} r="3" fill="#10b981" className="hover:r-5 transition-all cursor-pointer" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legends */}
          <div className="flex justify-center gap-6 font-sans text-[10px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Energi (Skor 1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Mood / Emosi (Skor 1-5)</span>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
