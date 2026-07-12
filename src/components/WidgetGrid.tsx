import React from "react";

interface WidgetGridProps {
  children: React.ReactNode;
  columns?: "2-column" | "3-column";
}

/**
 * WidgetGrid Component.
 * Responsive grid container: 1 column on mobile, 2 on tablet (md), 3 on desktop (lg).
 */
export default function WidgetGrid({ children, columns = "3-column" }: WidgetGridProps) {
  const gridColsClass =
    columns === "2-column"
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-6 ${gridColsClass}`}>
      {children}
    </div>
  );
}

