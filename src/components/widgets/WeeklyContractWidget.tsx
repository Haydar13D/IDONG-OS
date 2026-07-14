import React from "react";
import Link from "next/link";
import WidgetCard from "../WidgetCard";
import EmptyState from "../EmptyState";
import { PopulatedContract } from "../../repositories/WeeklyContractRepository";

interface WeeklyContractWidgetProps {
  contract: PopulatedContract | null;
}

/**
 * WeeklyContractWidget Component.
 * Displays active commitments, completion progress, or redirects to contract configuration views.
 */
export default function WeeklyContractWidget({ contract }: WeeklyContractWidgetProps) {
  if (!contract) {
    return (
      <WidgetCard title="Weekly Contract" icon="✍️">
        <div className="py-2">
          <EmptyState
            title="Tidak Ada Kontrak Aktif"
            description="Buat komitmen mingguan baru untuk memulai pelacakan pertanggungjawaban."
            icon="✍️"
          />
          <div className="mt-4 flex justify-center">
            <Link
              href="/weekly-contract"
              className="rounded bg-primary px-4 py-2 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100"
            >
              Buat Kontrak Mingguan
            </Link>
          </div>
        </div>
      </WidgetCard>
    );
  }

  const total = contract.commitments.length;
  const completed = contract.commitments.filter((c) => c.task.status === "DONE").length;
  const percent = Math.round((completed / total) * 100);

  return (
    <WidgetCard title={`Weekly Contract (Week ${contract.weekNumber})`} icon="✍️">
      <div className="space-y-4 py-1">
        <div className="space-y-3">
          {contract.commitments.map((comm) => {
            const isDone = comm.task.status === "DONE";
            return (
              <div key={comm.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isDone}
                  readOnly
                  className="mt-0.5 h-3.5 w-3.5 rounded border-card-border bg-background text-primary accent-primary outline-none cursor-default"
                />
                <span
                  className={`font-sans text-xs ${
                    isDone ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {comm.task.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="pt-2 border-t border-card-border">
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] text-muted-foreground">Progres Pencapaian</span>
            <span className="font-sans text-[10px] font-semibold text-foreground font-mono">
              {completed} / {total} ({percent}%)
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                contract.status === "FAILED"
                  ? "bg-destructive"
                  : percent >= 67
                  ? "bg-success"
                  : "bg-primary"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Action Link */}
        <div className="flex justify-end pt-1">
          <Link
            href="/weekly-contract"
            className="font-sans text-[10px] font-semibold text-primary hover:underline"
          >
            {contract.status === "ACTIVE" ? "Tinjau Kontrak Mingguan →" : "Lihat Detail Kontrak →"}
          </Link>
        </div>
      </div>
    </WidgetCard>
  );
}
