"use server";

import { revalidatePath } from "next/cache";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { SkripsiRepository } from "../../repositories/SkripsiRepository";

const skripsiRepository = new SkripsiRepository();

interface AddDecisionOptionPayload {
  name: string;
  scores: {
    speed: number;
    relevance: number;
    portfolio: number;
    risk: number;
  };
}

/**
 * Server Action to add a title option to the Skripsi Decision Matrix.
 */
export async function addDecisionOptionAction(payload: AddDecisionOptionPayload) {
  // 1. Session verification check
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  // 2. Validate payload
  const { name, scores } = payload;
  if (!name || name.trim().length < 5) {
    return { success: false, error: "Nama judul skripsi minimal 5 karakter." };
  }
  if (name.length > 200) {
    return { success: false, error: "Nama judul skripsi maksimal 200 karakter." };
  }

  const { speed, relevance, portfolio, risk } = scores;
  const scoreKeys = { speed, relevance, portfolio, risk };
  for (const [key, val] of Object.entries(scoreKeys)) {
    if (typeof val !== "number" || val < 1 || val > 5) {
      return { success: false, error: `Nilai untuk kriteria ${key} harus di antara 1 dan 5.` };
    }
  }

  // 3. Save via repository
  try {
    await skripsiRepository.addDecisionOption(name.trim(), scores);
    revalidatePath("/skripsi");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to add decision option:", err);
    return { success: false, error: "Gagal menyimpan opsi judul." };
  }
}

/**
 * Server Action to finalize a Skripsi topic choice.
 */
export async function finalizeTopicAction(optionId: string) {
  // 1. Session verification check
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  if (!optionId) {
    return { success: false, error: "ID Opsi wajib dilampirkan." };
  }

  // 2. Save via repository
  try {
    await skripsiRepository.finalizeTopic(optionId);
    revalidatePath("/skripsi");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to finalize skripsi topic:", err);
    return { success: false, error: "Gagal memfinalkan judul skripsi." };
  }
}

/**
 * Server Action to toggle the completion status of a skripsi milestone subtask.
 */
export async function toggleSkripsiTaskAction(taskId: string, isCompleted: boolean) {
  // 1. Session verification check
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  if (!taskId) {
    return { success: false, error: "ID tugas wajib dilampirkan." };
  }

  // 2. Save via repository
  try {
    await skripsiRepository.toggleTaskStatus(taskId, isCompleted);
    revalidatePath("/skripsi");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to toggle task status:", err);
    return { success: false, error: "Gagal memperbarui status tugas." };
  }
}
