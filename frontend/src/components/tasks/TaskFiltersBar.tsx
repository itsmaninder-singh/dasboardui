import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, X, Calendar, RotateCcw } from "lucide-react";
import { useTaskFilters } from "../../hooks/useTaskFilters";
import { TaskStatus, TaskPriority } from "../../types/task";
import { api } from "../../lib/api";
import { ApiResponse } from "../../types/api";
import { Project } from "../../types/project";
import { Button } from "../common/Button";

interface TaskFiltersBarProps {
  showProjectFilter?: boolean;
}

export const TaskFiltersBar: React.FC<TaskFiltersBarProps> = ({ showProjectFilter = true }) => {
  const { filters, setFilter, resetFilters } = useTaskFilters();

  // Fetch projects list for the project filter dropdown
  const { data: projectsData } = useQuery({
    queryKey: ["projects", "filter-list"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Project[]>>("/projects?page=1&limit=50");
      return res.data.data;
    },
    enabled: showProjectFilter,
  });

  const projects = projectsData || [];
  const hasActiveFilters = Boolean(
    filters.status || filters.priority || filters.projectId || filters.dueDateFrom || filters.dueDateTo
  );

  return (
    <div className="p-4 rounded-xl bg-graphite-card border border-graphite-border shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold tracking-wider uppercase">URL-BOUND PARAMETRIC FILTERS</span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-mono text-rose-400 hover:text-rose-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET PARAMS</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Status Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => setFilter("status", e.target.value)}
            className="w-full bg-obsidian-850 border border-graphite-border hover:border-slate-600 focus:border-amber-400 text-slate-100 text-xs rounded-md p-2 focus:outline-none transition-all"
          >
            <option value="">All Statuses</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="DONE">DONE</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            Priority
          </label>
          <select
            value={filters.priority || ""}
            onChange={(e) => setFilter("priority", e.target.value)}
            className="w-full bg-obsidian-850 border border-graphite-border hover:border-slate-600 focus:border-amber-400 text-slate-100 text-xs rounded-md p-2 focus:outline-none transition-all"
          >
            <option value="">All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        {/* Project Filter */}
        {showProjectFilter && (
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Project
            </label>
            <select
              value={filters.projectId || ""}
              onChange={(e) => setFilter("projectId", e.target.value)}
              className="w-full bg-obsidian-850 border border-graphite-border hover:border-slate-600 focus:border-amber-400 text-slate-100 text-xs rounded-md p-2 focus:outline-none transition-all truncate"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Due Date From */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            Due Date From
          </label>
          <input
            type="date"
            value={filters.dueDateFrom || ""}
            onChange={(e) => setFilter("dueDateFrom", e.target.value)}
            className="w-full bg-obsidian-850 border border-graphite-border hover:border-slate-600 focus:border-amber-400 text-slate-100 text-xs rounded-md p-1.5 focus:outline-none transition-all"
          />
        </div>

        {/* Due Date To */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
            Due Date To
          </label>
          <input
            type="date"
            value={filters.dueDateTo || ""}
            onChange={(e) => setFilter("dueDateTo", e.target.value)}
            className="w-full bg-obsidian-850 border border-graphite-border hover:border-slate-600 focus:border-amber-400 text-slate-100 text-xs rounded-md p-1.5 focus:outline-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};
