import React from "react";
import { TaskStatus, TaskPriority } from "../../types/task";
import { Role } from "../../types/auth";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  TaskStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  TODO: {
    label: "TODO",
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-500/30",
    dot: "bg-slate-400",
  },
  IN_PROGRESS: {
    label: "IN PROGRESS",
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    border: "border-cyan-500/30",
    dot: "bg-cyan-400",
  },
  IN_REVIEW: {
    label: "IN REVIEW",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/30",
    dot: "bg-amber-400",
  },
  DONE: {
    label: "DONE",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  OVERDUE: {
    label: "OVERDUE",
    bg: "bg-rose-500/15",
    text: "text-rose-300",
    border: "border-rose-500/40",
    dot: "bg-rose-500",
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "", size = "md" }) => {
  const cfg = statusConfig[status] || statusConfig.TODO;
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium uppercase tracking-wider rounded border transition-colors duration-200 ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
  size?: "sm" | "md";
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string; glyph: string }
> = {
  LOW: {
    label: "LOW",
    bg: "bg-slate-800/40",
    text: "text-slate-400",
    border: "border-slate-700/50",
    glyph: "▽",
  },
  MEDIUM: {
    label: "MED",
    bg: "bg-teal-500/10",
    text: "text-teal-300",
    border: "border-teal-500/30",
    glyph: "◇",
  },
  HIGH: {
    label: "HIGH",
    bg: "bg-orange-500/15",
    text: "text-orange-300",
    border: "border-orange-500/30",
    glyph: "▲",
  },
  CRITICAL: {
    label: "CRITICAL",
    bg: "bg-red-500/20",
    text: "text-red-300",
    border: "border-red-500/40",
    glyph: "⚡",
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "", size = "md" }) => {
  const cfg = priorityConfig[priority] || priorityConfig.MEDIUM;
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-medium rounded border ${cfg.bg} ${cfg.text} ${cfg.border} ${sizeClasses} ${className}`}
    >
      <span className="text-[9px] opacity-80">{cfg.glyph}</span>
      {cfg.label}
    </span>
  );
};

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = "" }) => {
  const style =
    role === "ADMIN"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : role === "PROJECT_MANAGER"
      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
      : "bg-slate-800 text-slate-300 border-slate-700";

  const label =
    role === "ADMIN"
      ? "SYS_ADMIN"
      : role === "PROJECT_MANAGER"
      ? "PROJ_MGR"
      : "DEVELOPER";

  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded border ${style} ${className}`}
    >
      {label}
    </span>
  );
};
