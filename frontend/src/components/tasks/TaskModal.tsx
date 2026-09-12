import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ApiResponse } from "../../types/api";
import { Task, TaskPriority } from "../../types/task";
import { Project } from "../../types/project";
import { User } from "../../types/auth";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";

const taskFormSchema = z.object({
  title: z.string().min(2, "Task title must be at least 2 characters").max(200),
  description: z.string().max(5000).optional(),
  projectId: z.string().min(1, "Project selection required"),
  assignedDeveloperId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultProjectId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultProjectId,
}) => {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const user = useAuthStore((s) => s.user);

  
  const { data: projectsData } = useQuery({
    queryKey: ["projects", "selector"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project[]>>("/projects?page=1&limit=50");
      return res.data.data;
    },
    enabled: isOpen,
  });

  
  const { data: usersData } = useQuery({
    queryKey: ["users", "devs-selector"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User[]>>("/users?page=1&limit=50");
      return res.data.data.filter((u) => u.role === "DEVELOPER");
    },
    enabled: isOpen && user?.role === "ADMIN",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: defaultProjectId || "",
      assignedDeveloperId: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (taskToEdit) {
      reset({
        title: taskToEdit.title,
        description: taskToEdit.description || "",
        projectId: taskToEdit.projectId,
        assignedDeveloperId: taskToEdit.assignedDeveloperId || "",
        priority: taskToEdit.priority,
        dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.split("T")[0] : "",
      });
    } else {
      reset({
        title: "",
        description: "",
        projectId: defaultProjectId || "",
        assignedDeveloperId: "",
        priority: "MEDIUM",
        dueDate: "",
      });
    }
  }, [taskToEdit, defaultProjectId, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      if (taskToEdit) {
        const payload: any = {
          title: data.title,
          description: data.description || undefined,
          priority: data.priority,
          assignedDeveloperId: data.assignedDeveloperId ? data.assignedDeveloperId : null,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        };
        const res = await api.patch<ApiResponse<Task>>(`/tasks/${taskToEdit.id}`, payload);
        return res.data.data;
      } else {
        const payload: any = {
          title: data.title,
          description: data.description || undefined,
          projectId: data.projectId,
          priority: data.priority,
          ...(data.assignedDeveloperId ? { assignedDeveloperId: data.assignedDeveloperId } : {}),
          ...(data.dueDate ? { dueDate: new Date(data.dueDate).toISOString() } : {}),
        };
        const res = await api.post<ApiResponse<Task>>("/tasks", payload);
        return res.data.data;
      }
    },
    onSuccess: (task) => {
      addToast({
        type: "success",
        title: taskToEdit ? "Task Updated" : "Task Created",
        description: `Task "${task.title}" saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      onClose();
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Operation Failed",
        description: err.response?.data?.error?.message || "Could not save task.",
      });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    mutation.mutate(data);
  };

  const projectOptions =
    projectsData?.map((p) => ({
      value: p.id,
      label: p.name,
    })) || [];

  const devOptions = [
    { value: "", label: "Unassigned" },
    ...(usersData?.map((d) => ({
      value: d.id,
      label: `${d.name} (${d.email})`,
    })) || []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Modify Work Order" : "Provision New Task"}
      subtitle="Define task parameters, target delivery timeline, and urgency tier."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Task Objective"
          placeholder="e.g. Implement WebSocket heartbeat reconnection"
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-medium tracking-wider text-slate-300 uppercase">
            Description & Specs
          </label>
          <textarea
            rows={3}
            placeholder="Acceptance criteria, technical notes, constraints..."
            className="w-full bg-obsidian-850 border border-graphite-border hover:border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-slate-100 text-sm rounded-md p-3 focus:outline-none transition-all"
            {...register("description")}
          />
          {errors.description?.message && (
            <p className="text-xs text-rose-400 font-mono">{errors.description.message}</p>
          )}
        </div>

        {!taskToEdit && (
          <Select
            label="Project Workspace"
            placeholder="Select project..."
            options={projectOptions}
            error={errors.projectId?.message}
            {...register("projectId")}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Priority Tier"
            options={[
              { value: "LOW", label: "LOW" },
              { value: "MEDIUM", label: "MEDIUM" },
              { value: "HIGH", label: "HIGH" },
              { value: "CRITICAL", label: "CRITICAL" },
            ]}
            error={errors.priority?.message}
            {...register("priority")}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-medium tracking-wider text-slate-300 uppercase">
              Target Due Date
            </label>
            <input
              type="date"
              className="w-full bg-obsidian-850 border border-graphite-border hover:border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-slate-100 text-sm rounded-md p-2 focus:outline-none transition-all"
              {...register("dueDate")}
            />
          </div>
        </div>

        {user?.role === "ADMIN" && (
          <Select
            label="Assigned Developer"
            options={devOptions}
            error={errors.assignedDeveloperId?.message}
            {...register("assignedDeveloperId")}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-graphite-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={mutation.isPending}>
            {taskToEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
