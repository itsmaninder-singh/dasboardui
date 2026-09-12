import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Calendar,
  UserCircle,
  Plus,
  Trash2,
  Edit,
  FolderKanban,
} from "lucide-react";
import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { Project } from "../types/project";
import { Task, TaskStatus } from "../types/task";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { Button } from "../components/common/Button";
import { StatusBadge } from "../components/common/Badge";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";
import { ProjectModal } from "../components/projects/ProjectModal";
import { TaskModal } from "../components/tasks/TaskModal";
import { TaskCard } from "../components/tasks/TaskCard";

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const addToast = useUiStore((s) => s.addToast);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const canManage = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  // Fetch Project details
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError,
  } = useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Fetch Project Tasks
  const {
    data: tasksData,
    isLoading: isTasksLoading,
  } = useQuery({
    queryKey: ["tasks", { projectId: id }],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Task[]>>(`/tasks?projectId=${id}&limit=100`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      addToast({
        type: "info",
        title: "Project Deleted",
        description: `Project "${project?.name}" was removed.`,
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects");
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Deletion Failed",
        description: err.response?.data?.error?.message || "Could not delete project.",
      });
    },
  });

  const tasks = tasksData || [];

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

  if (isProjectLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-graphite-card rounded-xl skeleton-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 bg-graphite-card rounded-xl skeleton-shimmer" />
          <div className="h-40 bg-graphite-card rounded-xl skeleton-shimmer" />
          <div className="h-40 bg-graphite-card rounded-xl skeleton-shimmer" />
        </div>
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <ErrorState
        title="Project Workspace Inaccessible"
        message={
          (projectError as any)?.response?.data?.error?.message ||
          "This project may not exist, or your account does not have access permissions."
        }
        onRetry={() => navigate("/projects")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO REGISTRY</span>
        </Link>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Edit className="w-3.5 h-3.5" />}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Project
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete project "${project.name}"?`)) {
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

      {/* Project Overview Card */}
      <div className="bg-graphite-card border border-graphite-border rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/60 via-amber-500/60 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                PROJECT WORKSPACE
              </span>
              <span className="text-slate-600">//</span>
              <span className="text-xs font-mono text-slate-400">ID: {project.id.slice(0, 8)}...</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-slate-300 font-sans mt-2 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-graphite-border">
            <div className="p-3 rounded-lg bg-obsidian-850 border border-graphite-border min-w-[140px]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Client Enterprise
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">{project.client?.name || "Client"}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-obsidian-850 border border-graphite-border min-w-[140px]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Designated Lead PM
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <UserCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">{project.manager?.name || "Lead Manager"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Task Progress Bar */}
        <div className="mt-6 pt-5 border-t border-graphite-border/70">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-slate-400">PIPELINE EXECUTION:</span>
            <span className="text-slate-200 font-bold">
              {tasks.length > 0
                ? `${Math.round((statusCounts.DONE / tasks.length) * 100)}% Complete (${statusCounts.DONE}/${tasks.length})`
                : "No tasks created"}
            </span>
          </div>
          <div className="w-full h-2 bg-obsidian-850 rounded-full overflow-hidden flex">
            {tasks.length > 0 && (
              <>
                <div
                  style={{ width: `${(statusCounts.DONE / tasks.length) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`DONE: ${statusCounts.DONE}`}
                />
                <div
                  style={{ width: `${(statusCounts.IN_REVIEW / tasks.length) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title={`IN_REVIEW: ${statusCounts.IN_REVIEW}`}
                />
                <div
                  style={{ width: `${(statusCounts.IN_PROGRESS / tasks.length) * 100}%` }}
                  className="bg-cyan-500 h-full"
                  title={`IN_PROGRESS: ${statusCounts.IN_PROGRESS}`}
                />
                <div
                  style={{ width: `${(statusCounts.OVERDUE / tasks.length) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`OVERDUE: ${statusCounts.OVERDUE}`}
                />
                <div
                  style={{ width: `${(statusCounts.TODO / tasks.length) * 100}%` }}
                  className="bg-slate-600 h-full"
                  title={`TODO: ${statusCounts.TODO}`}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Project Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading font-bold text-slate-100">
              Project Tasks & Work Orders
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Tasks bound to this project workspace ({tasks.length} total)
            </p>
          </div>

          {canManage && (
            <Button
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsNewTaskModalOpen(true)}
            >
              Add Task
            </Button>
          )}
        </div>

        {isTasksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-graphite-card rounded-xl skeleton-shimmer" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks in this project"
            description="Start provisioning work orders for developers by adding tasks."
            actionLabel={canManage ? "Create First Task" : undefined}
            onAction={canManage ? () => setIsNewTaskModalOpen(true) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <ProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          projectToEdit={project}
        />
      )}

      {/* New Task for this project */}
      {isNewTaskModalOpen && (
        <TaskModal
          isOpen={isNewTaskModalOpen}
          onClose={() => setIsNewTaskModalOpen(false)}
          defaultProjectId={project.id}
        />
      )}
    </div>
  );
};
