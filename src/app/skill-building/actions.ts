"use server";

import { revalidatePath } from "next/cache";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { SkillRepository } from "../../repositories/SkillRepository";

const skillRepository = new SkillRepository();

/**
 * Server Action to create a new Skill Building Goal.
 */
export async function createSkillGoalAction(
  title: string,
  description: string | null,
  category: "Homelab" | "Learning Path" | "Certification" | "Projects"
) {
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  if (!title || title.trim().length < 2) {
    return { success: false, error: "Judul target minimal 2 karakter." };
  }

  try {
    await skillRepository.createSkillGoal(title, description, category);
    revalidatePath("/skill-building");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to create skill goal:", err);
    return { success: false, error: "Gagal menyimpan target kompetensi." };
  }
}

/**
 * Server Action to append a subtask/milestone.
 */
export async function addGoalTaskAction(goalId: string, title: string) {
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  if (!goalId) {
    return { success: false, error: "ID target wajib dilampirkan." };
  }
  if (!title || title.trim().length < 2) {
    return { success: false, error: "Detail subtarget minimal 2 karakter." };
  }

  try {
    await skillRepository.addGoalTask(goalId, title);
    revalidatePath("/skill-building");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to add subtask:", err);
    return { success: false, error: "Gagal menyimpan subtarget." };
  }
}

/**
 * Server Action to toggle subtask check state.
 */
export async function toggleSkillTaskAction(taskId: string, isCompleted: boolean) {
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  if (!taskId) {
    return { success: false, error: "ID subtask wajib dilampirkan." };
  }

  try {
    await skillRepository.toggleTaskStatus(taskId, isCompleted);
    revalidatePath("/skill-building");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to toggle subtask status:", err);
    return { success: false, error: "Gagal memperbarui status subtarget." };
  }
}

/**
 * Server Action to delete a subtask.
 */
export async function deleteGoalTaskAction(taskId: string) {
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  if (!taskId) {
    return { success: false, error: "ID subtask wajib dilampirkan." };
  }

  try {
    await skillRepository.deleteGoalTask(taskId);
    revalidatePath("/skill-building");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete subtask:", err);
    return { success: false, error: "Gagal menghapus subtarget." };
  }
}

/**
 * Server Action to delete a goal.
 */
export async function deleteSkillGoalAction(goalId: string) {
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  if (!goalId) {
    return { success: false, error: "ID target wajib dilampirkan." };
  }

  try {
    await skillRepository.deleteSkillGoal(goalId);
    revalidatePath("/skill-building");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to delete goal:", err);
    return { success: false, error: "Gagal menghapus target kompetensi." };
  }
}
