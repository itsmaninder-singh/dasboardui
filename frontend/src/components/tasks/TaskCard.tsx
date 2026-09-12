import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, UserCircle, FolderKanban } from "lucide-react";
import { Task, TaskStatus } from "../../types/task";
import { StatusBadge, PriorityBadge } from "../common/Badge";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  isStatusUpdating?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, isStatusUpdating }) => {
  const isOverdue = task.dueDate ? new Date(task.dueDate).getTime() < Date.now() && task.status !== "DONE" : false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      className={`bg-graphite-card border rounded-xl p-4 shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between group ${
        isOverdue ? "border-rose-700/40 bg-rose-950/10" : "border-graphite-border"
      }`}
    >
      <div>
        {}
        <div className="flex items-center justify-between gap-2 mb-2">
          <PriorityBadge priority={task.priority} size="sm" />

          {task.project?.name && (
            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">
              {task.project.name}
            </span>
          )}
        </div>

        {}
        <Link to={`/tasks/${task.id}`} className="block">
          <h4 className="font-heading font-semibold text-sm text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
            {task.title}
          </h4>
        </Link>

        {task.description && (
          <p className="text-xs text-slate-400 font-sans mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {}
      <div className="pt-3 mt-3 border-t border-graphite-border/60 flex items-center justify-between gap-2 text-xs">
        {}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[9px] text-slate-300 shrink-0">
            {task.assignedDeveloper?.name ? task.assignedDeveloper.name.charAt(0).toUpperCase() : "?"}
          </div>
          <span className="text-[11px] text-slate-400 truncate max-w-[90px]">
            {task.assignedDeveloper?.name || "Unassigned"}
          </span>
        </div>

        {}
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div
              className={`flex items-center gap-1 text-[10px] font-mono ${
                isOverdue ? "text-rose-400 font-bold" : "text-slate-500"
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          <StatusBadge status={task.status} size="sm" />
        </div>
      </div>
    </motion.div>
  );
};
