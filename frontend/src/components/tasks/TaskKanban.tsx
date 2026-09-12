import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, TaskStatus } from "../../types/task";
import { TaskCard } from "./TaskCard";

interface TaskKanbanProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const COLUMNS: Array<{ id: TaskStatus; label: string; dot: string; border: string }> = [
  { id: "TODO", label: "TODO", dot: "bg-slate-400", border: "border-slate-500/20" },
  { id: "IN_PROGRESS", label: "IN PROGRESS", dot: "bg-cyan-400", border: "border-cyan-500/20" },
  { id: "IN_REVIEW", label: "IN REVIEW", dot: "bg-amber-400", border: "border-amber-500/20" },
  { id: "DONE", label: "DONE", dot: "bg-emerald-400", border: "border-emerald-500/20" },
  { id: "OVERDUE", label: "OVERDUE", dot: "bg-rose-500", border: "border-rose-500/30" },
];

export const TaskKanban: React.FC<TaskKanbanProps> = ({ tasks, onStatusChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-xl bg-graphite-card/50 border ${col.border} p-3 min-w-[260px] max-h-[calc(100vh-280px)]`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-graphite-border">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h3 className="font-heading font-semibold text-xs text-slate-200 tracking-wider">
                  {col.label}
                </h3>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-obsidian-850 text-slate-400 border border-graphite-border font-bold">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Cards (Physical spring animation) */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <AnimatePresence mode="popLayout">
                {columnTasks.length === 0 ? (
                  <div className="h-28 flex items-center justify-center border border-dashed border-graphite-border/60 rounded-lg text-slate-600 text-xs font-mono">
                    EMPTY LANE
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={onStatusChange}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};
