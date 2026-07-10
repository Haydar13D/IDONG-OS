"use server";

import { revalidatePath } from "next/cache";
import { AppConfigRepository } from "../../repositories/AppConfigRepository";

const repository = new AppConfigRepository();

/**
 * Retrieves the current settings. If not initialized, it automatically
 * hydrates defaults.
 */
export async function getSettings() {
  try {
    const config = await repository.getConfig();
    if (!config) {
      return await repository.initializeConfig();
    }
    return config;
  } catch (error) {
    console.error("Failed to get settings:", error);
    throw new Error("Failed to load settings.");
  }
}

/**
 * Server Action to write settings updates to the database.
 */
export async function updateSettingsAction(data: {
  theme: string;
  timezone: string;
  dailyReminder: string;
  weeklyReminder: string;
  dashboardLayout: string;
  companyName?: string;
}) {
  try {
    const updated = await repository.updateConfig(data);
    
    // Clear and refresh path caches
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    
    return { success: true, settings: updated };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, error: "Failed to update settings." };
  }
}
