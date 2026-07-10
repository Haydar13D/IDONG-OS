import React from "react";

interface WidgetGridProps {
  children: React.ReactNode;
  columns?: "2-column" | "3-column";
}

/**
 * WidgetGrid Component.
 * Responsive grid container supporting dynamic 2-column or 3-column structures.
 */
export default function WidgetGrid({ children, columns = "2-column" }: WidgetGridProps) {
  const gridColsClass =
    columns === "3-column"
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 lg:grid-cols-2";

  return (
    <div className={`grid gap-6 ${gridColsClass}`}>
      {children}
    </div>
  );
}
