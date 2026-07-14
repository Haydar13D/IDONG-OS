"use client";

import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import KanbanBoard from "../../components/KanbanBoard";
import CertificationTracker from "../../components/CertificationTracker";
import InterviewPrep from "../../components/InterviewPrep";
import { Application, Certification } from "@prisma/client";

interface JobReadinessClientProps {
  streakCount: number;
  initialApplications: Application[];
  initialCertifications: Certification[];
}

/**
 * JobReadinessClient Component.
 * Tabs controller managing view switches between Kanban Board, Certifications trackers,
 * and flashcard review panels.
 */
export default function JobReadinessClient({
  streakCount,
  initialApplications,
  initialCertifications,
}: JobReadinessClientProps) {
  const [activeTab, setActiveTab] = useState<"kanban" | "certs" | "interview">("kanban");

  const tabs = [
    { id: "kanban" as const, label: "Job Kanban", icon: "💼" },
    { id: "certs" as const, label: "Sertifikasi", icon: "🎓" },
    { id: "interview" as const, label: "Interview Q&A", icon: "💬" },
  ];

  return (
    <DashboardLayout streakCount={streakCount}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Job Readiness Portal
          </h2>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Persiapkan karir Anda melalui pelacakan lamaran, sertifikasi, dan modul review teknis.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex rounded-lg border border-card-border bg-card p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 font-sans text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 animate-fade-in">
        {activeTab === "kanban" && <KanbanBoard applications={initialApplications} />}
        {activeTab === "certs" && <CertificationTracker certifications={initialCertifications} />}
        {activeTab === "interview" && <InterviewPrep />}
      </div>
    </DashboardLayout>
  );
}
