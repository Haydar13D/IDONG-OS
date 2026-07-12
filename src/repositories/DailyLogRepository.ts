import { DailyLog } from "@prisma/client";
import prisma from "../lib/db";

/**
 * Interface detailing operational bounds for the DailyLog Repository.
 */
export interface IDailyLogRepository {
  createLog(data: Omit<DailyLog, "id" | "createdAt" | "updatedAt">): Promise<{ success: boolean; log?: DailyLog; error?: string }>;
  getTodayLog(): Promise<DailyLog | null>;
  getLogByDate(date: Date): Promise<DailyLog | null>;
  getLogsRange(startDate: Date, endDate: Date): Promise<DailyLog[]>;
}

/**
 * DailyLogRepository handles database operations and streak tracking calculations.
 */
export class DailyLogRepository implements IDailyLogRepository {
  private db = prisma;

  /**
   * Retrieves today's daily log entry.
   * 
   * @returns Promise<DailyLog | null> - Today's log if found.
   */
  async getTodayLog(): Promise<DailyLog | null> {
    return this.getLogByDate(new Date());
  }

  /**
   * Retrieves the daily log matching the calendar date (ignoring time components).
   * 
   * @param date - The target Date.
   * @returns Promise<DailyLog | null> - Log entry if found.
   */
  async getLogByDate(date: Date): Promise<DailyLog | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.db.dailyLog.findFirst({
      where: {
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  /**
   * Retrieves daily logs list within a date range (inclusive).
   * 
   * @param startDate - Range start date.
   * @param endDate - Range end date.
   * @returns Promise<DailyLog[]> - List of matching daily logs.
   */
  async getLogsRange(startDate: Date, endDate: Date): Promise<DailyLog[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.db.dailyLog.findMany({
      where: {
        loggedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        loggedAt: "asc",
      },
    });
  }

  /**
   * Writes a new DailyLog row and updates current/longest streaks inside a Prisma transaction.
   * 
   * @param data - The standalone daily log parameters.
   * @returns Promise - Success state and written row details.
   */
  async createLog(
    data: Omit<DailyLog, "id" | "createdAt" | "updatedAt">
  ): Promise<{ success: boolean; log?: DailyLog; error?: string }> {
    try {
      const result = await this.db.$transaction(async (tx) => {
        const startOfDay = new Date(data.loggedAt);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(data.loggedAt);
        endOfDay.setHours(23, 59, 59, 999);

        // Enforce uniqueness for calendar date
        const existing = await tx.dailyLog.findFirst({
          where: {
            loggedAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        if (existing) {
          throw new Error("DUP_LOG");
        }

        // Write DailyLog
        const log = await tx.dailyLog.create({
          data,
        });

        // Hydrate config row (ensure it exists)
        let config = await tx.companyConfig.findUnique({
          where: { id: 1 },
        });

        if (!config) {
          config = await tx.companyConfig.create({
            data: {
              id: 1,
              companyName: "IDONG OS",
              currentStreak: 0,
              longestStreak: 0,
              redFlagStatus: false,
            },
          });
        }

        // Verify if yesterday had an active standup log
        const yesterday = new Date(data.loggedAt);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday);
        startOfYesterday.setHours(0, 0, 0, 0);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);

        const yesterdayLog = await tx.dailyLog.findFirst({
          where: {
            loggedAt: {
              gte: startOfYesterday,
              lte: endOfYesterday,
            },
          },
        });

        let newStreak = 1;
        // If yesterday has log, streak continues. Otherwise, resets to 1.
        if (yesterdayLog) {
          newStreak = config.currentStreak + 1;
        }

        const newLongestStreak = Math.max(config.longestStreak, newStreak);

        // Write Config updates
        await tx.companyConfig.update({
          where: { id: 1 },
          data: {
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            redFlagStatus: false,
            lastStreakReset: new Date(),
          },
        });

        return log;
      });

      return { success: true, log: result };
    } catch (err: any) {
      if (err.message === "DUP_LOG") {
        return { success: false, error: "Standup harian sudah diisi untuk hari ini." };
      }
      console.error("DailyLog transaction failed:", err);
      return { success: false, error: "Terjadi kesalahan sistem saat menyimpan log." };
    }
  }
}
