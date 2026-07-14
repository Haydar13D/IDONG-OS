"use client";

import React, { useState, useTransition } from "react";
import { createCertificationAction, updateCertificationProgressAction } from "../app/job-readiness/actions";
import { Certification } from "@prisma/client";

interface CertificationTrackerProps {
  certifications: Certification[];
}

/**
 * CertificationTracker Component.
 * Lists active certification trackers and completion progress status actions.
 */
export default function CertificationTracker({ certifications }: CertificationTrackerProps) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [totalTask, setTotalTask] = useState(5);
  const [targetDate, setTargetDate] = useState("");
  const [resourceLink, setResourceLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Nama sertifikasi minimal 2 karakter.");
      return;
    }
    if (provider.trim().length < 2) {
      setError("Nama provider minimal 2 karakter.");
      return;
    }
    if (totalTask < 1) {
      setError("Jumlah modul minimal bernilai 1.");
      return;
    }

    startTransition(async () => {
      const res = await createCertificationAction({
        name,
        provider,
        totalTask,
        targetDate: targetDate || null,
        resourceLink: resourceLink || null,
      });

      if (res.success) {
        setName("");
        setProvider("");
        setTotalTask(5);
        setTargetDate("");
        setResourceLink("");
        setShowAddForm(false);
      } else {
        setError(res.error || "Gagal menyimpan sertifikasi.");
      }
    });
  };

  const handleIncrementProgress = (cert: Certification) => {
    if (cert.completedTask >= cert.totalTask) return;
    startTransition(async () => {
      await updateCertificationProgressAction(cert.id, cert.completedTask + 1, cert.totalTask);
    });
  };

  const handleDecrementProgress = (cert: Certification) => {
    if (cert.completedTask <= 0) return;
    startTransition(async () => {
      await updateCertificationProgressAction(cert.id, cert.completedTask - 1, cert.totalTask);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <h3 className="font-sans text-base font-bold text-foreground">Sertifikasi &amp; Kompetensi</h3>
          <p className="font-sans text-xs text-muted-foreground mt-0.5">
            Pantau modul pembelajaran dan target penyelesaian sertifikasi profesional Anda.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded bg-primary px-3 py-1.5 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 cursor-pointer"
        >
          {showAddForm ? "✕ Batal" : "+ Tambah Sertifikasi"}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-lg border border-card-border bg-card p-6 shadow-sm max-w-lg mx-auto animate-fade-in">
          <h4 className="font-sans text-xs font-bold text-foreground uppercase tracking-wider mb-4">
            Registrasi Target Sertifikasi Baru
          </h4>
          <form onSubmit={handleAddCert} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="certName" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Nama Sertifikasi
                </label>
                <input
                  id="certName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: AWS Cloud Practitioner..."
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="certProvider" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Lembaga / Provider
                </label>
                <input
                  id="certProvider"
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Contoh: Amazon Web Services..."
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="totalTask" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Jumlah Modul
                </label>
                <input
                  id="totalTask"
                  type="number"
                  value={totalTask}
                  onChange={(e) => setTotalTask(parseInt(e.target.value) || 0)}
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="targetDate" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Target Selesai (Tanggal)
                </label>
                <input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="resourceLink" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Tautan Sumber Belajar (Opsional)
              </label>
              <input
                id="resourceLink"
                type="text"
                value={resourceLink}
                onChange={(e) => setResourceLink(e.target.value)}
                placeholder="https://aws.training/..."
                disabled={isPending}
                className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
              />
            </div>

            {error && (
              <p className="font-sans text-xs text-destructive text-center font-medium bg-destructive/10 border border-destructive/20 rounded py-1.5">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="rounded bg-primary px-4 py-2 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Menyimpan..." : "Kunci Target Sertifikasi"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Certifications List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {certifications.length > 0 ? (
          certifications.map((cert) => {
            const percent = cert.totalTask > 0 ? Math.round((cert.completedTask / cert.totalTask) * 100) : 0;
            const isFinished = cert.completedTask === cert.totalTask;

            return (
              <div
                key={cert.id}
                className={`rounded-lg border border-card-border bg-card p-5 shadow-sm space-y-4 hover:border-muted-foreground/30 transition duration-150 relative ${
                  isFinished ? "bg-success/5" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-foreground">{cert.name}</h4>
                    <p className="font-sans text-[10px] text-muted-foreground mt-0.5">{cert.provider}</p>
                  </div>
                  {isFinished && (
                    <span className="inline-flex rounded-full bg-success/15 px-2.5 py-0.5 font-sans text-[9px] font-semibold text-success uppercase tracking-wider">
                      Lulus
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground">
                    <span>Modul Pembelajaran</span>
                    <span>{cert.completedTask} / {cert.totalTask} ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isFinished ? "bg-success" : "bg-primary"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-card-border/40 font-sans text-[9px] text-muted-foreground">
                  {cert.targetDate ? (
                    <span>Target: {new Date(cert.targetDate).toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" })}</span>
                  ) : (
                    <span>Tanpa target tanggal</span>
                  )}

                  {cert.resourceLink && (
                    <a
                      href={cert.resourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Sumber Belajar ↗
                    </a>
                  )}
                </div>

                {/* Progress Adjusters */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleDecrementProgress(cert)}
                    disabled={cert.completedTask <= 0 || isPending}
                    className="rounded border border-card-border bg-background px-2.5 py-1 text-center font-mono text-[10px] font-bold text-muted-foreground hover:text-foreground transition disabled:opacity-30 cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleIncrementProgress(cert)}
                    disabled={isFinished || isPending}
                    className="rounded border border-card-border bg-background px-2.5 py-1 text-center font-mono text-[10px] font-bold text-muted-foreground hover:text-foreground transition disabled:opacity-30 cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 rounded border border-dashed border-card-border p-8 text-center text-muted-foreground">
            Belum ada target sertifikasi yang didaftarkan.
          </div>
        )}
      </div>
    </div>
  );
}
