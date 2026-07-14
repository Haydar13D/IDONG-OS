import { DailyLog, WeeklyContract, Task, CompanyConfig, TaskStatus, ContractStatus } from "@prisma/client";
import prisma from "../lib/db";

export interface AnalyticsSummary {
  currentStreak: number;
  longestStreak: number;
  redFlagStatus: boolean;
  totalStandupsLogged: number;
  avgEnergyLevel: number;
  avgMoodLevel: number;
  dailyLogs: Array<{ date: string; energy: number; mood: number; logged: boolean }>;
  totalContracts: number;
  completedContracts: number;
  failedContracts: number;
  contractSuccessRate: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  divisionTaskRates: Array<{ name: string; completed: number; total: number; rate: number }>;
}

export interface IAnalyticsRepository {
  getAnalyticsSummary(): Promise<AnalyticsSummary>;
}

/**
 * AnalyticsRepository handles database queries and aggregations for reporting dashboards.
 */
export class AnalyticsRepository implements IAnalyticsRepository {
  private db = prisma;

  /**
   * Fetches and compiles all analytical metrics.
   */
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    // 1. Fetch CompanyConfig (Singleton with ID 1)
    let config = await this.db.companyConfig.findUnique({ where: { id: 1 } });
    if (!config) {
      config = await this.db.companyConfig.create({
        data: {
          id: 1,
          companyName: "IDONG OS",
          currentStreak: 0,
          longestStreak: 0,
          redFlagStatus: false,
        },
      });
    }

    // 2. Fetch past 90 days DailyLogs
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
    ninetyDaysAgo.setHours(0, 0, 0, 0);

    const logs = await this.db.dailyLog.findMany({
      where: {
        loggedAt: {
          gte: ninetyDaysAgo,
        },
      },
      orderBy: {
        loggedAt: "asc",
      },
    });

    // Populate daily entries for past 90 calendar days
    const dailyLogs: Array<{ date: string; energy: number; mood: number; logged: boolean }> = [];
    let sumEnergy = 0;
    let sumMood = 0;
    let countLogs30Days = 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    for (let i = 0; i < 90; i++) {
      const d = new Date(ninetyDaysAgo);
      d.setDate(d.getDate() + i);

      const start = new Date(d);
      start.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setHours(23, 59, 59, 999);

      const matchedLog = logs.find(
        (log) => new Date(log.loggedAt) >= start && new Date(log.loggedAt) <= end
      );

      if (matchedLog) {
        dailyLogs.push({
          date: d.toISOString(),
          energy: matchedLog.energyLevel,
          mood: matchedLog.moodLevel,
          logged: true,
        });
        if (d >= thirtyDaysAgo) {
          sumEnergy += matchedLog.energyLevel;
          sumMood += matchedLog.moodLevel;
          countLogs30Days++;
        }
      } else {
        dailyLogs.push({
          date: d.toISOString(),
          energy: 0,
          mood: 0,
          logged: false,
        });
      }
    }

    const avgEnergyLevel = countLogs30Days > 0 ? parseFloat((sumEnergy / countLogs30Days).toFixed(1)) : 0;
    const avgMoodLevel = countLogs30Days > 0 ? parseFloat((sumMood / countLogs30Days).toFixed(1)) : 0;

    // 3. Fetch Weekly Contracts metrics
    const contracts = await this.db.weeklyContract.findMany({});
    const totalContracts = contracts.length;
    const completedContracts = contracts.filter((c) => c.status === ContractStatus.COMPLETED).length;
    const failedContracts = contracts.filter((c) => c.status === ContractStatus.FAILED).length;
    const contractSuccessRate =
      completedContracts + failedContracts > 0
        ? Math.round((completedContracts / (completedContracts + failedContracts)) * 100)
        : 0;

    // 4. Fetch Tasks completion metrics
    const tasks = await this.db.task.findMany({
      include: {
        goal: {
          include: {
            division: true,
          },
        },
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Task metrics grouped by division
    const divisions = ["skripsi", "job", "skill", "personal"];
    const divisionLabels: Record<string, string> = {
      skripsi: "Skripsi & Riset",
      job: "Job Readiness",
      skill: "Skill Building",
      personal: "Organisasi & Personal",
    };

    const divisionTaskRates = divisions.map((slug) => {
      const divTasks = tasks.filter((t) => t.goal?.division?.slug === slug);
      const totalDiv = divTasks.length;
      const completedDiv = divTasks.filter((t) => t.status === TaskStatus.DONE).length;
      const rate = totalDiv > 0 ? Math.round((completedDiv / totalDiv) * 100) : 0;

      return {
        name: divisionLabels[slug] || slug,
        completed: completedDiv,
        total: totalDiv,
        rate,
      };
    });

    return {
      currentStreak: config.currentStreak,
      longestStreak: config.longestStreak,
      redFlagStatus: config.redFlagStatus,
      totalStandupsLogged: logs.length,
      avgEnergyLevel,
      avgMoodLevel,
      dailyLogs,
      totalContracts,
      completedContracts,
      failedContracts,
      contractSuccessRate,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      divisionTaskRates,
    };
  }
}
