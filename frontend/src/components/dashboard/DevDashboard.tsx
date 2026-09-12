import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Code,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ApiResponse } from "../../types/api";
import { Task, TaskStatus, TaskPriority } from "../../types/task";
import { ActivityFeedCard } from "./ActivityFeedCard";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import { EmptyState } from "../common/EmptyState";
import { useUiStore } from "../../store/uiStore";

export const DevDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Fetch Developer's assigned tasks
  const { data: tasksData, isLoading, refetch } = useQuery({
    queryKey: ["tasks", "dev-dashboard"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Task[]>>("/tasks?page=1&limit=100");
      return res.data;
    },
  });

  // Fast status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const res = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, { status });
      return res.data.data;
    },
    onSuccess: (updatedTask) => {
      addToast({
        type: "success",
        title: "Task Updated",
        description: `Moved "${updatedTask.title}" to ${updatedTask.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Status Update Failed",
        description: err?.response?.data?.error?.message || "Could not update status",
      });
    },
  });

  const tasks = tasksData?.data || [];

  // Priority weight mapping for sorting
  const priorityWeight: Record<TaskPriority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  // Sort by priority (desc) then dueDate (asc)
  const sortedTasks = [...tasks].sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  // Filtered list
  const displayTasks = sortedTasks.filter((t) => {
    if (statusFilter === "ALL") return t.status !== "DONE";
    if (statusFilter === "ALL_INC_DONE") return true;
    return t.status === statusFilter;
  });

  // "What's Due Soon" (tasks with dueDate within next 7 days, not done)
  const dueSoonTasks = sortedTasks
    .filter((t) => t.dueDate && t.status !== "DONE")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-emerald-400 tracking-wider uppercase">
              DEVELOPER WORKSTATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight mt-1">
            My Assigned Queue
          </h1>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span>ASSIGNED TASKS:</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Due Soon Highlight Section */}
      {dueSoonTasks.length > 0 && (
        <div className="bg-obsidian-900 border border-amber-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-heading font-semibold text-xs tracking-wider uppercase text-amber-400">
              URGENT TIMELINE // DUE SOON
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {dueSoonTasks.map((task) => {
              const d = new Date(task.dueDate!);
              const isOverdue = d.getTime() < Date.now();

              return (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="p-3 rounded-lg bg-graphite-card border border-graphite-border hover:border-amber-500/50 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <PriorityBadge priority={task.priority} size="sm" />
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        isOverdue ? "text-rose-400" : "text-amber-400/90"
                      }`}
                    >
                      {isOverdue ? "BREACHED" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {task.title}
                  </h4>
                  {task.project?.name && (
                    <span className="text-[10px] text-slate-500 font-mono block mt-1">
                      {task.project.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Developer Queue + Task Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sorted Tasks List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-graphite-card border border-graphite-border rounded-xl p-5 shadow-lg">
            {/* Header with filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-graphite-border">
              <div>
                <h3 className="font-heading font-semibold text-sm text-slate-100">
                  Task Execution Board
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Sorted by Priority (Critical → Low) then Due Date
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-obsidian-850 p-1 rounded-lg border border-graphite-border text-xs font-mono">
                {["ALL", "TODO", "IN_PROGRESS", "IN_REVIEW"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      statusFilter === st
                        ? "bg-amber-500 text-obsidian-950 font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-800 rounded skeleton-shimmer" />
                  ))}
                </div>
              ) : displayTasks.length === 0 ? (
                <EmptyState
                  title="No active tasks in filter"
                  description="You have no tasks matching the selected status."
                />
              ) : (
                displayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-obsidian-850 border border-graphite-border hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <PriorityBadge priority={task.priority} size="sm" />
                        <StatusBadge status={task.status} size="sm" />
                        {task.project?.name && (
                          <span className="text-[10px] font-mono text-slate-500">
                            // {task.project.name}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-sm font-semibold text-slate-100 hover:text-amber-300 transition-colors block"
                      >
                        {task.title}
                      </Link>

                      {task.description && (
                        <p className="text-xs text-slate-400 font-sans mt-0.5 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Developer Status Controller Action */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-graphite-border">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            taskId: task.id,
                            status: e.target.value as TaskStatus,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                        className="bg-obsidian-950 border border-graphite-border text-xs font-mono rounded px-2.5 py-1.5 text-slate-200 hover:border-amber-400 focus:outline-none focus:border-amber-400 transition-colors"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="IN_REVIEW">IN_REVIEW</option>
                        <option value="DONE">DONE</option>
                      </select>

                      <Link
                        to={`/tasks/${task.id}`}
                        className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Developer Scoped Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeedCard limit={10} />
        </div>
      </div>
    </div>
  );
};
