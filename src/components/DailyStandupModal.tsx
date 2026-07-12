"use client";

import React, { useState, useTransition } from "react";
import { submitDailyStandupAction } from "../app/dashboard/actions";

interface DailyStandupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * DailyStandupModal Component.
 * Responsive form layout for daily standup updates, converting to bottom drawers on mobile devices.
 */
export default function DailyStandupModal({ isOpen, onClose, onSuccess }: DailyStandupModalProps) {
  const [formData, setFormData] = useState({
    whatFinished: "",
    blocker: "",
    focusTomorrow: "",
    energyLevel: 3,
    moodLevel: 3,
    artifactProof: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLevelSelect = (name: "energyLevel" | "moodLevel", value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Klien-side input length validations
    if (formData.whatFinished.trim().length < 10) {
      setError("Rincian tugas selesai minimal 10 karakter.");
      return;
    }
    if (formData.focusTomorrow.trim().length < 10) {
      setError("Target fokus esok hari minimal 10 karakter.");
      return;
    }
    if (formData.blocker.trim().length < 2) {
      setError("Rincian kendala/blocker wajib diisi (minimal 2 karakter).");
      return;
    }

    startTransition(async () => {
      const res = await submitDailyStandupAction({
        ...formData,
        artifactProof: formData.artifactProof.trim() || null,
      });

      if (res.success) {
        setFormData({
          whatFinished: "",
          blocker: "",
          focusTomorrow: "",
          energyLevel: 3,
          moodLevel: 3,
          artifactProof: "",
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res.error || "Gagal menyimpan standup.");
      }
    });
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Screen container */}
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none md:items-center">
        <div className="w-full bg-card border border-card-border rounded-t-xl p-6 pointer-events-auto max-h-[90vh] overflow-y-auto shadow-xl md:rounded-lg md:max-w-lg md:w-full md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
          
          <div className="flex items-center justify-between border-b border-card-border pb-3 mb-4">
            <div>
              <h2 className="font-sans text-base font-bold text-foreground">Daily Standup Log</h2>
              <p className="font-sans text-[10px] text-muted-foreground mt-0.5 font-mono">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Q1: whatFinished */}
            <div>
              <label htmlFor="whatFinished" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                1. Apa yang selesai hari ini? (min. 10 karakter)
              </label>
              <textarea
                id="whatFinished"
                name="whatFinished"
                value={formData.whatFinished}
                onChange={handleChange}
                placeholder="Sebutkan tugas, PR yang di-merge, atau progres spesifik..."
                disabled={isPending}
                rows={3}
                className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 resize-none"
              />
              <div className="text-[9px] text-muted-foreground text-right mt-0.5 font-mono">
                {formData.whatFinished.length} karakter
              </div>
            </div>

            {/* Q2: blocker */}
            <div>
              <label htmlFor="blocker" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                2. Kendala / Blocker (ketik &quot;Tidak ada&quot; jika aman)
              </label>
              <input
                id="blocker"
                name="blocker"
                type="text"
                value={formData.blocker}
                onChange={handleChange}
                placeholder="Rincian masalah / hambatan teknis..."
                disabled={isPending}
                className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
              />
            </div>

            {/* Q3: focusTomorrow */}
            <div>
              <label htmlFor="focusTomorrow" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                3. Fokus esok hari? (min. 10 karakter)
              </label>
              <textarea
                id="focusTomorrow"
                name="focusTomorrow"
                value={formData.focusTomorrow}
                onChange={handleChange}
                placeholder="Prioritas kerja utama untuk esok hari..."
                disabled={isPending}
                rows={2}
                className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 resize-none"
              />
              <div className="text-[9px] text-muted-foreground text-right mt-0.5 font-mono">
                {formData.focusTomorrow.length} karakter
              </div>
            </div>

            {/* Wellness indicators */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tingkat Energi
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleLevelSelect("energyLevel", val)}
                      className={`flex-1 rounded py-1.5 font-mono text-xs font-bold transition border cursor-pointer ${
                        formData.energyLevel === val
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-card-border text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tingkat Mood
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleLevelSelect("moodLevel", val)}
                      className={`flex-1 rounded py-1.5 font-mono text-xs font-bold transition border cursor-pointer ${
                        formData.moodLevel === val
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-card-border text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Proof Artifact */}
            <div>
              <label htmlFor="artifactProof" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Tautan Bukti / Artifact Proof (Opsional)
              </label>
              <input
                id="artifactProof"
                name="artifactProof"
                type="text"
                value={formData.artifactProof}
                onChange={handleChange}
                placeholder="https://github.com/... or screenshot URL"
                disabled={isPending}
                className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="font-sans text-xs text-destructive text-center font-medium bg-destructive/10 border border-destructive/20 rounded py-1.5">
                {error}
              </p>
            )}

            {/* Actions footer */}
            <div className="flex justify-end gap-3 pt-2 border-t border-card-border">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded border border-card-border bg-background px-4 py-2 font-sans text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded bg-primary px-4 py-2 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Mengirim..." : "Kirim Standup"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
}
