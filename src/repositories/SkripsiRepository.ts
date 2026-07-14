import { DecisionRecord, DecisionOption, Goal, Task, TaskStatus, AuditEvent, DivisionSlug } from "@prisma/client";
import prisma from "../lib/db";

export type PopulatedDecisionOption = DecisionOption & {
  scores: Array<{ criteriaName: string; criteriaWeight: number; scoreValue: number }>;
};

export type PopulatedDecisionRecord = DecisionRecord & {
  options: PopulatedDecisionOption[];
};

export interface ISkripsiRepository {
  getDecisionRecord(): Promise<PopulatedDecisionRecord>;
  addDecisionOption(
    name: string,
    scores: { speed: number; relevance: number; portfolio: number; risk: number }
  ): Promise<PopulatedDecisionOption>;
  finalizeTopic(optionId: string): Promise<DecisionRecord>;
  getSkripsiGoal(): Promise<(Goal & { tasks: Task[] }) | null>;
  toggleTaskStatus(taskId: string, isCompleted: boolean): Promise<Task>;
}

/**
 * SkripsiRepository handles DB operations for the Thesis Decision Matrix,
 * Chapter checklists, and active Goal transitions.
 */
export class SkripsiRepository implements ISkripsiRepository {
  private db = prisma;

  /**
   * Fetches or initializes the main Decision Record for Skripsi Topic Selection.
   */
  async getDecisionRecord(): Promise<PopulatedDecisionRecord> {
    let record = await this.db.decisionRecord.findFirst({
      include: {
        options: {
          include: {
            scores: true,
          },
        },
      },
    });

    if (!record) {
      // Initialize the default decision record
      const newRecord = await this.db.decisionRecord.create({
        data: {
          title: "Pemilihan Topik Skripsi",
          reasoning: "Analisis kecocokan judul skripsi berdasarkan matriks bobot kelulusan, karir, dan risiko.",
        },
      });

      return {
        ...newRecord,
        options: [],
      };
    }

    return record as PopulatedDecisionRecord;
  }

  /**
   * Adds a new title option with 4 criteria score values inside a transaction.
   */
  async addDecisionOption(
    name: string,
    scores: { speed: number; relevance: number; portfolio: number; risk: number }
  ): Promise<PopulatedDecisionOption> {
    return this.db.$transaction(async (tx) => {
      let record = await tx.decisionRecord.findFirst();
      if (!record) {
        record = await tx.decisionRecord.create({
          data: {
            title: "Pemilihan Topik Skripsi",
            reasoning: "Analisis kecocokan judul skripsi berdasarkan matriks bobot kelulusan, karir, dan risiko.",
          },
        });
      }

      const option = await tx.decisionOption.create({
        data: {
          name,
          decisionRecordId: record.id,
        },
      });

      const scoresData = [
        { criteriaName: "Speed", criteriaWeight: 0.3, scoreValue: scores.speed, optionId: option.id },
        { criteriaName: "Relevance", criteriaWeight: 0.3, scoreValue: scores.relevance, optionId: option.id },
        { criteriaName: "Portfolio Value", criteriaWeight: 0.2, scoreValue: scores.portfolio, optionId: option.id },
        { criteriaName: "Risk", criteriaWeight: 0.2, scoreValue: scores.risk, optionId: option.id },
      ];

      for (const s of scoresData) {
        await tx.decisionScore.create({ data: s });
      }

      return tx.decisionOption.findUnique({
        where: { id: option.id },
        include: {
          scores: true,
        },
      }) as Promise<PopulatedDecisionOption>;
    });
  }

  /**
   * Finalizes the selected skripsi topic and seeds the Goal and 6 default tasks.
   */
  async finalizeTopic(optionId: string): Promise<DecisionRecord> {
    return this.db.$transaction(async (tx) => {
      const option = await tx.decisionOption.findUnique({
        where: { id: optionId },
      });

      if (!option) {
        throw new Error("MISSING_OPTION");
      }

      // Update DecisionRecord with finalized option
      const record = await tx.decisionRecord.findFirst();
      if (!record) {
        throw new Error("MISSING_RECORD");
      }

      const updatedRecord = await tx.decisionRecord.update({
        where: { id: record.id },
        data: {
          finalOptionId: optionId,
        },
      });

      // Find Skripsi Division
      const division = await tx.division.findUnique({
        where: { slug: DivisionSlug.skripsi },
      });

      if (!division) {
        throw new Error("MISSING_SKRIPSI_DIVISION");
      }

      // Create new Goal under Skripsi Division
      const goal = await tx.goal.create({
        data: {
          title: `Skripsi: ${option.name}`,
          description: "Pelacakan progres penyusunan dan penulisan Bab 1 - 5 Skripsi.",
          divisionId: division.id,
        },
      });

      // Seed 6 default milestone tasks
      const defaultTasks = [
        "Bab 1: Pendahuluan",
        "Bab 2: Tinjauan Pustaka",
        "Bab 3: Metodologi Penelitian",
        "Bab 4: Hasil & Pembahasan",
        "Bab 5: Kesimpulan & Saran",
        "Sidang Akhir & Yudisium",
      ];

      for (const title of defaultTasks) {
        await tx.task.create({
          data: {
            title,
            status: TaskStatus.TODO,
            goalId: goal.id,
          },
        });
      }

      // Log the created goal event
      await tx.auditLog.create({
        data: {
          event: AuditEvent.CREATED_GOAL,
          details: `Skripsi Topic Finalized: ${option.name}. Goal and subtasks created.`,
          actor: "Admin",
        },
      });

      return updatedRecord;
    });
  }

  /**
   * Fetches the active goal under Skripsi division along with subtasks.
   */
  async getSkripsiGoal(): Promise<(Goal & { tasks: Task[] }) | null> {
    const division = await this.db.division.findUnique({
      where: { slug: DivisionSlug.skripsi },
    });

    if (!division) return null;

    return this.db.goal.findFirst({
      where: {
        divisionId: division.id,
        title: {
          startsWith: "Skripsi:",
        },
      },
      include: {
        tasks: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  /**
   * Toggles completion status of a task.
   */
  async toggleTaskStatus(taskId: string, isCompleted: boolean): Promise<Task> {
    const status = isCompleted ? TaskStatus.DONE : TaskStatus.TODO;
    
    return this.db.task.update({
      where: { id: taskId },
      data: {
        status,
      },
    });
  }
}
