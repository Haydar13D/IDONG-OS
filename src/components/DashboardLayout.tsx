"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import PageContainer from "./PageContainer";
import MainContent from "./MainContent";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  streakCount?: number;
  onLogStandupClick?: () => void;
}

/**
 * DashboardLayout Component.
 * Orchestrates full viewport layout displaying a 280px desktop sidebar, header elements,
 * and passes standup triggers to the client.
 */
export default function DashboardLayout({
  children,
  streakCount = 0,
  onLogStandupClick,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PageContainer>
      {/* Sidebar - 280px */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Viewport container offsetting desktop sidebar */}
      <div className="flex flex-1 flex-col md:pl-[280px]">
        <Header 
          onMenuToggle={() => setSidebarOpen(true)} 
          streakCount={streakCount}
          onLogStandupClick={onLogStandupClick}
        />

        {/* Main Content Component wrapper */}
        <MainContent>{children}</MainContent>
      </div>
    </PageContainer>
  );
}
