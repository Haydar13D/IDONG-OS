import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import WidgetGrid from "../../components/WidgetGrid";
import EmptyState from "../../components/EmptyState";

/**
 * DashboardPage Server Component.
 * Sourced at /dashboard, rendering the empty widget layouts.
 */
export default function DashboardPage() {
  return (
    <DashboardLayout pageTitle="Dashboard">
      <WidgetGrid columns="3-column">
        {/* Slot 1: Skripsi Overview */}
        <div className="flex h-48 flex-col justify-between rounded-lg border border-card-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skripsi & Riset</span>
            <span className="text-xs">🎓</span>
          </div>
          <EmptyState 
            title="Belum ada judul" 
            description="Lakukan skoring topik skripsi di menu Skripsi." 
            icon="🎓"
          />
        </div>

        {/* Slot 2: Job Readiness Kanban summary */}
        <div className="flex h-48 flex-col justify-between rounded-lg border border-card-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Job Readiness</span>
            <span className="text-xs">💼</span>
          </div>
          <EmptyState 
            title="Kanban Kosong" 
            description="Tambahkan wishlist lamaran pekerjaan baru." 
            icon="💼"
          />
        </div>

        {/* Slot 3: Skill Building Progress */}
        <div className="flex h-48 flex-col justify-between rounded-lg border border-card-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Skill Building</span>
            <span className="text-xs">🛠️</span>
          </div>
          <EmptyState 
            title="Tidak ada sertifikasi" 
            description="Buat target sertifikasi di menu Skill." 
            icon="🛠️"
          />
        </div>

        {/* Slot 4: Weekly Commitments Progress */}
        <div className="flex h-48 flex-col justify-between rounded-lg border border-card-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weekly Contract</span>
            <span className="text-xs">✍️</span>
          </div>
          <EmptyState 
            title="Kontrak Kosong" 
            description="Commit target output minggu ini terlebih dahulu." 
            icon="✍️"
          />
        </div>

        {/* Slot 5: Daily Standup status logs */}
        <div className="flex h-48 flex-col justify-between rounded-lg border border-card-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Standup</span>
            <span className="text-xs">📢</span>
          </div>
          <EmptyState 
            title="Belum standup" 
            description="Log aktivitas harian kamu malam ini." 
            icon="📢"
          />
        </div>

        {/* Slot 6: Recent Activity Audit list */}
        <div className="flex h-48 flex-col justify-between rounded-lg border border-card-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-card-border pb-2">
            <span className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aktivitas Terbaru</span>
            <span className="text-xs">⏱️</span>
          </div>
          <EmptyState 
            title="Belum ada aktivitas" 
            description="Aktivitas sistem terbaru akan terekam di sini." 
            icon="⏱️"
          />
        </div>
      </WidgetGrid>
    </DashboardLayout>
  );
}
