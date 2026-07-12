"use client";

import React, { useState } from "react";
import NavigationItem from "./NavigationItem";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar Component.
 * Responsive sidebar panel using NavigationItem hooks and tracking active menu state locally.
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const navItems = [
    { name: "Dashboard", icon: "📊" },
    { name: "Skripsi", icon: "🎓" },
    { name: "Job Readiness", icon: "💼" },
    { name: "Skill Building", icon: "🛠️" },
    { name: "Organization", icon: "🗓️" },
    { name: "Settings", icon: "⚙️" },
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
            href="#"
            onClick={(e) => {
              e.preventDefault();
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
          {navItems.map((item, index) => (
            <NavigationItem
              key={item.name}
              name={item.name}
              icon={item.icon}
              isActive={index === activeIndex}
              onClick={() => {
                setActiveIndex(index);
                onClose();
              }}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
