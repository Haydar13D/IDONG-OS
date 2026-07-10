"use client";

import React, { useState, useTransition } from "react";
import { updateSettingsAction } from "./actions";

interface SettingsFormProps {
  initialSettings: {
    theme: string;
    timezone: string;
    dailyReminder: string;
    weeklyReminder: string;
    dashboardLayout: string;
    companyName: string;
  };
}

/**
 * SettingsForm Component. Handles state logic and visual forms for configuration management.
 */
export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [formData, setFormData] = useState(initialSettings);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    startTransition(async () => {
      const res = await updateSettingsAction(formData);
      if (res.success) {
        setSuccess(true);
        // Apply theme dynamically to root document tag
        if (formData.theme === "light") {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
        }
      } else {
        setError(res.error || "Failed to update configuration settings.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">
          System Settings
        </h1>
        <p className="font-sans text-sm text-muted-foreground mt-2">
          Configure IDONG OS workspace layouts and cron parameters.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Visual Settings Card */}
        <div className="rounded-lg border border-card-border bg-card p-6 shadow-sm">
          <h2 className="font-sans text-lg font-semibold text-foreground mb-4">
            Appearance
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="theme" className="block font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Active Theme
              </label>
              <select
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                className="w-full rounded border border-card-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="dark">Dark Mode (Command Center)</option>
                <option value="light">Light Mode</option>
              </select>
            </div>

            <div>
              <label htmlFor="dashboardLayout" className="block font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Dashboard Grid Layout
              </label>
              <select
                id="dashboardLayout"
                name="dashboardLayout"
                value={formData.dashboardLayout}
                onChange={handleChange}
                className="w-full rounded border border-card-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="2-column">2-Column Layout</option>
                <option value="3-column">3-Column Grid</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="companyName" className="block font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Operating System Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full rounded border border-card-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Cron & Regional Settings Card */}
        <div className="rounded-lg border border-card-border bg-card p-6 shadow-sm">
          <h2 className="font-sans text-lg font-semibold text-foreground mb-4">
            Region & Scheduling
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="timezone" className="block font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Local Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full rounded border border-card-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
              >
                <option value="GMT+7">GMT+7 (WIB / Jakarta)</option>
                <option value="GMT+8">GMT+8 (WITA / Singapore)</option>
                <option value="GMT+9">GMT+9 (WIT / Tokyo)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
              </select>
            </div>

            <div>
              <label htmlFor="dailyReminder" className="block font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Daily Standup Reminder
              </label>
              <input
                id="dailyReminder"
                name="dailyReminder"
                type="time"
                value={formData.dailyReminder}
                onChange={handleChange}
                className="w-full rounded border border-card-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
              />
            </div>

            <div>
              <label htmlFor="weeklyReminder" className="block font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Weekly Contract Reminder
              </label>
              <input
                id="weeklyReminder"
                name="weeklyReminder"
                type="time"
                value={formData.weeklyReminder}
                onChange={handleChange}
                className="w-full rounded border border-card-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
        </div>

        {/* Feedback indicators */}
        {success && (
          <p className="font-sans text-xs text-success text-center font-medium">
            System settings updated successfully.
          </p>
        )}

        {error && (
          <p className="font-sans text-xs text-destructive text-center font-medium">
            {error}
          </p>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-primary px-6 py-2.5 font-sans text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
