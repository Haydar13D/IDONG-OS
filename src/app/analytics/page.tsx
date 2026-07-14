import React from "react";
import { redirect } from "next/navigation";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { AnalyticsRepository } from "../../repositories/AnalyticsRepository";
import DashboardLayout from "../../components/DashboardLayout";
import PerformanceGauges from "../../components/PerformanceGauges";
import EnergyMoodChart from "../../components/EnergyMoodChart";
import ContributionHeatmap from "../../components/ContributionHeatmap";
import WidgetCard from "../../components/WidgetCard";

export const dynamic = "force-dynamic";

/**
 * AnalyticsPage Server Component.
 * Route path: /analytics. Orchestrates reports for streaks, daily log averages,
 * SVG line charts, and GitHub-style heatmaps.
 */
export default async function AnalyticsPage() {
  // 1. Session verification check
  const token = getSessionCookie();
  if (!token) {
    redirect("/login");
  }

  const session = await decryptSession(token);
  if (!session) {
    redirect("/login");
  }

  const repo = new AnalyticsRepository();
  const summary = await repo.getAnalyticsSummary();

  // Compute standup completion percentage (logged vs 30 days)
  const standupRate = Math.round((summary.totalStandupsLogged / 30) * 100);

  return (
    <DashboardLayout streakCount={summary.currentStreak}>
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
          Analisis &amp; Laporan Kerja
        </h2>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Tinjauan produktivitas komprehensif, evaluasi energi harian, dan grafik absensi berkala.
        </p>
      </div>

      <div className="space-y-6 mt-6">
        {/* Performance Gauges */}
        <PerformanceGauges
          standupCompletionRate={standupRate}
          contractSuccessRate={summary.contractSuccessRate}
          taskCompletionRate={summary.taskCompletionRate}
        />

        {/* Heatmap & Line Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ContributionHeatmap dailyLogs={summary.dailyLogs} />
          <EnergyMoodChart dailyLogs={summary.dailyLogs} />
        </div>

        {/* Monthly Summary & Division Breakdown Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Summary Highlights */}
          <WidgetCard title="Ringkasan Performa Bulanan" icon="📊">
            <div className="grid grid-cols-2 gap-4 py-1">
              <div className="rounded border border-card-border bg-background p-3">
                <span className="block font-sans text-[9px] text-muted-foreground uppercase tracking-wider">
                  Rata-rata Energi
                </span>
                <span className="font-sans text-lg font-bold text-foreground mt-0.5 block font-mono">
                  {summary.avgEnergyLevel} / 5.0
                </span>
              </div>
              <div className="rounded border border-card-border bg-background p-3">
                <span className="block font-sans text-[9px] text-muted-foreground uppercase tracking-wider">
                  Rata-rata Mood
                </span>
                <span className="font-sans text-lg font-bold text-foreground mt-0.5 block font-mono">
                  {summary.avgMoodLevel} / 5.0
                </span>
              </div>
              <div className="rounded border border-card-border bg-background p-3">
                <span className="block font-sans text-[9px] text-muted-foreground uppercase tracking-wider">
                  Streak Saat Ini
                </span>
                <span className="font-sans text-lg font-bold text-success mt-0.5 block font-mono">
                  🔥 {summary.currentStreak} Hari
                </span>
              </div>
              <div className="rounded border border-card-border bg-background p-3">
                <span className="block font-sans text-[9px] text-muted-foreground uppercase tracking-wider">
                  Streak Terpanjang
                </span>
                <span className="font-sans text-lg font-bold text-foreground mt-0.5 block font-mono">
                  ⚡ {summary.longestStreak} Hari
                </span>
              </div>
            </div>
          </WidgetCard>

          {/* Division progress list */}
          <WidgetCard title="Distribusi Kompetensi Divisi" icon="🗂️">
            <div className="space-y-3 py-1">
              {summary.divisionTaskRates.map((div) => (
                <div key={div.name} className="space-y-1">
                  <div className="flex items-center justify-between font-sans text-[10px]">
                    <span className="font-semibold text-foreground">{div.name}</span>
                    <span className="text-muted-foreground font-mono">
                      {div.completed} / {div.total} Selesai ({div.rate}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${div.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </WidgetCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
