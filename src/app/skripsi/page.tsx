import React from "react";
import { redirect } from "next/navigation";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { SkripsiRepository } from "../../repositories/SkripsiRepository";
import DashboardLayout from "../../components/DashboardLayout";
import DecisionMatrix from "../../components/DecisionMatrix";
import MilestoneChecklist from "../../components/MilestoneChecklist";
import prisma from "../../lib/db";

export const dynamic = "force-dynamic";

/**
 * SkripsiPage Server Component.
 * Route path: /skripsi. Serves candidate evaluations and progress tracking for the thesis.
 */
export default async function SkripsiPage() {
  // 1. Session verification check
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

  const repo = new SkripsiRepository();
  const activeGoal = await repo.getSkripsiGoal();
  const decisionRecord = await repo.getDecisionRecord();

  return (
    <DashboardLayout streakCount={config.currentStreak}>
      <div className="mb-6">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground">
          Skripsi &amp; Riset
        </h2>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Analisis judul skripsi via Decision Matrix dan pemantauan draf bab milestones.
        </p>
      </div>

      <div className="mt-6">
        {activeGoal ? (
          // Topic has been finalized, show Milestone Checklist
          <MilestoneChecklist
            goalTitle={activeGoal.title}
            goalDescription={activeGoal.description}
            tasks={activeGoal.tasks}
          />
        ) : (
          // Topic selection in progress, show Decision Matrix
          <DecisionMatrix record={decisionRecord} />
        )}
      </div>
    </DashboardLayout>
  );
}
