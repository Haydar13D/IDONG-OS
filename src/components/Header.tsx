"use client";

import React, { useEffect, useState } from "react";

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

/**
 * Header Component.
 * Contains greetings, date logs, search input placeholders, notifications and user avatar profiles.
 */
export default function Header({ onMenuToggle }: HeaderProps) {
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("en-US", options));
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-card-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger menu */}
        <button
          onClick={onMenuToggle}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        >
          ☰
        </button>

        {/* Greeting & Date block */}
        <div className="hidden sm:block">
          <h1 className="font-sans text-sm font-semibold text-foreground">
            Hello, Admin
          </h1>
          <p className="font-sans text-[10px] text-muted-foreground">
            {currentDate || "Loading date..."}
          </p>
        </div>
      </div>

      {/* Utilities Center/Right */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Search Placeholder */}
        <div className="relative w-40 sm:w-60">
          <input
            type="text"
            placeholder="Search terminal..."
            disabled
            className="w-full rounded border border-card-border bg-card/50 px-3 py-1.5 font-sans text-xs text-muted-foreground outline-none cursor-not-allowed"
          />
        </div>

        {/* Notification Button Placeholder */}
        <button
          type="button"
          disabled
          className="rounded-full border border-card-border p-1.5 text-muted-foreground bg-card hover:text-foreground cursor-not-allowed"
        >
          🔔
        </button>

        {/* Profile Placeholder */}
        <div className="h-7 w-7 rounded-full border border-card-border bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground font-sans cursor-not-allowed">
          AD
        </div>
      </div>
    </header>
  );
}
