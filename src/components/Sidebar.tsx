"use client";

import React from "react";
import { usePathname } from "next/navigation";
import NavigationItem from "./NavigationItem";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar Component.
 * Responsive sidebar panel using NavigationItem hooks mapped to active router pathnames.
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", icon: <span className="material-symbols-rounded">dashboard</span>, href: "/dashboard" },
    { name: "Analytics", icon: <span className="material-symbols-rounded">monitoring</span>, href: "/analytics" },
    { name: "Skripsi", icon: <span className="material-symbols-rounded">school</span>, href: "/skripsi" },
    { name: "Weekly Contract", icon: <span className="material-symbols-rounded">history_edu</span>, href: "/weekly-contract" },
    { name: "Job Readiness", icon: <span className="material-symbols-rounded">business_center</span>, href: "/job-readiness" },
    { name: "Skill Building", icon: <span className="material-symbols-rounded">handyman</span>, href: "/skill-building" },
    { name: "Settings", icon: <span className="material-symbols-rounded">settings</span>, href: "/settings" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container - 280px wide */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-card-border bg-card transition-transform duration-200 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center border-b border-card-border px-6">
          <a
            href="/dashboard"
            onClick={(e) => {
              onClose();
            }}
            className="flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-sans text-sm font-bold tracking-wider text-foreground uppercase">
              IDONG OS
            </span>
          </a>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavigationItem
                key={item.name}
                name={item.name}
                icon={item.icon}
                href={item.href}
                isActive={isActive}
                onClick={onClose}
              />
            );
          })}
        </nav>
      </aside>
    </>
  );
}
