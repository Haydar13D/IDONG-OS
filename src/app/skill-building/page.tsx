import React from "react";
import { redirect } from "next/navigation";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { SkillRepository } from "../../repositories/SkillRepository";
import SkillBuildingClient from "./SkillBuildingClient";
import prisma from "../../lib/db";

export const dynamic = "force-dynamic";

/**
 * SkillBuildingPage Server Component.
 * Route path: /skill-building. Serves homelabs checklist, learning path milestones,
 * and portfolio projects.
 */
export default async function SkillBuildingPage() {
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

  const repo = new SkillRepository();
  const goals = await repo.getSkillGoals();

  return (
    <SkillBuildingClient
      streakCount={config.currentStreak}
      initialGoals={goals}
    />
  );
}
