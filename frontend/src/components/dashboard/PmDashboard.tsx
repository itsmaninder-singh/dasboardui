import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FolderKanban,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ListTodo,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ApiResponse } from "../../types/api";
import { Project } from "../../types/project";
import { Task, TaskPriority } from "../../types/task";
import { ActivityFeedCard } from "./ActivityFeedCard";
import { PriorityBadge, StatusBadge } from "../common/Badge";
import { EmptyState } from "../common/EmptyState";
import { StatCardSkeleton } from "../common/Skeleton";

export const PmDashboard: React.FC = () => {
  // Fetch PM's own projects
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects", "pm-dashboard"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project[]>>("/projects?page=1&limit=20");
      return res.data;
    },
  });

  // Fetch PM's tasks
  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", "pm-dashboard"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Task[]>>("/tasks?page=1&limit=100");
      return res.data;
    },
  });

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];

  // Priority summary calculation across PM's tasks
  const priorityCounts: Record<TaskPriority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  tasks.forEach((t) => {
    if (priorityCounts[t.priority] !== undefined) {
      priorityCounts[t.priority]++;
    }
  });

  // Upcoming deadlines (tasks with dueDate sorted soonest first, excluding DONE)
  const upcomingDeadlines = [...tasks]
    .filter((t) => t.dueDate && t.status !== "DONE")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-mono text-xs text-cyan-400 tracking-wider uppercase">
              PROJECT LEAD COMMAND
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight mt-1">
            Project Manager Overview
          </h1>
        </div>

        <Link
          to="/projects"
          className="font-mono text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group"
        >
          <span>View Managed Portfolio ({projects.length})</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Priority Summary Lane */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as TaskPriority[]).map((prio, idx) => {
          const count = priorityCounts[prio];
          const isUrgent = prio === "CRITICAL" || prio === "HIGH";

          return (
            <motion.div
              key={prio}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl border p-4 ${
                isUrgent && count > 0
                  ? "bg-graphite-elevated border-graphite-border shadow-md"
                  : "bg-graphite-card border-graphite-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <PriorityBadge priority={prio} size="sm" />
                {prio === "CRITICAL" && count > 0 && (
                  <span className="text-[10px] font-mono text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> ACTION REQUIRED
                  </span>
                )}
              </div>
              <div className="mt-3">
                <span className="text-2xl sm:text-3xl font-heading font-bold text-slate-100">
                  {isTasksLoading ? "—" : count}
                </span>
                <span className="text-xs text-slate-400 font-sans block mt-0.5">
                  tasks in scope
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2-Column Section: Upcoming Deadlines + Managed Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Deadlines & Projects */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upcoming Deadlines Queue */}
          <div className="bg-graphite-card border border-graphite-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="font-heading font-semibold text-sm text-slate-100">
                  Upcoming Deadlines
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SOONEST FIRST</span>
            </div>

            <div className="mt-4 space-y-2.5">
              {isTasksLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-800 rounded skeleton-shimmer" />
                  ))}
                </div>
              ) : upcomingDeadlines.length === 0 ? (
                <EmptyState
                  title="No active deadlines"
                  description="All scheduled tasks are completed or have no impending due dates."
                />
              ) : (
                upcomingDeadlines.map((task) => {
                  const dueDate = new Date(task.dueDate!);
                  const isPast = dueDate.getTime() < Date.now();

                  return (
                    <Link
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      className="block p-3 rounded-lg bg-obsidian-850 border border-graphite-border hover:border-amber-500/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                          {task.title}
                        </span>
                        <PriorityBadge priority={task.priority} size="sm" />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[11px] font-mono">
                        <StatusBadge status={task.status} size="sm" />
                        <span className={isPast ? "text-rose-400 font-bold" : "text-slate-400"}>
                          {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Managed Projects List */}
          <div className="bg-graphite-card border border-graphite-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-graphite-border">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-cyan-400" />
                <h3 className="font-heading font-semibold text-sm text-slate-100">
                  Active Projects
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {projects.length} Total
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {isProjectsLoading ? (
                <div className="h-20 bg-slate-800 rounded skeleton-shimmer" />
              ) : projects.length === 0 ? (
                <EmptyState
                  title="No projects assigned"
                  description="You are currently not managing any projects."
                />
              ) : (
                projects.slice(0, 4).map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block p-3 rounded-lg bg-obsidian-850 border border-graphite-border hover:border-cyan-500/40 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {project.name}
                      </h4>
                      {project.client?.name && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {project.client.name}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-1">
                        {project.description}
                      </p>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Project-Scoped Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeedCard limit={14} />
        </div>
      </div>
    </div>
  );
};
