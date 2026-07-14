"use client";

import React, { useState, useTransition } from "react";
import { reviewWeeklyContractAction } from "../app/weekly-contract/actions";
import { PopulatedContract } from "../repositories/WeeklyContractRepository";

interface WeeklyContractReviewProps {
  contract: PopulatedContract;
  onSuccess?: () => void;
}

/**
 * WeeklyContractReview Component.
 * Form checklist to grade and finalize an active Weekly Contract.
 */
export default function WeeklyContractReview({ contract, onSuccess }: WeeklyContractReviewProps) {
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(
    contract.commitments.filter((c) => c.task.status === "DONE").map((c) => c.taskId)
  );
  const [reviewNote, setReviewNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await reviewWeeklyContractAction({
        contractId: contract.id,
        completedTaskIds,
        reviewNote,
      });

      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Gagal mengirim tinjauan.");
      }
    });
  };

  const completedCount = completedTaskIds.length;
  const isFailWarning = completedCount < 2;

  return (
    <div className="w-full max-w-xl mx-auto rounded-lg border border-card-border bg-card p-6 shadow-sm">
      <div className="border-b border-card-border pb-3 mb-6">
        <h2 className="font-sans text-lg font-bold text-foreground">Tinjau Kontrak Mingguan</h2>
        <p className="font-sans text-xs text-muted-foreground mt-0.5">
          Evaluasi pencapaian Anda untuk **Minggu {contract.weekNumber}, Tahun {contract.year}**.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <span className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Pencapaian Komitmen (Centang yang berhasil diselesaikan)
          </span>

          {contract.commitments.map((comm) => (
            <label
              key={comm.id}
              className={`flex items-start gap-3 rounded border p-3 transition select-none cursor-pointer ${
                completedTaskIds.includes(comm.taskId)
                  ? "bg-success/5 border-success/30 text-foreground"
                  : "bg-background border-card-border text-muted-foreground hover:bg-muted/10"
              }`}
            >
              <input
                type="checkbox"
                checked={completedTaskIds.includes(comm.taskId)}
                onChange={() => handleToggleTask(comm.taskId)}
                disabled={isPending}
                className="mt-0.5 h-4 w-4 rounded border-card-border bg-card accent-primary"
              />
              <div className="flex-1">
                <span className="font-sans text-xs leading-snug">{comm.task.title}</span>
                <span className="block font-mono text-[8px] text-muted-foreground uppercase tracking-wider mt-1.5">
                  Divisi: {comm.task.goalId ? "Objectives" : "Other"}
                </span>
              </div>
            </label>
          ))}
        </div>

        {/* Review Reflections Textarea */}
        <div className="space-y-2">
          <label htmlFor="reviewNote" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Catatan Evaluasi / Refleksi Mingguan (Maks. 1000 karakter)
          </label>
          <textarea
            id="reviewNote"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Tuliskan refleksi evaluasi mingguan Anda..."
            disabled={isPending}
            rows={4}
            className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 resize-none"
          />
        </div>

        {/* High-Accountability Penalty Alert Warning */}
        {isFailWarning && (
          <div className="rounded border border-warning/20 bg-warning/10 p-3.5">
            <h4 className="font-sans text-xs font-semibold text-warning">Peringatan Sanksi Penalti</h4>
            <p className="font-sans text-[10px] text-muted-foreground mt-1 leading-relaxed">
              Anda hanya mencentang **{completedCount} dari 3** komitmen. Menyelesaikan kurang dari 2 komitmen akan memicu kegagalan kontrak mingguan (`FAILED`) dan **me-reset streak harian Anda ke 0**!
            </p>
          </div>
        )}

        {error && (
          <p className="font-sans text-xs text-destructive text-center font-medium bg-destructive/10 border border-destructive/20 rounded py-1.5">
            {error}
          </p>
        )}

        <div className="flex justify-end pt-3 border-t border-card-border">
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-primary px-5 py-2.5 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Mengirim..." : "Selesaikan Tinjauan"}
          </button>
        </div>
      </form>
    </div>
  );
}
