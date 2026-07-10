import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import WidgetGrid from "../../components/WidgetGrid";

// Import widgets
import TodayFocusWidget from "../../components/widgets/TodayFocusWidget";
import WeeklyContractWidget from "../../components/widgets/WeeklyContractWidget";
import QuickActionWidget from "../../components/widgets/QuickActionWidget";
import StreakWidget from "../../components/widgets/StreakWidget";
import RecentActivityWidget from "../../components/widgets/RecentActivityWidget";

/**
 * DashboardPage Server Component.
 * Sourced at /dashboard, rendering the placeholder widget modules.
 */
export default function DashboardPage() {
  return (
    <DashboardLayout pageTitle="Dashboard">
      <WidgetGrid columns="2-column">
        {/* Left Column Stack */}
        <div className="space-y-6">
          <TodayFocusWidget />
          <WeeklyContractWidget />
          <QuickActionWidget />
        </div>

        {/* Right Column Stack */}
        <div className="space-y-6">
          <StreakWidget />
          <RecentActivityWidget />
        </div>
      </WidgetGrid>
    </DashboardLayout>
  );
}
