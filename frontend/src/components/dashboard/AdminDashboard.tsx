import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FolderKanban,
  CheckCircle2,
  AlertOctagon,
  Users2,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ApiResponse } from "../../types/api";
import { Project } from "../../types/project";
import { Task, TaskStatus } from "../../types/task";
import { useSocketStore } from "../../store/socketStore";
import { ActivityFeedCard } from "./ActivityFeedCard";
import { StatusBadge } from "../common/Badge";
import { StatCardSkeleton } from "../common/Skeleton";

export const AdminDashboard: React.FC = () => {
  const onlineCount = useSocketStore((s) => s.onlineCount);

  // Fetch projects summary
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects", "summary"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project[]>>("/projects?page=1&limit=50");
      return res.data;
    },
  });

  // Fetch tasks summary
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", "summary"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Task[]>>("/tasks?page=1&limit=100");
      return res.data;
    },
  });

  const totalProjects = projectsData?.meta?.total ?? projectsData?.data?.length ?? 0;
  const tasks = tasksData?.data || [];
  const totalTasks = tasksData?.meta?.total ?? tasks.length;

  // Status breakdown calculations
  const statusCounts: Record<TaskStatus, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
    OVERDUE: 0,
  };

  tasks.forEach((t) => {
    if (statusCounts[t.status] !== undefined) {
      statusCounts[t.status]++;
    }
  });

  const overdueCount = statusCounts.OVERDUE;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-mono text-xs text-amber-400 tracking-wider uppercase">
              GLOBAL COMMAND TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight mt-1">
            System Administration
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>REAL-TIME ENGINE:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            ACTIVE
          </span>
        </div>
      </div>

      {/* Asymmetric Metrics Lane */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* OVERDUE TASK CARD - URGENT STYLING */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-xl border p-5 flex flex-col justify-between ${
            overdueCount > 0
              ? "bg-rose-950/25 border-rose-600/50 shadow-overdue"
              : "bg-graphite-card border-graphite-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider uppercase text-rose-300 font-semibold flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              OVERDUE RADAR
            </span>
            {overdueCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </div>

          <div className="my-3">
            <div className="text-3xl font-heading font-bold text-rose-200">
              {isTasksLoading ? "—" : overdueCount}
            </div>
            <p className="text-xs text-rose-300/80 font-sans mt-0.5">
              {overdueCount === 1 ? "Critical task breach" : "Critical task breaches requiring intervention"}
            </p>
          </div>

          <Link
            to="/tasks?status=OVERDUE"
            className="text-xs font-mono text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 mt-1 group"
          >
            <span>Inspect Overdue Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* LIVE ONLINE PRESENCE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-graphite-card border border-graphite-border rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <Users2 className="w-4 h-4 text-emerald-400" />
              SOCKET PRESENCE
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="my-3">
            <div className="text-3xl font-heading font-bold text-slate-100 flex items-baseline gap-2">
              <span>{onlineCount}</span>
              <span className="text-xs font-mono text-slate-500 font-normal">NODES</span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Live operators connected via WebSocket telemetry
            </p>
          </div>

          <Link
            to="/users"
            className="text-xs font-mono text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group"
          >
            <span>Manage Team Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* TOTAL PROJECTS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-graphite-card border border-graphite-border rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-amber-400" />
              MANAGED PROJECTS
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-heading font-bold text-slate-100">
              {isProjectsLoading ? "—" : totalProjects}
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Active projects across enterprise clients
            </p>
          </div>

          <Link
            to="/projects"
            className="text-xs font-mono text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group"
          >
            <span>View All Projects</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* TOTAL TASKS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-graphite-card border border-graphite-border rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              SYSTEM WORKLOAD
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-heading font-bold text-slate-100">
              {isTasksLoading ? "—" : totalTasks}
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Total work orders across all pipelines
            </p>
          </div>

          <Link
            to="/tasks"
            className="text-xs font-mono text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group"
          >
            <span>Open Tasks Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Main Grid: Status Breakdown + Global Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown Lane */}
        <div className="lg:col-span-1 bg-graphite-card border border-graphite-border rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <h3 className="font-heading font-semibold text-sm text-slate-100">
                Status Distribution
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {totalTasks} Total
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "OVERDUE"] as TaskStatus[]).map((st) => {
              const count = statusCounts[st];
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

              return (
                <div key={st} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <StatusBadge status={st} size="sm" />
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-slate-200">{count}</span>
                      <span className="text-slate-500 text-[10px]">({pct}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-obsidian-850 rounded-full overflow-hidden border border-graphite-border/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        st === "TODO"
                          ? "bg-slate-400"
                          : st === "IN_PROGRESS"
                          ? "bg-cyan-400"
                          : st === "IN_REVIEW"
                          ? "bg-amber-400"
                          : st === "DONE"
                          ? "bg-emerald-400"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Filter Shortcut */}
          <div className="pt-3 border-t border-graphite-border text-center">
            <Link
              to="/tasks"
              className="text-xs font-mono text-amber-400 hover:text-amber-300 hover:underline"
            >
              Open Full Kanban Matrix →
            </Link>
          </div>
        </div>

        {/* Global Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeedCard limit={12} />
        </div>
      </div>
    </div>
  );
};
