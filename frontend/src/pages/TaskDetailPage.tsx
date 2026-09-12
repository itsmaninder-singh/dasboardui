import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  UserCircle,
  FolderKanban,
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  Activity,
  ArrowRight,
} from "lucide-react";
import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { Task, TaskStatus } from "../types/task";
import { ActivityLog } from "../types/activity";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { StatusBadge, PriorityBadge, RoleBadge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { TaskModal } from "../components/tasks/TaskModal";

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const addToast = useUiStore((s) => s.addToast);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch Task Details
  const {
    data: task,
    isLoading: isTaskLoading,
    isError: isTaskError,
    error: taskError,
    refetch,
  } = useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Fetch Activity History for this task
  const { data: activityData, isLoading: isActivityLoading } = useQuery({
    queryKey: ["activity", { taskId: id }],
    queryFn: async () => {
      if (!task?.projectId) return [];
      const res = await api.get<ApiResponse<ActivityLog[]>>(`/activity?projectId=${task.projectId}&limit=50`);
      return res.data.data.filter((a) => a.taskId === id);
    },
    enabled: !!task?.projectId,
  });

  // Status Change Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: TaskStatus) => {
      const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status: newStatus });
      return res.data.data;
    },
    onSuccess: (updatedTask) => {
      addToast({
        type: "success",
        title: "Status Updated",
        description: `Task status changed to ${updatedTask.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Update Failed",
        description: err.response?.data?.error?.message || "Could not transition status.",
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      addToast({
        type: "info",
        title: "Task Deleted",
        description: "Task has been removed from system.",
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      navigate("/tasks");
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Deletion Failed",
        description: err.response?.data?.error?.message || "Could not delete task.",
      });
    },
  });

  const canEditDetails = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";
  const canChangeStatus =
    user?.role === "ADMIN" ||
    user?.role === "PROJECT_MANAGER" ||
    (user?.role === "DEVELOPER" && task?.assignedDeveloperId === user.id);

  if (isTaskLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-graphite-card rounded-xl skeleton-shimmer" />
        <div className="h-80 bg-graphite-card rounded-xl skeleton-shimmer" />
      </div>
    );
  }

  if (isTaskError || !task) {
    return (
      <ErrorState
        title="Task Not Found or Access Denied"
        message={
          (taskError as any)?.response?.data?.error?.message ||
          "This task either does not exist or your role does not have authorization to view it."
        }
        onRetry={() => navigate("/tasks")}
      />
    );
  }

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate).getTime() < Date.now() &&
    task.status !== "DONE";

  const taskActivities = activityData || [];

  return (
    <div className="space-y-6">
      {/* Back navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO TASKS PIPELINE</span>
        </Link>

        {canEditDetails && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Edit className="w-3.5 h-3.5" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Task
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => {
                if (window.confirm(`Delete task "${task.title}"?`)) {
                  deleteMutation.mutate();
                }
              }}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Task Header Card */}
      <div className="bg-graphite-card border border-graphite-border rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-cyan-500 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Metadata badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {isOverdue && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                  OVERDUE BREACH
                </span>
              )}
              {task.project && (
                <Link
                  to={`/projects/${task.project.id}`}
                  className="text-xs font-mono text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>{task.project.name}</span>
                </Link>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100">
              {task.title}
            </h1>

            {task.description && (
              <div className="mt-4 p-4 rounded-lg bg-obsidian-850/80 border border-graphite-border text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                {task.description}
              </div>
            )}
          </div>

          {/* Status Transition Controller Panel */}
          <div className="lg:w-72 bg-obsidian-850 border border-graphite-border rounded-xl p-4 space-y-4 shrink-0 shadow-inner">
            <div className="pb-2 border-b border-graphite-border">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                STATE MACHINE CONTROL
              </span>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                {canChangeStatus
                  ? "Select status to trigger real-time transition"
                  : "Status updates restricted to assigned developer"}
              </p>
            </div>

            <div className="space-y-1.5">
              {(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as TaskStatus[]).map((st) => (
                <button
                  key={st}
                  disabled={!canChangeStatus || updateStatusMutation.isPending}
                  onClick={() => updateStatusMutation.mutate(st)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                    task.status === st
                      ? "bg-amber-500 text-obsidian-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                      : "bg-graphite-card hover:bg-slate-800 text-slate-300 border border-graphite-border/70"
                  } disabled:opacity-50 disabled:pointer-events-none`}
                >
                  <span>{st}</span>
                  {task.status === st && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Task Info List */}
            <div className="pt-3 border-t border-graphite-border space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Assignee:</span>
                <span className="font-semibold text-slate-200">
                  {task.assignedDeveloper?.name || "Unassigned"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Due Date:</span>
                <span className={`font-mono ${isOverdue ? "text-rose-400 font-bold" : "text-slate-200"}`}>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "None specified"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Created:</span>
                <span className="font-mono text-slate-400">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Activity & Transition History */}
      <div className="bg-graphite-card border border-graphite-border rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 pb-4 border-b border-graphite-border">
          <Activity className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading font-semibold text-sm text-slate-100">
            Task Transition History
          </h3>
        </div>

        <div className="mt-4 space-y-3">
          {isActivityLoading ? (
            <div className="h-24 bg-obsidian-850 rounded skeleton-shimmer" />
          ) : taskActivities.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 font-mono">
              NO TRANSITION LOGS RECORDED FOR THIS WORK ORDER
            </div>
          ) : (
            taskActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-lg bg-obsidian-850 border border-graphite-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-200">{act.user?.name || "User"}</span>
                  {act.user?.role && <RoleBadge role={act.user.role} />}
                  <span className="text-slate-500">transitioned</span>
                  {act.previousStatus && (
                    <>
                      <StatusBadge status={act.previousStatus} size="sm" />
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </>
                  )}
                  <StatusBadge status={act.newStatus} size="sm" />
                </div>

                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500 shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(act.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <TaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          taskToEdit={task}
        />
      )}
    </div>
  );
};
