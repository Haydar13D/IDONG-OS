"use client";

import React, { useState, useTransition } from "react";
import { createApplicationAction, transitionApplicationAction } from "../app/job-readiness/actions";
import { Application, ApplicationStatus } from "@prisma/client";

interface KanbanBoardProps {
  applications: Application[];
}

/**
 * KanbanBoard Component.
 * Interactive job application board displaying pipeline stages and shift controllers.
 */
export default function KanbanBoard({ applications }: KanbanBoardProps) {
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>(ApplicationStatus.WISHLIST);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAddApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (company.trim().length < 2) {
      setError("Nama perusahaan minimal 2 karakter.");
      return;
    }
    if (position.trim().length < 2) {
      setError("Nama posisi minimal 2 karakter.");
      return;
    }

    startTransition(async () => {
      const res = await createApplicationAction({
        company,
        position,
        status,
        notes: notes.trim() || null,
      });

      if (res.success) {
        setCompany("");
        setPosition("");
        setStatus(ApplicationStatus.WISHLIST);
        setNotes("");
        setShowAddForm(false);
      } else {
        setError(res.error || "Gagal menyimpan lamaran.");
      }
    });
  };

  const handleShiftStatus = (id: string, currentStatus: ApplicationStatus, direction: "left" | "right") => {
    const stages = [
      ApplicationStatus.WISHLIST,
      ApplicationStatus.APPLIED,
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.OFFER,
      ApplicationStatus.REJECTED,
    ];
    const currentIndex = stages.indexOf(currentStatus);
    let nextIndex = currentIndex + (direction === "right" ? 1 : -1);

    if (nextIndex >= 0 && nextIndex < stages.length) {
      startTransition(async () => {
        await transitionApplicationAction(id, stages[nextIndex]);
      });
    }
  };

  const columns = [
    { label: "Wishlist", status: ApplicationStatus.WISHLIST, color: "border-t-muted-foreground bg-muted/5" },
    { label: "Applied", status: ApplicationStatus.APPLIED, color: "border-t-primary bg-primary/5" },
    { label: "Interview", status: ApplicationStatus.INTERVIEW, color: "border-t-warning bg-warning/5" },
    { label: "Offer", status: ApplicationStatus.OFFER, color: "border-t-success bg-success/5" },
    { label: "Rejected", status: ApplicationStatus.REJECTED, color: "border-t-destructive bg-destructive/5" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <h3 className="font-sans text-base font-bold text-foreground">Job Pipeline Kanban</h3>
          <p className="font-sans text-xs text-muted-foreground mt-0.5">
            Pantau kemajuan lamaran kerja Anda di berbagai tahapan rekrutmen.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded bg-primary px-3 py-1.5 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 cursor-pointer"
        >
          {showAddForm ? "✕ Batal" : "+ Tambah Lamaran"}
        </button>
      </div>

      {/* Slide-out Add Application Form Drawer */}
      {showAddForm && (
        <div className="rounded-lg border border-card-border bg-card p-6 shadow-sm max-w-lg mx-auto">
          <h4 className="font-sans text-xs font-bold text-foreground uppercase tracking-wider mb-4">
            Pendaftaran Lamaran Kerja Baru
          </h4>
          <form onSubmit={handleAddApplication} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Nama Perusahaan
                </label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Contoh: Shopee, Tokopedia..."
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="position" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Posisi Pekerjaan
                </label>
                <input
                  id="position"
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Frontend Engineer..."
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="status" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Tahapan Awal
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-card px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 cursor-pointer"
                >
                  <option value={ApplicationStatus.WISHLIST}>Wishlist</option>
                  <option value={ApplicationStatus.APPLIED}>Applied</option>
                  <option value={ApplicationStatus.INTERVIEW}>Interview</option>
                  <option value={ApplicationStatus.OFFER}>Offer</option>
                </select>
              </div>
              <div>
                <label htmlFor="notes" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  id="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Persiapan resume, kualifikasi..."
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
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
                {isPending ? "Menyimpan..." : "Tambahkan Lamaran"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colApps = applications.filter((app) => app.status === col.status);
          return (
            <div
              key={col.status}
              className={`rounded-lg border-t-2 border-x border-b border-card-border p-3 min-h-[30rem] flex flex-col gap-3 transition ${col.color}`}
            >
              <div className="flex items-center justify-between border-b border-card-border pb-2 mb-1">
                <span className="font-sans text-xs font-bold text-foreground">{col.label}</span>
                <span className="font-mono text-[9px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {colApps.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[40rem]">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className="rounded border border-card-border bg-card p-3.5 shadow-sm space-y-2 hover:border-muted-foreground/30 transition duration-150 relative group"
                  >
                    <div>
                      <h5 className="font-sans text-xs font-bold text-foreground leading-tight">
                        {app.position}
                      </h5>
                      <p className="font-sans text-[10px] text-muted-foreground mt-0.5">
                        {app.company}
                      </p>
                    </div>

                    {app.notes && (
                      <p className="font-sans text-[9px] text-muted-foreground leading-relaxed bg-background/50 p-1.5 rounded border border-card-border/30">
                        {app.notes}
                      </p>
                    )}

                    {app.appliedDate && (
                      <span className="block font-mono text-[8px] text-muted-foreground uppercase mt-1">
                        Applied: {new Date(app.appliedDate).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}
                      </span>
                    )}

                    {/* Shift controllers */}
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-card-border/40">
                      <button
                        onClick={() => handleShiftStatus(app.id, app.status, "left")}
                        disabled={app.status === ApplicationStatus.WISHLIST || isPending}
                        className="rounded hover:bg-muted p-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        title="Shift Left"
                      >
                        ◀
                      </button>
                      <span className="font-mono text-[8px] text-muted-foreground uppercase tracking-wider">
                        Move
                      </span>
                      <button
                        onClick={() => handleShiftStatus(app.id, app.status, "right")}
                        disabled={app.status === ApplicationStatus.REJECTED || isPending}
                        className="rounded hover:bg-muted p-1 text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        title="Shift Right"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                ))}

                {colApps.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 border border-dashed border-card-border rounded text-center">
                    <span className="text-lg text-muted-foreground/40 mb-1">📭</span>
                    <span className="font-sans text-[9px] text-muted-foreground">Kosong</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
