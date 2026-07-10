import React from "react";
import WidgetCard from "../WidgetCard";

/**
 * WeeklyContractWidget Placeholder.
 * Lists checklist of commitments target objectives for the active week.
 */
export default function WeeklyContractWidget() {
  const commitments = [
    { text: "Scoring topik skripsi menggunakan decision matrix", done: true },
    { text: "Melamar ke 3 lowongan internship", done: false },
    { text: "Menyelesaikan AWS Cloud Practitioner Module 3", done: false },
  ];

  return (
    <WidgetCard title="Weekly Contract" icon="✍️">
      <div className="space-y-3 py-1">
        {commitments.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={item.done}
              readOnly
              className="mt-0.5 h-3.5 w-3.5 rounded border-card-border bg-background text-primary accent-primary outline-none"
            />
            <span className={`font-sans text-xs ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
