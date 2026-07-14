import { Application, ApplicationStatus, Certification } from "@prisma/client";
import prisma from "../lib/db";

export interface IJobRepository {
  getApplications(): Promise<Application[]>;
  createApplication(
    data: Omit<Application, "id" | "createdAt" | "updatedAt">
  ): Promise<Application>;
  updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application>;
  getCertifications(): Promise<Certification[]>;
  createCertification(
    data: Omit<Certification, "id" | "createdAt" | "updatedAt">
  ): Promise<Certification>;
  updateCertificationProgress(id: string, completedTask: number, totalTask: number): Promise<Certification>;
}

/**
 * JobRepository handles DB operations for Job applications pipelines and certifications targets.
 */
export class JobRepository implements IJobRepository {
  private db = prisma;

  /**
   * Retrieves all job applications.
   */
  async getApplications(): Promise<Application[]> {
    return this.db.application.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Creates a new job application entry.
   */
  async createApplication(
    data: Omit<Application, "id" | "createdAt" | "updatedAt">
  ): Promise<Application> {
    return this.db.application.create({
      data,
    });
  }

  /**
   * Updates status of a job application.
   */
  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application> {
    return this.db.application.update({
      where: { id },
      data: {
        status,
        appliedDate: status === ApplicationStatus.APPLIED ? new Date() : undefined,
      },
    });
  }

  /**
   * Retrieves all certification goals.
   */
  async getCertifications(): Promise<Certification[]> {
    return this.db.certification.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Creates a new certification tracker track.
   */
  async createCertification(
    data: Omit<Certification, "id" | "createdAt" | "updatedAt">
  ): Promise<Certification> {
    return this.db.certification.create({
      data,
    });
  }

  /**
   * Updates completedTask and totalTask count parameters.
   */
  async updateCertificationProgress(
    id: string,
    completedTask: number,
    totalTask: number
  ): Promise<Certification> {
    return this.db.certification.update({
      where: { id },
      data: {
        completedTask: Math.min(completedTask, totalTask),
        totalTask,
      },
    });
  }
}
