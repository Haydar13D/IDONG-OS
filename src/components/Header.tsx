"use client";

import React from "react";

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

/**
 * Header Component.
 * Houses page breadcrumbs context, active streak pill, and standup logging triggers.
 */
export default function Header({ onMenuToggle, title = "Dashboard" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-card-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Trigger */}
        <button
          onClick={onMenuToggle}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        >
          ☰
        </button>

        <nav className="flex items-center space-x-2 font-sans text-xs text-muted-foreground">
          <span>Workspace</span>
          <span>&gt;</span>
          <span className="text-foreground font-medium">{title}</span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak Counter Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-card-border bg-card px-3 py-1 font-mono text-xs font-semibold text-foreground">
          <span>🔥</span>
          <span>5 Days</span>
        </div>

        {/* Quick Log Action */}
        <button className="hidden rounded bg-primary px-3 py-1.5 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 sm:block">
          + Log Standup
        </button>
      </div>
    </header>
  );
}
