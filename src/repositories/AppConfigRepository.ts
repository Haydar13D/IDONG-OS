import { CompanyConfig } from "@prisma/client";
import prisma from "../lib/db";

/**
 * Interface defining the operational contract for the AppConfig repository.
 */
export interface IAppConfigRepository {
  getConfig(): Promise<CompanyConfig | null>;
  updateConfig(data: Partial<Omit<CompanyConfig, "id" | "createdAt" | "updatedAt">>): Promise<CompanyConfig>;
  initializeConfig(data?: Partial<CompanyConfig>): Promise<CompanyConfig>;
  deleteConfig(): Promise<CompanyConfig | null>;
}

/**
 * AppConfigRepository implements singleton CRUD operations for the CompanyConfig table.
 */
export class AppConfigRepository implements IAppConfigRepository {
  private db = prisma;

  /**
   * Retrieve the singleton configuration row (ID = 1).
   * 
   * @returns Promise<CompanyConfig | null> - The configuration row if found.
   */
  async getConfig(): Promise<CompanyConfig | null> {
    return this.db.companyConfig.findUnique({
      where: { id: 1 },
    });
  }

  /**
   * Update the singleton configuration row (ID = 1).
   * If the configuration row does not exist, it will be automatically initialized.
   * 
   * @param data - Partial fields to update on the config model.
   * @returns Promise<CompanyConfig> - The updated configuration row.
   */
  async updateConfig(
    data: Partial<Omit<CompanyConfig, "id" | "createdAt" | "updatedAt">>
  ): Promise<CompanyConfig> {
    return this.db.companyConfig.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        companyName: data.companyName ?? "IDONG OS",
        currentStreak: data.currentStreak ?? 0,
        longestStreak: data.longestStreak ?? 0,
        redFlagStatus: data.redFlagStatus ?? false,
        lastStreakReset: data.lastStreakReset ?? new Date(),
      },
    });
  }

  /**
   * Initializes the configuration row with default settings if not already present.
   * 
   * @param data - Optional default overrides.
   * @returns Promise<CompanyConfig> - The initialized configuration row.
   */
  async initializeConfig(data?: Partial<CompanyConfig>): Promise<CompanyConfig> {
    return this.db.companyConfig.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        companyName: data?.companyName ?? "IDONG OS",
        currentStreak: data?.currentStreak ?? 0,
        longestStreak: data?.longestStreak ?? 0,
        redFlagStatus: data?.redFlagStatus ?? false,
        lastStreakReset: data?.lastStreakReset ?? new Date(),
      },
    });
  }

  /**
   * Deletes the singleton configuration row (ID = 1) if it exists.
   * Typically used in cleanup or resets.
   * 
   * @returns Promise<CompanyConfig | null> - The deleted configuration row or null if not found.
   */
  async deleteConfig(): Promise<CompanyConfig | null> {
    try {
      return await this.db.companyConfig.delete({
        where: { id: 1 },
      });
    } catch {
      return null;
    }
  }
}
