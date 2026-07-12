"use server";

import { revalidatePath } from "next/cache";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { DailyLogRepository } from "../../repositories/DailyLogRepository";

const logRepository = new DailyLogRepository();

interface SubmitStandupPayload {
  whatFinished: string;
  blocker: string;
  focusTomorrow: string;
  energyLevel: number;
  moodLevel: number;
  artifactProof?: string | null;
}

/**
 * Server Action to submit and write a new DailyLog.
 * Enforces session credentials, character limits, URL validity, and triggers cache refreshes.
 * 
 * @param payload - Inputs matching standup checklist questions.
 * @returns object - Success status or validation/session error messages.
 */
export async function submitDailyStandupAction(payload: SubmitStandupPayload) {
  // 1. Session validation check
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  // 2. Strict character length and value boundaries validation
  const { whatFinished, blocker, focusTomorrow, energyLevel, moodLevel, artifactProof } = payload;

  if (!whatFinished || whatFinished.trim().length < 10) {
    return { success: false, error: "Rincian tugas selesai minimal 10 karakter." };
  }
  if (whatFinished.length > 1000) {
    return { success: false, error: "Rincian tugas selesai maksimal 1000 karakter." };
  }

  if (!focusTomorrow || focusTomorrow.trim().length < 10) {
    return { success: false, error: "Target fokus esok hari minimal 10 karakter." };
  }
  if (focusTomorrow.length > 1000) {
    return { success: false, error: "Target fokus esok hari maksimal 1000 karakter." };
  }

  if (!blocker || blocker.trim().length < 2) {
    return { success: false, error: "Rincian kendala/blocker wajib diisi (minimal 2 karakter)." };
  }
  if (blocker.length > 500) {
    return { success: false, error: "Rincian kendala maksimal 500 karakter." };
  }

  if (energyLevel < 1 || energyLevel > 5) {
    return { success: false, error: "Tingkat energi tidak valid (1-5)." };
  }

  if (moodLevel < 1 || moodLevel > 5) {
    return { success: false, error: "Tingkat mood tidak valid (1-5)." };
  }

  // Verify URL regex for artifact proof link if provided
  if (artifactProof && artifactProof.trim() !== "") {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(artifactProof)) {
      return { success: false, error: "Format tautan bukti tidak valid. Masukkan URL penuh (http/https)." };
    }
  }

  // 3. Write record via transactional repository
  const res = await logRepository.createLog({
    loggedAt: new Date(),
    standupDone: true,
    whatFinished: whatFinished.trim(),
    blocker: blocker.trim(),
    focusTomorrow: focusTomorrow.trim(),
    energyLevel,
    moodLevel,
    artifactProof: artifactProof?.trim() || null,
  });

  if (res.success) {
    revalidatePath("/dashboard");
    return { success: true };
  } else {
    return { success: false, error: res.error };
  }
}
