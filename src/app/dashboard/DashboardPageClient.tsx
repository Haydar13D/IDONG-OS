"use client";

import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import WidgetGrid from "../../components/WidgetGrid";
import DailyStandupModal from "../../components/DailyStandupModal";

// Import widgets
import TodayFocusWidget from "../../components/widgets/TodayFocusWidget";
import WeeklyContractWidget from "../../components/widgets/WeeklyContractWidget";
import QuickActionWidget from "../../components/widgets/QuickActionWidget";
import StreakWidget from "../../components/widgets/StreakWidget";
import RecentActivityWidget from "../../components/widgets/RecentActivityWidget";
import AbsensiCalendarWidget from "../../components/widgets/AbsensiCalendarWidget";

interface DashboardPageClientProps {
  initialData: {
    currentStreak: number;
    longestStreak: number;
    redFlagStatus: boolean;
    standupPending: boolean;
    todayFocus: string | null;
    recentActivities: Array<{ id: string; event: string; time: string; details: string }>;
    historyLogs: Array<{ date: string; done: boolean }>;
  };
}

/**
 * DashboardPageClient Component.
 * Orchestrates client-side state hooks for Daily Standup modal displays,
 * warning banners, and binds database metrics down to specific widget components.
 */
export default function DashboardPageClient({ initialData }: DashboardPageClientProps) {
  const [standupOpen, setStandupOpen] = useState(false);
  const [data, setData] = useState(initialData);

  const handleStandupSuccess = () => {
    // Optimistically update UI status indicators on successful Standup log writes
    setData((prev) => {
      const wasPending = prev.standupPending;
      const nextStreak = wasPending ? prev.currentStreak + 1 : prev.currentStreak;
      return {
        ...prev,
        standupPending: false,
        currentStreak: nextStreak,
        longestStreak: Math.max(prev.longestStreak, nextStreak),
      };
    });
  };

  return (
    <DashboardLayout 
      streakCount={data.currentStreak} 
      onLogStandupClick={() => setStandupOpen(true)}
    >
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Selamat datang kembali, Admin.
        </p>
      </div>

      {/* Conditionally render daily standup warning banner */}
      {data.standupPending && (
        <div className="mb-6 rounded-lg border border-warning/20 bg-warning/10 p-4 shadow-sm flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-sans text-sm font-semibold text-warning">Standup Harian Pending</h3>
            <p className="font-sans text-xs text-muted-foreground mt-0.5">
              Kamu belum mengisi standup hari ini. Isi sekarang untuk menjaga streak kamu tetap menyala!
            </p>
          </div>
          <button
            onClick={() => setStandupOpen(true)}
            className="rounded bg-warning text-warning-foreground px-4 py-2 font-sans text-xs font-semibold hover:opacity-90 active:opacity-100 transition whitespace-nowrap cursor-pointer"
          >
            + Log Standup Sekarang
          </button>
        </div>
      )}

      <WidgetGrid columns="2-column">
        {/* Left Column Widgets */}
        <div className="space-y-6">
          <TodayFocusWidget todayFocus={data.todayFocus} />
          <WeeklyContractWidget />
          <QuickActionWidget onLogStandupClick={() => setStandupOpen(true)} />
        </div>

        {/* Right Column Widgets */}
        <div className="space-y-6">
          <StreakWidget currentStreak={data.currentStreak} longestStreak={data.longestStreak} />
          <AbsensiCalendarWidget historyLogs={data.historyLogs} />
          <RecentActivityWidget activities={data.recentActivities} />
        </div>
      </WidgetGrid>

      {/* Daily Standup Form Modal */}
      <DailyStandupModal 
        isOpen={standupOpen} 
        onClose={() => setStandupOpen(false)}
        onSuccess={handleStandupSuccess}
      />
    </DashboardLayout>
  );
}
