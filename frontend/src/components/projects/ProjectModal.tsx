import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ApiResponse } from "../../types/api";
import { Client, Project } from "../../types/project";
import { User } from "../../types/auth";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";

const projectFormSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(150),
  description: z.string().max(2000).optional(),
  clientId: z.string().min(1, "Client selection required"),
  managerId: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";

  
  const { data: clientsData } = useQuery({
    queryKey: ["clients", "selector"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Client[]>>("/clients?page=1&limit=50");
      return res.data.data;
    },
    enabled: isOpen,
  });

  
  const { data: usersData } = useQuery({
    queryKey: ["users", "pms-selector"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User[]>>("/users?page=1&limit=50");
      return res.data.data.filter((u) => u.role === "PROJECT_MANAGER");
    },
    enabled: isOpen && isAdmin,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      clientId: "",
      managerId: "",
    },
  });

  useEffect(() => {
    if (projectToEdit) {
      reset({
        name: projectToEdit.name,
        description: projectToEdit.description || "",
        clientId: projectToEdit.clientId,
        managerId: projectToEdit.managerId || "",
      });
    } else {
      reset({
        name: "",
        description: "",
        clientId: "",
        managerId: "",
      });
    }
  }, [projectToEdit, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      if (projectToEdit) {
        const payload: any = {
          name: data.name,
          description: data.description || undefined,
          clientId: data.clientId,
        };
        const res = await api.patch<ApiResponse<Project>>(`/projects/${projectToEdit.id}`, payload);
        return res.data.data;
      } else {
        const payload: any = {
          name: data.name,
          description: data.description || undefined,
          clientId: data.clientId,
          ...(isAdmin && data.managerId ? { managerId: data.managerId } : {}),
        };
        const res = await api.post<ApiResponse<Project>>("/projects", payload);
        return res.data.data;
      }
    },
    onSuccess: (project) => {
      addToast({
        type: "success",
        title: projectToEdit ? "Project Updated" : "Project Created",
        description: `Project "${project.name}" saved successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Operation Failed",
        description: err.response?.data?.error?.message || "Failed to save project",
      });
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    mutation.mutate(data);
  };

  const clientOptions =
    clientsData?.map((c) => ({
      value: c.id,
      label: `${c.name}${c.company ? ` (${c.company})` : ""}`,
    })) || [];

  const managerOptions =
    usersData?.map((u) => ({
      value: u.id,
      label: `${u.name} (${u.email})`,
    })) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? "Modify Project Workspace" : "Provision New Project"}
      subtitle="Initialize project boundaries, assign client account, and designated lead."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Project Identifier"
          placeholder="e.g. NextGen Mobile Platform"
          error={errors.name?.message}
          {...register("name")}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-medium tracking-wider text-slate-300 uppercase">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Key architectural goals, scope, deliverables..."
            className="w-full bg-obsidian-850 border border-graphite-border hover:border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 text-slate-100 text-sm rounded-md p-3 focus:outline-none transition-all"
            {...register("description")}
          />
          {errors.description?.message && (
            <p className="text-xs text-rose-400 font-mono">{errors.description.message}</p>
          )}
        </div>

        <Select
          label="Client Account"
          placeholder="Select a client enterprise..."
          options={clientOptions}
          error={errors.clientId?.message}
          {...register("clientId")}
        />

        {isAdmin && !projectToEdit && (
          <Select
            label="Assigned Project Manager"
            placeholder="Assign Lead PM (optional)..."
            options={managerOptions}
            error={errors.managerId?.message}
            {...register("managerId")}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-graphite-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={mutation.isPending}>
            {projectToEdit ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
