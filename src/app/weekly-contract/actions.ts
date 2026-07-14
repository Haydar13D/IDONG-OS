"use server";

import { revalidatePath } from "next/cache";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { WeeklyContractRepository } from "../../repositories/WeeklyContractRepository";

const contractRepository = new WeeklyContractRepository();

/**
 * Calculates ISO-8601 week number and year for a given date.
 */
function getWeekAndYear(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { weekNumber: weekNo, year: d.getUTCFullYear() };
}

interface CreateWeeklyContractPayload {
  commitments: Array<{ title: string; divisionSlug: string }>;
}

/**
 * Server Action to create a new Weekly Contract.
 */
export async function createWeeklyContractAction(payload: CreateWeeklyContractPayload) {
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
  const { commitments } = payload;
  if (!commitments || commitments.length !== 3) {
    return { success: false, error: "Kontrak mingguan harus memiliki tepat 3 komitmen." };
  }

  for (let i = 0; i < 3; i++) {
    const comm = commitments[i];
    if (!comm.title || comm.title.trim().length < 10) {
      return { success: false, error: `Rincian komitmen #${i + 1} minimal 10 karakter.` };
    }
    if (comm.title.length > 500) {
      return { success: false, error: `Rincian komitmen #${i + 1} maksimal 500 karakter.` };
    }
    if (!["skripsi", "job", "skill", "personal"].includes(comm.divisionSlug)) {
      return { success: false, error: `Divisi komitmen #${i + 1} tidak valid.` };
    }
  }

  // 3. Compute target ISO week and year
  const { weekNumber, year } = getWeekAndYear(new Date());

  // 4. Save via repository
  const res = await contractRepository.createContract(
    weekNumber,
    year,
    commitments.map((c) => ({
      title: c.title.trim(),
      divisionSlug: c.divisionSlug,
    }))
  );

  if (res.success) {
    revalidatePath("/dashboard");
    revalidatePath("/weekly-contract");
    return { success: true };
  } else {
    return { success: false, error: res.error };
  }
}

interface ReviewWeeklyContractPayload {
  contractId: string;
  completedTaskIds: string[];
  reviewNote: string;
}

/**
 * Server Action to review and evaluate an active weekly contract.
 */
export async function reviewWeeklyContractAction(payload: ReviewWeeklyContractPayload) {
  // 1. Session validation check
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  const { contractId, completedTaskIds, reviewNote } = payload;

  if (!contractId) {
    return { success: false, error: "ID kontrak mingguan wajib dilampirkan." };
  }

  if (reviewNote.length > 1000) {
    return { success: false, error: "Catatan evaluasi maksimal 1000 karakter." };
  }

  // 2. Call repository
  const res = await contractRepository.reviewContract(
    contractId,
    completedTaskIds,
    reviewNote.trim()
  );

  if (res.success) {
    revalidatePath("/dashboard");
    revalidatePath("/weekly-contract");
    return { success: true };
  } else {
    return { success: false, error: res.error };
  }
}
