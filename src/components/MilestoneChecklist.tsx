"use client";

import React, { useTransition } from "react";
import { toggleSkripsiTaskAction } from "../app/skripsi/actions";
import { Task } from "@prisma/client";

interface MilestoneChecklistProps {
  goalTitle: string;
  goalDescription: string | null;
  tasks: Task[];
}

/**
 * MilestoneChecklist Component.
 * Checklist layout display mapping chapter progress and defense preparations milestones.
 */
export default function MilestoneChecklist({ goalTitle, goalDescription, tasks }: MilestoneChecklistProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const isCompleted = currentStatus !== "DONE";
    startTransition(async () => {
      await toggleSkripsiTaskAction(taskId, isCompleted);
    });
  };

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "DONE").length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full max-w-xl mx-auto rounded-lg border border-card-border bg-card p-6 shadow-sm">
      <div className="border-b border-card-border pb-3 mb-6">
        <span className="inline-flex items-center rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[9px] font-mono font-semibold text-primary uppercase tracking-wider mb-2">
          Aktif &amp; Terkunci
        </span>
        <h2 className="font-sans text-base font-bold text-foreground">{goalTitle}</h2>
        {goalDescription && (
          <p className="font-sans text-xs text-muted-foreground mt-1 leading-relaxed">
            {goalDescription}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Progress Tracker */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-semibold text-foreground">Progres Penulisan</span>
            <span className="font-sans text-[10px] font-semibold text-muted-foreground font-mono">
              {completed} / {total} Bab ({percent}%)
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-success transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Checklists */}
        <div className="space-y-3 pt-2">
          <span className="block font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Tahapan Milestone Skripsi
          </span>

          {tasks.map((task) => {
            const isDone = task.status === "DONE";
            return (
              <label
                key={task.id}
                className={`flex items-center gap-3 rounded border p-3.5 transition select-none cursor-pointer ${
                  isDone
                    ? "bg-success/5 border-success/30 text-foreground"
                    : "bg-background border-card-border text-muted-foreground hover:bg-muted/10"
                } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => handleToggleTask(task.id, task.status)}
                  disabled={isPending}
                  className="h-4 w-4 rounded border-card-border bg-card accent-primary cursor-pointer"
                />
                <span
                  className={`font-sans text-xs ${
                    isDone ? "text-muted-foreground line-through" : "text-foreground font-medium"
                  }`}
                >
                  {task.title}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
