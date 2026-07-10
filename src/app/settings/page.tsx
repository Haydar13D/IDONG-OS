import React from "react";
import SettingsForm from "./SettingsForm";
import { getSettings } from "./actions";

export const dynamic = "force-dynamic";

/**
 * SettingsPage Server Component.
 * Fetches config records using the repository via server action and instantiates the client form.
 */
export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SettingsForm
        initialSettings={{
          theme: settings.theme,
          timezone: settings.timezone,
          dailyReminder: settings.dailyReminder,
          weeklyReminder: settings.weeklyReminder,
          dashboardLayout: settings.dashboardLayout,
          companyName: settings.companyName,
        }}
      />
    </main>
  );
}
