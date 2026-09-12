import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Kanban,
  Table as TableIcon,
  Plus,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { Task, TaskStatus } from "../types/task";
import { useAuthStore } from "../store/authStore";
import { useTaskFilters } from "../hooks/useTaskFilters";
import { useUiStore } from "../store/uiStore";
import { TaskFiltersBar } from "../components/tasks/TaskFiltersBar";
import { TaskKanban } from "../components/tasks/TaskKanban";
import { TaskTable } from "../components/tasks/TaskTable";
import { TaskModal } from "../components/tasks/TaskModal";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";

export const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const addToast = useUiStore((s) => s.addToast);
  const { filters, setFilter } = useTaskFilters();

  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const canCreate = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  // Fetch Tasks with URL query params
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.projectId) params.append("projectId", filters.projectId);
      if (filters.dueDateFrom) params.append("dueDateFrom", filters.dueDateFrom);
      if (filters.dueDateTo) params.append("dueDateTo", filters.dueDateTo);
      params.append("page", String(filters.page || 1));
      params.append("limit", String(viewMode === "kanban" ? 60 : 20));

      const res = await api.get<ApiResponse<Task[]>>(`/tasks?${params.toString()}`);
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
        title: "Status Transition Completed",
        description: `Task "${updatedTask.title}" moved to ${updatedTask.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Transition Rejected",
        description: err.response?.data?.error?.message || "Failed to update status",
      });
    },
  });

  const tasks = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs text-amber-400 tracking-wider uppercase">
              WORK ORDER PIPELINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight mt-1">
            Tasks & Board
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-graphite-card border border-graphite-border p-1 rounded-lg">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                viewMode === "kanban"
                  ? "bg-amber-500 text-obsidian-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>KANBAN</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                viewMode === "table"
                  ? "bg-amber-500 text-obsidian-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>TABLE</span>
            </button>
          </div>

          {canCreate && (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsNewTaskModalOpen(true)}
            >
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* URL-bound Parametric Filter Toolbar */}
      <TaskFiltersBar />

      {/* Main Viewport */}
      {isLoading ? (
        <div className="h-96 rounded-xl bg-graphite-card border border-graphite-border skeleton-shimmer" />
      ) : isError ? (
        <ErrorState
          title="Could not load tasks"
          message={(error as any)?.message || "Failed to retrieve work orders."}
          onRetry={() => refetch()}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match active criteria"
          description="Adjust your filters or provision a new task."
          actionLabel={canCreate ? "Provision Task" : undefined}
          onAction={canCreate ? () => setIsNewTaskModalOpen(true) : undefined}
        />
      ) : viewMode === "kanban" ? (
        <TaskKanban
          tasks={tasks}
          onStatusChange={(taskId, status) => updateStatusMutation.mutate({ taskId, status })}
        />
      ) : (
        <div className="space-y-4">
          <TaskTable tasks={tasks} />

          {/* Pagination bar for table view */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-graphite-card border border-graphite-border text-xs font-mono">
              <span className="text-slate-400">
                PAGE {meta.page} OF {meta.totalPages} ({meta.total} TOTAL)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  disabled={meta.page <= 1}
                  onClick={() => setFilter("page", meta.page - 1)}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => setFilter("page", meta.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Creation Modal */}
      {isNewTaskModalOpen && (
        <TaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
        />
      )}
    </div>
  );
};
