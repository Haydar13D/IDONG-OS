import React from "react";
import prisma from "../../lib/db";
import DashboardPageClient from "./DashboardPageClient";

export const dynamic = "force-dynamic";

/**
 * DashboardPage Server Component.
 * Sourced at /dashboard. Queries database configurations, audit trails, and daily standup records
 * before hydrating Client views.
 */
export default async function DashboardPage() {
  // 1. Hydrate or retrieve CompanyConfig
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

  // 2. Detect if standup has been submitted today
  const today = new Date();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const todayLog = await prisma.dailyLog.findFirst({
    where: {
      loggedAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  });

  const standupPending = !todayLog;

  // 3. Query today's focus (loads focusTomorrow from the most recent historical log)
  const lastLog = await prisma.dailyLog.findFirst({
    where: {
      loggedAt: {
        lt: startOfToday,
      },
    },
    orderBy: {
      loggedAt: "desc",
    },
  });

  const todayFocus = lastLog ? lastLog.focusTomorrow : null;

  // 4. Fetch latest 3 AuditLogs or render system defaults
  const auditLogs = await prisma.auditLog.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  const recentActivities = auditLogs.length > 0
    ? auditLogs.map((log) => {
        const diffMs = Date.now() - new Date(log.createdAt).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        let timeStr = "Baru saja";
        if (diffHours > 0) {
          timeStr = `${diffHours} jam yang lalu`;
        } else if (diffMins > 0) {
          timeStr = `${diffMins} menit yang lalu`;
        }
        return {
          id: log.id,
          event: log.event.replace(/_/g, " "), // Format event string labels
          time: timeStr,
          details: log.details || "",
        };
      })
    : [
        { id: "mock-1", event: "Membangun Lapisan Fondasi", time: "1 jam yang lalu", details: "Menyelesaikan setup Next.js & database SQLite" },
        { id: "mock-2", event: "Migrasi Database Selesai", time: "2 jam yang lalu", details: "Menambahkan kolom setelan AppConfig" },
        { id: "mock-3", event: "Inisialisasi Project", time: "1 hari yang lalu", details: "Seeding divisi Skripsi, Job, Skill, Personal" },
      ];

  // 5. Generate past 30 days checks array for absensi calendar widget
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const startOfPeriod = new Date(thirtyDaysAgo);
  startOfPeriod.setHours(0, 0, 0, 0);

  const monthLogs = await prisma.dailyLog.findMany({
    where: {
      loggedAt: {
        gte: startOfPeriod,
      },
    },
    select: {
      loggedAt: true,
    },
  });

  const historyLogs = [];
  for (let i = 0; i < 30; i++) {
    const day = new Date(thirtyDaysAgo);
    day.setDate(day.getDate() + i);

    const startOfCurrentDay = new Date(day);
    startOfCurrentDay.setHours(0, 0, 0, 0);
    const endOfCurrentDay = new Date(day);
    endOfCurrentDay.setHours(23, 59, 59, 999);

    // Check if daily logs database matches target calendar date
    const matched = monthLogs.some(
      (log) =>
        new Date(log.loggedAt) >= startOfCurrentDay &&
        new Date(log.loggedAt) <= endOfCurrentDay
    );

    historyLogs.push({
      date: day.toISOString(),
      done: matched,
    });
  }

  return (
    <DashboardPageClient
      initialData={{
        currentStreak: config.currentStreak,
        longestStreak: config.longestStreak,
        redFlagStatus: config.redFlagStatus,
        standupPending,
        todayFocus,
        recentActivities,
        historyLogs,
      }}
    />
  );
}
