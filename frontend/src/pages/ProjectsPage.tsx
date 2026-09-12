import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, FolderKanban, SlidersHorizontal } from "lucide-react";
import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { Project } from "../types/project";
import { useAuthStore } from "../store/authStore";
import { ProjectCard } from "../components/projects/ProjectCard";
import { ProjectModal } from "../components/projects/ProjectModal";
import { Button } from "../components/common/Button";
import { ProjectCardSkeleton } from "../components/common/Skeleton";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";

export const ProjectsPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const canCreate = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["projects", "list"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project[]>>("/projects?page=1&limit=50");
      return res.data.data;
    },
  });

  const projects = data || [];
  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs text-amber-400 tracking-wider uppercase">
              PORTFOLIO REGISTRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight mt-1">
            Projects Directory
          </h1>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Provision Project
          </Button>
        )}
      </div>

      {/* Search and stats bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by name, description, client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-graphite-card border border-graphite-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 self-end sm:self-auto">
          <span>SHOWING:</span>
          <span className="px-2 py-1 rounded bg-obsidian-850 border border-graphite-border font-bold text-slate-200">
            {filteredProjects.length} / {projects.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load projects"
          message={(error as any)?.message || "Failed to retrieve project directory."}
          onRetry={() => refetch()}
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={
            searchTerm
              ? `No projects matched search criteria "${searchTerm}".`
              : "No project workspaces have been provisioned yet."
          }
          actionLabel={canCreate ? "Provision First Project" : undefined}
          onAction={canCreate ? () => setIsCreateModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isCreateModalOpen && (
        <ProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};
