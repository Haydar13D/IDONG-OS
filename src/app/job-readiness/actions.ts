"use server";

import { revalidatePath } from "next/cache";
import { getSessionCookie } from "../../lib/cookies";
import { decryptSession } from "../../lib/session";
import { JobRepository } from "../../repositories/JobRepository";
import { ApplicationStatus } from "@prisma/client";

const jobRepository = new JobRepository();

interface CreateApplicationPayload {
  company: string;
  position: string;
  status: ApplicationStatus;
  notes?: string | null;
}

/**
 * Server Action to add a new job application.
 */
export async function createApplicationAction(payload: CreateApplicationPayload) {
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  const { company, position, status, notes } = payload;
  if (!company || company.trim().length < 2) {
    return { success: false, error: "Nama perusahaan minimal 2 karakter." };
  }
  if (!position || position.trim().length < 2) {
    return { success: false, error: "Nama posisi minimal 2 karakter." };
  }

  try {
    await jobRepository.createApplication({
      company: company.trim(),
      position: position.trim(),
      status,
      notes: notes?.trim() || null,
      appliedDate: status === ApplicationStatus.APPLIED ? new Date() : null,
    });

    revalidatePath("/job-readiness");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to create application:", err);
    return { success: false, error: "Gagal menyimpan lamaran kerja." };
  }
}

/**
 * Server Action to transition a job application status.
 */
export async function transitionApplicationAction(id: string, status: ApplicationStatus) {
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  if (!id) {
    return { success: false, error: "ID lamaran wajib dilampirkan." };
  }

  try {
    await jobRepository.updateApplicationStatus(id, status);
    revalidatePath("/job-readiness");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to transition application:", err);
    return { success: false, error: "Gagal memperbarui status lamaran." };
  }
}

interface CreateCertificationPayload {
  name: string;
  provider: string;
  totalTask: number;
  targetDate?: string | null;
  resourceLink?: string | null;
}

/**
 * Server Action to create a new certification track.
 */
export async function createCertificationAction(payload: CreateCertificationPayload) {
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  const { name, provider, totalTask, targetDate, resourceLink } = payload;
  if (!name || name.trim().length < 2) {
    return { success: false, error: "Nama sertifikasi minimal 2 karakter." };
  }
  if (!provider || provider.trim().length < 2) {
    return { success: false, error: "Nama provider/lembaga minimal 2 karakter." };
  }
  if (typeof totalTask !== "number" || totalTask < 1) {
    return { success: false, error: "Jumlah modul tugas minimal bernilai 1." };
  }

  try {
    await jobRepository.createCertification({
      name: name.trim(),
      provider: provider.trim(),
      completedTask: 0,
      totalTask,
      targetDate: targetDate ? new Date(targetDate) : null,
      resourceLink: resourceLink?.trim() || null,
    });

    revalidatePath("/job-readiness");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to create certification:", err);
    return { success: false, error: "Gagal menyimpan sertifikasi." };
  }
}

/**
 * Server Action to update certification progress.
 */
export async function updateCertificationProgressAction(id: string, completedTask: number, totalTask: number) {
  const token = getSessionCookie();
  if (!token) {
    return { success: false, error: "Sesi Anda telah habis. Silakan login kembali." };
  }

  const session = await decryptSession(token);
  if (!session) {
    return { success: false, error: "Otorisasi tidak sah. Akses ditolak." };
  }

  if (!id) {
    return { success: false, error: "ID sertifikasi wajib dilampirkan." };
  }

  try {
    await jobRepository.updateCertificationProgress(id, completedTask, totalTask);
    revalidatePath("/job-readiness");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update certification progress:", err);
    return { success: false, error: "Gagal memperbarui progres sertifikasi." };
  }
}
