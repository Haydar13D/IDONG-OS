import React from "react";

interface MainContentProps {
  children: React.ReactNode;
}

/**
 * MainContent Component.
 * The primary viewport slot holding the view elements with standardized paddings.
 */
export default function MainContent({ children }: MainContentProps) {
  return (
    <main className="flex-1 p-6 font-sans">
      {children}
    </main>
  );
}
