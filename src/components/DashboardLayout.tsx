"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

/**
 * DashboardLayout Component.
 * The core layout skeleton connecting Sidebar, Header, and main grid slots.
 */
export default function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Drawer navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Page Layout Offset Container */}
      <div className="flex flex-col md:pl-60">
        <Header onMenuToggle={() => setSidebarOpen(true)} title={pageTitle} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
