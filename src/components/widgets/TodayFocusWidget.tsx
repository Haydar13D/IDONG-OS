import React from "react";
import WidgetCard from "../WidgetCard";

/**
 * TodayFocusWidget Placeholder.
 * Represents core focus task for today.
 */
export default function TodayFocusWidget() {
  return (
    <WidgetCard title="Today's Focus" icon="🎯">
      <div className="py-2">
        <h3 className="font-sans text-sm font-semibold text-foreground leading-snug">
          Menulis draf metodologi penelitian untuk Bab 3 Skripsi
        </h3>
        <p className="font-sans text-xs text-muted-foreground mt-2">
          Target hari ini: Menyelesaikan diagram alir sistem dan mengunggah draf ke Google Drive.
        </p>
      </div>
    </WidgetCard>
  );
}
