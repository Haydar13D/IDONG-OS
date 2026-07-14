"use client";

import React, { useState, useTransition } from "react";
import { addGoalTaskAction, toggleSkillTaskAction, deleteGoalTaskAction, deleteSkillGoalAction } from "../app/skill-building/actions";
import { Goal, Task } from "@prisma/client";

interface SkillGoalCardProps {
  goal: Goal & { tasks: Task[] };
}

/**
 * SkillGoalCard Component.
 * Displays progress trackers, subtasks checklists, quick addition inputs,
 * and deletion controllers.
 */
export default function SkillGoalCard({ goal }: SkillGoalCardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const isCompleted = currentStatus !== "DONE";
    startTransition(async () => {
      await toggleSkillTaskAction(taskId, isCompleted);
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus subtarget ini?")) {
      return;
    }
    startTransition(async () => {
      await deleteGoalTaskAction(taskId);
    });
  };

  const handleDeleteGoal = () => {
    if (!confirm("Apakah Anda yakin ingin menghapus target kompetensi ini beserta seluruh subtargetnya?")) {
      return;
    }
    startTransition(async () => {
      await deleteSkillGoalAction(goal.id);
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newTaskTitle.trim().length < 2) {
      setError("Nama subtarget minimal 2 karakter.");
      return;
    }

    startTransition(async () => {
      const res = await addGoalTaskAction(goal.id, newTaskTitle);
      if (res.success) {
        setNewTaskTitle("");
      } else {
        setError(res.error || "Gagal menambahkan subtarget.");
      }
    });
  };

  // Strip category prefix from display title
  const cleanTitle = goal.title.replace(/^\[.*?\]\s*/, "");
  const total = goal.tasks.length;
  const completed = goal.tasks.filter((t) => t.status === "DONE").length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={`rounded-lg border border-card-border bg-card p-5 shadow-sm space-y-4 hover:border-muted-foreground/20 transition duration-150 relative ${
      isPending ? "opacity-60 pointer-events-none" : ""
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-sans text-sm font-bold text-foreground leading-snug">
            {cleanTitle}
          </h4>
          {goal.description && (
            <p className="font-sans text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {goal.description}
            </p>
          )}
        </div>
        <button
          onClick={handleDeleteGoal}
          disabled={isPending}
          className="rounded border border-destructive/20 bg-destructive/5 hover:bg-destructive/15 px-2 py-1 font-sans text-[8px] font-bold text-destructive uppercase tracking-wider transition cursor-pointer"
        >
          Hapus
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground">
          <span>Progres Target</span>
          <span>
            {completed} / {total} Subtarget ({percent}%)
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className={`h-1.5 rounded-full transition-all duration-300 ${
              percent === 100 ? "bg-success" : "bg-primary"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Subtasks Checklists */}
      <div className="space-y-2 pt-1">
        {goal.tasks.map((task) => {
          const isDone = task.status === "DONE";
          return (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 group/item rounded border border-card-border/50 bg-background/30 p-2.5 hover:border-card-border transition duration-100"
            >
              <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => handleToggleTask(task.id, task.status)}
                  disabled={isPending}
                  className="h-3.5 w-3.5 rounded border-card-border bg-card accent-primary"
                />
                <span
                  className={`font-sans text-xs ${
                    isDone ? "text-muted-foreground line-through" : "text-foreground font-medium"
                  }`}
                >
                  {task.title}
                </span>
              </label>
              <button
                onClick={() => handleDeleteTask(task.id)}
                disabled={isPending}
                className="opacity-0 group-hover/item:opacity-100 rounded hover:bg-muted p-1 text-[9px] text-destructive transition cursor-pointer"
                title="Hapus subtarget"
              >
                ✕
              </button>
            </div>
          );
        })}

        {total === 0 && (
          <p className="font-sans text-[10px] text-muted-foreground text-center py-4 border border-dashed border-card-border rounded bg-background/25">
            Belum ada langkah subtarget. Tambahkan di bawah!
          </p>
        )}
      </div>

      {/* Inline Subtask Form */}
      <form onSubmit={handleAddTask} className="pt-2 border-t border-card-border/40">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Tambah langkah subtarget..."
            disabled={isPending}
            className="flex-1 rounded border border-card-border bg-background px-2.5 py-1.5 font-sans text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded bg-primary px-3 py-1.5 font-sans text-xs font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-100 disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            + Tambah
          </button>
        </div>
        {error && (
          <p className="font-sans text-[9px] text-destructive mt-1.5 font-medium">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
