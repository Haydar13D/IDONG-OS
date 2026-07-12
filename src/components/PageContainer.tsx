import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * PageContainer Component.
 * Unified wrapper block to manage viewport sizing and baseline backgrounds.
 */
export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {children}
    </div>
  );
}
