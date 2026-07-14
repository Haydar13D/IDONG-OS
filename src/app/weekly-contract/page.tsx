import React from "react";
import { redirect } from "next/navigation";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { WeeklyContractRepository } from "../../repositories/WeeklyContractRepository";
import DashboardLayout from "../../components/DashboardLayout";
import WeeklyContractForm from "../../components/WeeklyContractForm";
import WeeklyContractReview from "../../components/WeeklyContractReview";
import prisma from "../../lib/db";

export const dynamic = "force-dynamic";

/**
 * Calculates current calendar ISO-8601 week number and year.
 */
function getWeekAndYear(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { weekNumber: weekNo, year: d.getUTCFullYear() };
}

/**
 * WeeklyContractPage Server Component.
 * Route path: /weekly-contract. Manages weekly objectives definition, checklist verification,
 * and highlights completed commitment scores.
 */
export default async function WeeklyContractPage() {
  // 1. Session credentials authorization check
  const token = getSessionCookie();
  if (!token) {
    redirect("/login");
  }

  const session = await decryptSession(token);
  if (!session) {
    redirect("/login");
  }

  // Fetch company config for dynamic header streak values
  let config = await prisma.companyConfig.findUnique({ where: { id: 1 } });
  if (!config) {
    config = await prisma.companyConfig.create({
      data: {
        id: 1,
        companyName: "IDONG OS",
        currentStreak: 0,
        longestStreak: 0,
        redFlagStatus: false,
      },
    });
  }

  const repo = new WeeklyContractRepository();
  const { weekNumber, year } = getWeekAndYear(new Date());
  const contract = await repo.getActiveContract(weekNumber, year);

  return (
    <DashboardLayout streakCount={config.currentStreak}>
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground animate-fade-in">
          Weekly Contract
        </h2>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Pilar akuntabilitas mingguan dan target evaluasi komitmen harian.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center">
        {!contract ? (
          // Form for creating weekly commitments
          <WeeklyContractForm weekNumber={weekNumber} year={year} />
        ) : contract.status === "ACTIVE" ? (
          // Review panel for active objectives
          <WeeklyContractReview contract={contract} />
        ) : (
          // Summary overview for finished/reviewed contracts
          <div className="w-full max-w-xl mx-auto rounded-lg border border-card-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-card-border pb-3 mb-6">
              <div>
                <h3 className="font-sans text-base font-bold text-foreground">Ringkasan Kontrak Mingguan</h3>
                <p className="font-sans text-[10px] text-muted-foreground mt-0.5 font-mono">
                  Minggu {contract.weekNumber}, Tahun {contract.year}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[10px] font-semibold border ${
                  contract.status === "COMPLETED"
                    ? "bg-success/15 text-success border-success/30"
                    : "bg-destructive/15 text-destructive border-destructive/30"
                }`}
              >
                {contract.status === "COMPLETED" ? "LULUS" : "GAGAL"}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Daftar Target Komitmen
                </span>
                <div className="space-y-2">
                  {contract.commitments.map((comm) => (
                    <div
                      key={comm.id}
                      className="flex items-center justify-between rounded border border-card-border bg-background p-3"
                    >
                      <span className="font-sans text-xs text-foreground">{comm.task.title}</span>
                      <span
                        className={`font-sans text-[9px] font-semibold uppercase px-2 py-0.5 rounded ${
                          comm.task.status === "DONE"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {comm.task.status === "DONE" ? "Selesai" : "Batal"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review metrics */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-card-border">
                <div>
                  <span className="block font-sans text-[9px] text-muted-foreground uppercase tracking-wider">
                    Nilai Pencapaian
                  </span>
                  <span className="font-sans text-2xl font-bold text-foreground mt-1 block">
                    {Math.round(contract.score * 100)}%
                  </span>
                </div>
                <div>
                  <span className="block font-sans text-[9px] text-muted-foreground uppercase tracking-wider">
                    Evaluasi Akhir
                  </span>
                  <span
                    className={`font-sans text-xs font-semibold mt-2.5 inline-block ${
                      contract.status === "COMPLETED" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {contract.status === "COMPLETED" ? "Memenuhi Target" : "Gagal / Reset Streak"}
                  </span>
                </div>
              </div>

              {/* Review reflections */}
              {contract.reviewNote && (
                <div className="space-y-1">
                  <span className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Catatan Evaluasi
                  </span>
                  <p className="font-sans text-xs text-foreground bg-background p-3 rounded border border-card-border leading-relaxed">
                    {contract.reviewNote}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
