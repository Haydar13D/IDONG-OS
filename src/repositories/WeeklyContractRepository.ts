import { WeeklyContract, WeeklyCommitment, Task, ContractStatus, TaskStatus, AuditEvent, DivisionSlug } from "@prisma/client";
import prisma from "../lib/db";

export type PopulatedContract = WeeklyContract & {
  commitments: Array<WeeklyCommitment & { task: Task }>;
};

export interface IWeeklyContractRepository {
  getActiveContract(weekNumber: number, year: number): Promise<PopulatedContract | null>;
  createContract(
    weekNumber: number,
    year: number,
    commitments: Array<{ title: string; divisionSlug: string }>
  ): Promise<{ success: boolean; contract?: PopulatedContract; error?: string }>;
  reviewContract(
    contractId: string,
    completedTaskIds: string[],
    reviewNote: string
  ): Promise<{ success: boolean; contract?: PopulatedContract; error?: string }>;
}

/**
 * WeeklyContractRepository handles transactional creation, queries, and evaluations
 * of Weekly Contracts and commitments.
 */
export class WeeklyContractRepository implements IWeeklyContractRepository {
  private db = prisma;

  /**
   * Retrieves a weekly contract for a specific calendar week.
   */
  async getActiveContract(weekNumber: number, year: number): Promise<PopulatedContract | null> {
    return this.db.weeklyContract.findFirst({
      where: {
        weekNumber,
        year,
      },
      include: {
        commitments: {
          include: {
            task: true,
          },
        },
      },
    }) as Promise<PopulatedContract | null>;
  }

  /**
   * Creates a new WeeklyContract with exactly three commitments in a transaction.
   */
  async createContract(
    weekNumber: number,
    year: number,
    commitments: Array<{ title: string; divisionSlug: string }>
  ): Promise<{ success: boolean; contract?: PopulatedContract; error?: string }> {
    try {
      const result = await this.db.$transaction(async (tx) => {
        // Enforce single contract per calendar week
        const existing = await tx.weeklyContract.findUnique({
          where: {
            weekNumber_year: {
              weekNumber,
              year,
            },
          },
        });

        if (existing) {
          throw new Error("DUP_CONTRACT");
        }

        // Create the contract shell
        const contract = await tx.weeklyContract.create({
          data: {
            weekNumber,
            year,
            status: ContractStatus.ACTIVE,
            score: 0.0,
          },
        });

        for (const comm of commitments) {
          // Find Division
          const division = await tx.division.findUnique({
            where: { slug: comm.divisionSlug as DivisionSlug },
          });

          if (!division) {
            throw new Error(`MISSING_DIVISION_${comm.divisionSlug}`);
          }

          // Find or create default goal
          let goal = await tx.goal.findFirst({
            where: {
              title: "Weekly Objectives",
              divisionId: division.id,
            },
          });

          if (!goal) {
            goal = await tx.goal.create({
              data: {
                title: "Weekly Objectives",
                divisionId: division.id,
              },
            });
          }

          // Create backing task
          const task = await tx.task.create({
            data: {
              title: comm.title,
              status: TaskStatus.TODO,
              goalId: goal.id,
            },
          });

          // Create WeeklyCommitment link
          await tx.weeklyCommitment.create({
            data: {
              contractId: contract.id,
              taskId: task.id,
            },
          });
        }

        // Fetch populated contract
        return tx.weeklyContract.findUnique({
          where: { id: contract.id },
          include: {
            commitments: {
              include: {
                task: true,
              },
            },
          },
        });
      });

      return { success: true, contract: (result as PopulatedContract) || undefined };
    } catch (err: any) {
      if (err.message === "DUP_CONTRACT") {
        return { success: false, error: "Kontrak mingguan sudah dibuat untuk minggu ini." };
      }
      if (err.message.startsWith("MISSING_DIVISION")) {
        return { success: false, error: "Divisi yang dipilih tidak ditemukan." };
      }
      console.error("Failed to create weekly contract:", err);
      return { success: false, error: "Gagal menyimpan kontrak mingguan." };
    }
  }

  /**
   * Reviews a contract, updates subtask completion, computes score and updates streak values.
   */
  async reviewContract(
    contractId: string,
    completedTaskIds: string[],
    reviewNote: string
  ): Promise<{ success: boolean; contract?: PopulatedContract; error?: string }> {
    try {
      const result = await this.db.$transaction(async (tx) => {
        const contract = await tx.weeklyContract.findUnique({
          where: { id: contractId },
          include: {
            commitments: {
              include: {
                task: true,
              },
            },
          },
        });

        if (!contract) {
          throw new Error("MISSING_CONTRACT");
        }

        if (contract.status !== ContractStatus.ACTIVE) {
          throw new Error("CONTRACT_NOT_ACTIVE");
        }

        // Update task statuses
        let completedCount = 0;
        for (const comm of contract.commitments) {
          const isDone = completedTaskIds.includes(comm.taskId);
          if (isDone) {
            completedCount++;
          }

          await tx.task.update({
            where: { id: comm.taskId },
            data: {
              status: isDone ? TaskStatus.DONE : TaskStatus.TODO,
            },
          });
        }

        // Compute score & status
        const score = parseFloat((completedCount / 3).toFixed(2));
        const finalStatus = score >= 0.67 ? ContractStatus.COMPLETED : ContractStatus.FAILED;

        // Apply penalty if failed (reset streak and flag red alert status)
        if (finalStatus === ContractStatus.FAILED) {
          let config = await tx.companyConfig.findUnique({ where: { id: 1 } });
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

          await tx.companyConfig.update({
            where: { id: 1 },
            data: {
              currentStreak: 0,
              redFlagStatus: true,
            },
          });

          await tx.auditLog.create({
            data: {
              event: AuditEvent.RESET_STREAK,
              details: `Streak di-reset karena Kontrak Mingguan gagal (Skor: ${score})`,
              actor: "System",
            },
          });
        }

        // Save review updates
        const updated = await tx.weeklyContract.update({
          where: { id: contractId },
          data: {
            score,
            status: finalStatus,
            reviewNote,
          },
          include: {
            commitments: {
              include: {
                task: true,
              },
            },
          },
        });

        // Log completion events
        await tx.auditLog.create({
          data: {
            event: AuditEvent.FINISHED_WEEKLY_CONTRACT,
            details: `Pemeriksaan Kontrak Mingguan Week ${contract.weekNumber} selesai. Skor: ${score} (${finalStatus})`,
            actor: "Admin",
          },
        });

        return updated;
      });

      return { success: true, contract: result as PopulatedContract };
    } catch (err: any) {
      if (err.message === "MISSING_CONTRACT") {
        return { success: false, error: "Kontrak mingguan tidak ditemukan." };
      }
      if (err.message === "CONTRACT_NOT_ACTIVE") {
        return { success: false, error: "Kontrak mingguan sudah dinilai." };
      }
      console.error("Failed to review weekly contract:", err);
      return { success: false, error: "Terjadi kesalahan saat memproses review." };
    }
  }
}
