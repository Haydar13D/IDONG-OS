import { Goal, Task, TaskStatus, AuditEvent, DivisionSlug } from "@prisma/client";
import prisma from "../lib/db";

export interface ISkillRepository {
  getSkillGoals(): Promise<(Goal & { tasks: Task[] })[]>;
  createSkillGoal(
    title: string,
    description: string | null,
    category: "Homelab" | "Learning Path" | "Certification" | "Projects"
  ): Promise<Goal>;
  addGoalTask(goalId: string, title: string): Promise<Task>;
  toggleTaskStatus(taskId: string, isCompleted: boolean): Promise<Task>;
  deleteGoalTask(taskId: string): Promise<Task>;
  deleteSkillGoal(goalId: string): Promise<Goal>;
}

/**
 * SkillRepository handles DB operations for the Skill Building division,
 * including homelabs, projects, learning paths, and cert task progress tracking.
 */
export class SkillRepository implements ISkillRepository {
  private db = prisma;

  /**
   * Retrieves all goals under the skill division, including tasks.
   */
  async getSkillGoals(): Promise<(Goal & { tasks: Task[] })[]> {
    const division = await this.db.division.findUnique({
      where: { slug: DivisionSlug.skill },
    });

    if (!division) return [];

    return this.db.goal.findMany({
      where: { divisionId: division.id },
      include: {
        tasks: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Creates a new skill building goal prefixed by category.
   */
  async createSkillGoal(
    title: string,
    description: string | null,
    category: "Homelab" | "Learning Path" | "Certification" | "Projects"
  ): Promise<Goal> {
    const division = await this.db.division.findUnique({
      where: { slug: DivisionSlug.skill },
    });

    if (!division) {
      throw new Error("MISSING_SKILL_DIVISION");
    }

    const prefixedTitle = `[${category}] ${title.trim()}`;

    return this.db.goal.create({
      data: {
        title: prefixedTitle,
        description: description?.trim() || null,
        divisionId: division.id,
      },
    });
  }

  /**
   * Appends a subtask to a skill goal.
   */
  async addGoalTask(goalId: string, title: string): Promise<Task> {
    return this.db.task.create({
      data: {
        title: title.trim(),
        status: TaskStatus.TODO,
        goalId,
      },
    });
  }

  /**
   * Toggles task completion status.
   */
  async toggleTaskStatus(taskId: string, isCompleted: boolean): Promise<Task> {
    return this.db.task.update({
      where: { id: taskId },
      data: {
        status: isCompleted ? TaskStatus.DONE : TaskStatus.TODO,
      },
    });
  }

  /**
   * Deletes a subtask and registers a DELETED_TASK Audit Log entry in a transaction.
   */
  async deleteGoalTask(taskId: string): Promise<Task> {
    return this.db.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        include: { goal: true },
      });

      if (!task) {
        throw new Error("MISSING_TASK");
      }

      await tx.task.delete({
        where: { id: taskId },
      });

      await tx.auditLog.create({
        data: {
          event: AuditEvent.DELETED_TASK,
          details: `Subtask "${task.title}" dihapus dari Goal "${task.goal.title}".`,
          actor: "Admin",
        },
      });

      return task;
    });
  }

  /**
   * Deletes a skill building goal.
   */
  async deleteSkillGoal(goalId: string): Promise<Goal> {
    return this.db.goal.delete({
      where: { id: goalId },
    });
  }
}
