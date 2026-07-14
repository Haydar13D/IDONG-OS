"use client";

import React, { useState, useTransition } from "react";
import { addDecisionOptionAction, finalizeTopicAction } from "../app/skripsi/actions";
import { PopulatedDecisionRecord } from "../repositories/SkripsiRepository";

interface DecisionMatrixProps {
  record: PopulatedDecisionRecord;
}

/**
 * DecisionMatrix Component.
 * Table view detailing title candidates, dynamic weighted rank computations,
 * and forms to add option rows.
 */
export default function DecisionMatrix({ record }: DecisionMatrixProps) {
  const [name, setName] = useState("");
  const [scores, setScores] = useState({ speed: 3, relevance: 3, portfolio: 3, risk: 3 });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleScoreSelect = (key: keyof typeof scores, val: number) => {
    setScores((prev) => ({ ...prev, [key]: val }));
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 5) {
      setError("Nama judul minimal 5 karakter.");
      return;
    }

    startTransition(async () => {
      const res = await addDecisionOptionAction({ name, scores });
      if (res.success) {
        setName("");
        setScores({ speed: 3, relevance: 3, portfolio: 3, risk: 3 });
      } else {
        setError(res.error || "Gagal menambahkan judul.");
      }
    });
  };

  const handleFinalize = (optionId: string) => {
    if (!confirm("Apakah Anda yakin ingin memfinalkan judul ini? Setelah difinalkan, judul tidak dapat diubah.")) {
      return;
    }
    startTransition(async () => {
      const res = await finalizeTopicAction(optionId);
      if (!res.success) {
        setError(res.error || "Gagal memfinalkan judul.");
      }
    });
  };

  // Process list with ranks and weighted scores
  const processedOptions = record.options.map((opt) => {
    const speedScore = opt.scores.find((s) => s.criteriaName === "Speed")?.scoreValue || 0;
    const relevanceScore = opt.scores.find((s) => s.criteriaName === "Relevance")?.scoreValue || 0;
    const portfolioScore = opt.scores.find((s) => s.criteriaName === "Portfolio Value")?.scoreValue || 0;
    const riskScore = opt.scores.find((s) => s.criteriaName === "Risk")?.scoreValue || 0;

    const weightedScore = parseFloat(
      (speedScore * 0.3 + relevanceScore * 0.3 + portfolioScore * 0.2 + riskScore * 0.2).toFixed(2)
    );

    return {
      ...opt,
      speedScore,
      relevanceScore,
      portfolioScore,
      riskScore,
      weightedScore,
    };
  });

  // Sort by weighted score descending
  processedOptions.sort((a, b) => b.weightedScore - a.weightedScore);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="rounded-lg border border-card-border bg-card p-6 shadow-sm">
        <h3 className="font-sans text-base font-bold text-foreground">Decision Matrix Pemilihan Judul</h3>
        <p className="font-sans text-xs text-muted-foreground mt-0.5 font-mono">
          Bobot Kriteria: Kelulusan (30%), Relevansi Karir (30%), Portofolio (20%), Rendah Risiko (20%).
        </p>

        {/* Matrix Table */}
        <div className="mt-6 overflow-x-auto border border-card-border rounded">
          <table className="w-full font-sans text-xs text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-card-border font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Opsi Judul Skripsi</th>
                <th className="px-3 py-3 text-center font-semibold">Speed (30%)</th>
                <th className="px-3 py-3 text-center font-semibold">Rel (30%)</th>
                <th className="px-3 py-3 text-center font-semibold">Port (20%)</th>
                <th className="px-3 py-3 text-center font-semibold">Safe (20%)</th>
                <th className="px-4 py-3 text-right font-semibold">Skor Akhir</th>
                <th className="px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {processedOptions.length > 0 ? (
                processedOptions.map((opt, index) => {
                  const isTopRank = index === 0;
                  return (
                    <tr
                      key={opt.id}
                      className={`hover:bg-muted/10 transition duration-150 ${
                        isTopRank ? "bg-success/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-foreground">
                        #{index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-sans text-xs font-semibold text-foreground">
                          {opt.name}
                        </div>
                        {isTopRank && (
                          <span className="inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[8px] font-semibold text-success uppercase mt-1">
                            ★ Rekomendasi
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono">{opt.speedScore}</td>
                      <td className="px-3 py-3.5 text-center font-mono">{opt.relevanceScore}</td>
                      <td className="px-3 py-3.5 text-center font-mono">{opt.portfolioScore}</td>
                      <td className="px-3 py-3.5 text-center font-mono">{opt.riskScore}</td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-foreground">
                        {opt.weightedScore.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleFinalize(opt.id)}
                          disabled={isPending}
                          className="rounded bg-primary px-2.5 py-1 font-sans text-[10px] font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 disabled:opacity-50 cursor-pointer"
                        >
                          Pilih
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-muted-foreground">
                    Belum ada opsi judul skripsi yang didaftarkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Options Box */}
      <div className="rounded-lg border border-card-border bg-card p-6 shadow-sm">
        <h3 className="font-sans text-base font-bold text-foreground">Tambah Kandidat Judul Baru</h3>
        <p className="font-sans text-xs text-muted-foreground mt-0.5">
          Daftarkan alternatif judul baru beserta penilaian estimasi kriteria harian.
        </p>

        <form onSubmit={handleAddOption} className="mt-5 space-y-4">
          <div>
            <label htmlFor="name" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Nama / Topik Judul Skripsi
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rancang Bangun Sistem Pertanian IoT..."
              disabled={isPending}
              className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { key: "speed" as const, label: "Speed (Lulus Cepat)" },
              { key: "relevance" as const, label: "Rel (Relasi Karir)" },
              { key: "portfolio" as const, label: "Port (Nilai Portofolio)" },
              { key: "risk" as const, label: "Safe (Rendah Resiko)" },
            ].map((crit) => (
              <div key={crit.key} className="space-y-1.5">
                <span className="block font-sans text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {crit.label}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleScoreSelect(crit.key, val)}
                      className={`flex-1 rounded py-1 font-mono text-[10px] font-bold border transition cursor-pointer ${
                        scores[crit.key] === val
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-background border-card-border text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="font-sans text-xs text-destructive text-center font-medium bg-destructive/10 border border-destructive/20 rounded py-1.5">
              {error}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-primary px-4 py-2 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "Menyimpan..." : "Tambahkan Judul"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
