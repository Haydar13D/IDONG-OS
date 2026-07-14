import React from "react";
import { redirect } from "next/navigation";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { JobRepository } from "../../repositories/JobRepository";
import JobReadinessClient from "./JobReadinessClient";
import prisma from "../../lib/db";

export const dynamic = "force-dynamic";

/**
 * JobReadinessPage Server Component.
 * Route path: /job-readiness. Hydrates DB applications and certifications to client dashboards.
 */
export default async function JobReadinessPage() {
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

  const repo = new JobRepository();
  const applications = await repo.getApplications();
  const certifications = await repo.getCertifications();

  return (
    <JobReadinessClient
      streakCount={config.currentStreak}
      initialApplications={applications}
      initialCertifications={certifications}
    />
  );
}
