"use client";

import React, { useState, useTransition } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import SkillGoalCard from "../../components/SkillGoalCard";
import EmptyState from "../../components/EmptyState";
import { createSkillGoalAction } from "./actions";
import { Goal, Task } from "@prisma/client";

interface SkillBuildingClientProps {
  streakCount: number;
  initialGoals: (Goal & { tasks: Task[] })[];
}

type SkillCategory = "All" | "Homelab" | "Learning Path" | "Certification" | "Projects";

/**
 * SkillBuildingClient Component.
 * Tabs categories filter panel coordinating add drawers and mapping subtask cards.
 */
export default function SkillBuildingClient({ streakCount, initialGoals }: SkillBuildingClientProps) {
  const [activeTab, setActiveTab] = useState<SkillCategory>("All");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Exclude<SkillCategory, "All">>("Homelab");
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 2) {
      setError("Judul target minimal 2 karakter.");
      return;
    }

    startTransition(async () => {
      const res = await createSkillGoalAction(title, description || null, category);
      if (res.success) {
        setTitle("");
        setDescription("");
        setCategory("Homelab");
        setShowAddForm(false);
        // Switch to the newly created category tab
        setActiveTab(category);
      } else {
        setError(res.error || "Gagal menyimpan target.");
      }
    });
  };

  // Helper to parse category from goal title
  const getCategoryOfGoal = (goalTitle: string): Exclude<SkillCategory, "All"> => {
    if (goalTitle.startsWith("[Homelab]")) return "Homelab";
    if (goalTitle.startsWith("[Learning Path]")) return "Learning Path";
    if (goalTitle.startsWith("[Certification]")) return "Certification";
    if (goalTitle.startsWith("[Projects]")) return "Projects";
    return "Homelab"; // fallback
  };

  // Filter goals
  const filteredGoals = initialGoals.filter((goal) => {
    if (activeTab === "All") return true;
    return getCategoryOfGoal(goal.title) === activeTab;
  });

  const tabs = [
    { id: "All" as const, label: "Semua", icon: "🛠️" },
    { id: "Homelab" as const, label: "Homelab", icon: "🖥️" },
    { id: "Learning Path" as const, label: "Learning Path", icon: "🛣️" },
    { id: "Certification" as const, label: "Sertifikasi", icon: "🎓" },
    { id: "Projects" as const, label: "Projects", icon: "📁" },
  ];

  return (
    <DashboardLayout streakCount={streakCount}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Skill Building Engine
          </h2>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Bangun keahlian teknis Anda melalui penataan Homelab, Rencana Belajar, dan Proyek Portofolio.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded bg-primary px-4 py-2 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 cursor-pointer whitespace-nowrap align-self-start sm:align-self-auto"
        >
          {showAddForm ? "✕ Batal" : "+ Tambah Kompetensi"}
        </button>
      </div>

      {/* Slide-out Drawer */}
      {showAddForm && (
        <div className="rounded-lg border border-card-border bg-card p-6 shadow-sm max-w-lg mx-auto mb-6 animate-fade-in">
          <h4 className="font-sans text-xs font-bold text-foreground uppercase tracking-wider mb-4">
            Target Kompetensi Baru
          </h4>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="goalTitle" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Judul Target Kompetensi
                </label>
                <input
                  id="goalTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Rancang Nginx Reverse Proxy..."
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-background px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="category" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Kategori
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Exclude<SkillCategory, "All">)}
                  disabled={isPending}
                  className="w-full rounded border border-card-border bg-card px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 cursor-pointer"
                >
                  <option value="Homelab">Homelab</option>
                  <option value="Learning Path">Learning Path</option>
                  <option value="Certification">Certification</option>
                  <option value="Projects">Projects</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Deskripsi Singkat (Opsional)
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rincian target pembelajaran atau infrastruktur homelab..."
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
                {isPending ? "Menyimpan..." : "Kunci Target Kompetensi"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 rounded-lg border border-card-border bg-card p-1 max-w-2xl">
        {tabs.map((tab) => {
          const count = tab.id === "All"
            ? initialGoals.length
            : initialGoals.filter((g) => getCategoryOfGoal(g.title) === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded px-3.5 py-1.5 font-sans text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`font-mono text-[9px] font-bold px-1 py-0.2 rounded ${
                activeTab === tab.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards list */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => (
            <SkillGoalCard key={goal.id} goal={goal} />
          ))
        ) : (
          <div className="col-span-2 py-12">
            <EmptyState
              title={`Tidak Ada Target ${activeTab === "All" ? "" : activeTab}`}
              description="Buat target kompetensi baru untuk melacak langkah pencapaian Anda."
              icon="🛠️"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
