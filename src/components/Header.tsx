"use client";

import React, { useEffect, useState } from "react";

interface HeaderProps {
  onMenuToggle: () => void;
  streakCount?: number;
  onLogStandupClick?: () => void;
  title?: string;
}

/**
 * Header Component.
 * Contains greetings, date logs, streak badges, log triggers, search/notification/profile placeholders.
 */
export default function Header({ onMenuToggle, streakCount = 0, onLogStandupClick }: HeaderProps) {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("id-ID", options));
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-card-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onMenuToggle}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden text-lg"
          aria-label="Open menu"
        >
          ☰
        </button>

        {/* Greeting & Date block */}
        <div className="hidden sm:block">
          <h1 className="font-sans text-xs font-semibold text-foreground">
            Hello, Admin
          </h1>
          <p className="font-sans text-[9px] text-muted-foreground mt-0.5 font-mono">
            {currentDate || "Loading date..."}
          </p>
        </div>
      </div>

      {/* Utilities Center/Right */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Streak Counter Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-card-border bg-card px-3 py-1 font-mono text-[10px] font-semibold text-foreground">
          <span>🔥</span>
          <span>{streakCount} Hari</span>
        </div>

        {/* Log Standup Action Button */}
        {onLogStandupClick && (
          <button
            onClick={onLogStandupClick}
            className="hidden rounded bg-primary px-3 py-1.5 font-sans text-[10px] font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 sm:block cursor-pointer"
          >
            + Log Standup
          </button>
        )}

        {/* Search Placeholder */}
        <div className="relative w-32 sm:w-48">
          <input
            type="text"
            placeholder="Search..."
            disabled
            className="w-full rounded border border-card-border bg-card/50 px-2.5 py-1 font-sans text-[10px] text-muted-foreground outline-none cursor-not-allowed"
          />
        </div>

        {/* Notification Button Placeholder */}
        <button
          type="button"
          disabled
          className="rounded-full border border-card-border p-1 text-[10px] text-muted-foreground bg-card hover:text-foreground cursor-not-allowed"
          aria-label="Notifications"
        >
          🔔
        </button>

        {/* Profile Placeholder */}
        <div className="h-6 w-6 rounded-full border border-card-border bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground font-sans cursor-not-allowed">
          AD
        </div>
      </div>
    </header>
  );
}
