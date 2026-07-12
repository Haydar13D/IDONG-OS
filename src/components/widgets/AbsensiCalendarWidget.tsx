import React from "react";
import WidgetCard from "../WidgetCard";

interface AbsensiCalendarWidgetProps {
  historyLogs: Array<{ date: string; done: boolean }>;
}

/**
 * AbsensiCalendarWidget Component.
 * Displays a calendar grid representing daily standup logs checks for the past 30 days.
 */
export default function AbsensiCalendarWidget({ historyLogs }: AbsensiCalendarWidgetProps) {
  return (
    <WidgetCard title="Riwayat Absensi" icon="🗓️">
      <div className="py-2">
        <div className="flex flex-wrap gap-2">
          {historyLogs.map((log, index) => {
            const dateObj = new Date(log.date);
            const formattedDate = dateObj.toLocaleDateString("id-ID", {
              month: "short",
              day: "numeric",
            });
            return (
              <div
                key={index}
                title={`${formattedDate}: ${log.done ? "Hadir (Standup Selesai)" : "Absen (Standup Kosong)"}`}
                className={`h-6 w-6 rounded flex items-center justify-center text-[9px] font-mono font-bold border transition duration-150 cursor-default select-none ${
                  log.done
                    ? "bg-success/20 border-success/40 text-success"
                    : "bg-muted/20 border-card-border text-muted-foreground"
                }`}
              >
                {dateObj.getDate()}
              </div>
            );
          })}
        </div>
        <p className="font-sans text-[9px] text-muted-foreground mt-3 font-mono">
          * Menampilkan riwayat kehadiran pengisian log untuk 30 hari terakhir.
        </p>
      </div>
    </WidgetCard>
  );
}
