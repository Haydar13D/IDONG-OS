"use client";

import React, { useState, useTransition } from "react";
import { createWeeklyContractAction } from "../app/weekly-contract/actions";

interface WeeklyContractFormProps {
  weekNumber: number;
  year: number;
  onSuccess?: () => void;
}

/**
 * WeeklyContractForm Component.
 * Form for creating exactly three commitments for the current calendar week.
 */
export default function WeeklyContractForm({ weekNumber, year, onSuccess }: WeeklyContractFormProps) {
  const [commitments, setCommitments] = useState([
    { title: "", divisionSlug: "skripsi" },
    { title: "", divisionSlug: "job" },
    { title: "", divisionSlug: "skill" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTitleChange = (index: number, title: string) => {
    setCommitments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], title };
      return next;
    });
  };

  const handleDivisionChange = (index: number, divisionSlug: string) => {
    setCommitments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], divisionSlug };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Initial validation check
    for (let i = 0; i < 3; i++) {
      if (commitments[i].title.trim().length < 10) {
        setError(`Rincian komitmen #${i + 1} minimal 10 karakter.`);
        return;
      }
    }

    startTransition(async () => {
      const res = await createWeeklyContractAction({ commitments });

      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Gagal menyimpan kontrak mingguan.");
      }
    });
  };

  const divisions = [
    { label: "Skripsi & Riset", slug: "skripsi" },
    { label: "Job Readiness", slug: "job" },
    { label: "Skill Building", slug: "skill" },
    { label: "Organisasi & Personal", slug: "personal" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto rounded-lg border border-card-border bg-card p-6 shadow-sm">
      <div className="border-b border-card-border pb-3 mb-6">
        <h2 className="font-sans text-lg font-bold text-foreground">Buat Kontrak Mingguan Baru</h2>
        <p className="font-sans text-xs text-muted-foreground mt-0.5">
          Tentukan tepat 3 komitmen utama Anda untuk **Minggu {weekNumber}, Tahun {year}**.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {commitments.map((comm, index) => (
          <div key={index} className="space-y-2">
            <label className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Komitmen #{index + 1} (min. 10 karakter)
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={comm.title}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                placeholder="Deskripsikan apa yang akan Anda selesaikan..."
                disabled={isPending}
                className="flex-1 rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
              />
              <select
                value={comm.divisionSlug}
                onChange={(e) => handleDivisionChange(index, e.target.value)}
                disabled={isPending}
                className="rounded border border-card-border bg-card px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 sm:w-44 cursor-pointer"
              >
                {divisions.map((div) => (
                  <option key={div.slug} value={div.slug}>
                    {div.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

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
            {isPending ? "Menyimpan..." : "Kunci Kontrak Mingguan"}
          </button>
        </div>
      </form>
    </div>
  );
}
