"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar Component.
 * Renders brand header and division navigation links.
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Skripsi", href: "/skripsi", icon: "🎓" },
    { name: "Job Readiness", href: "/job-readiness", icon: "💼" },
    { name: "Skill Building", href: "/skill-building", icon: "🛠️" },
    { name: "Organization", href: "/organization", icon: "🗓️" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-card-border bg-card transition-transform duration-200 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-card-border px-6">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="font-sans text-sm font-bold tracking-wider text-foreground uppercase">
              IDONG OS
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded px-3 py-2 font-sans text-sm font-medium transition ${
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-card-border p-4">
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded border border-card-border bg-background py-2 font-sans text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
