"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("id-ID", options));

    // Handle clicks outside dropdowns to close them
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear session cookie and redirect to login
    document.cookie = "idong_os_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
  };

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

        {/* Active Search */}
        <div className="relative w-32 sm:w-48">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-card-border bg-card/50 px-2.5 py-1 font-sans text-[10px] text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>

        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="rounded-full border border-card-border p-1.5 text-[10px] text-muted-foreground bg-card hover:text-foreground hover:bg-muted/50 transition cursor-pointer relative"
            aria-label="Notifications"
          >
            🔔
            {/* Small active badge dot */}
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-success" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 rounded-md border border-card-border bg-card p-3 shadow-lg z-50 font-sans text-[10px] space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="font-bold border-b border-card-border pb-1 text-foreground">Notifikasi Masuk</div>
              <div className="space-y-1.5 divide-y divide-card-border/50 max-h-40 overflow-y-auto">
                <div className="pt-1 text-muted-foreground hover:text-foreground transition cursor-pointer">
                  📢 <span className="font-semibold text-foreground">Daily Standup:</span> Standup log Anda hari ini siap diisi.
                </div>
                <div className="pt-1.5 text-muted-foreground hover:text-foreground transition cursor-pointer">
                  📈 <span className="font-semibold text-foreground">Weekly Contract:</span> Komitmen mingguan aktif berjalan.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-7 w-7 rounded-full border border-card-border bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground font-sans hover:border-foreground/45 transition cursor-pointer"
          >
            AD
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-card-border bg-card p-2 shadow-lg z-50 font-sans text-[10px] space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2 py-1.5 border-b border-card-border">
                <div className="font-bold text-foreground">Admin User</div>
                <div className="text-[9px] text-muted-foreground">admin@idong.os</div>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                ⚙️ <span>Pengaturan</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 rounded px-2 py-1.5 text-destructive hover:bg-destructive/10 transition cursor-pointer"
              >
                🚪 <span>Keluar Sesi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
