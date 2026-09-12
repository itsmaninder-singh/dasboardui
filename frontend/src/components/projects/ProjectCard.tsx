import React from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Building2, UserCircle, ArrowRight } from "lucide-react";
import { Project } from "../../types/project";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-graphite-card border border-graphite-border rounded-xl p-5 shadow-lg hover:border-amber-500/40 transition-all flex flex-col justify-between group">
      <div>
        {/* Top bar: Client pill + Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-obsidian-850 border border-graphite-border text-[11px] font-mono text-slate-300">
            <Building2 className="w-3 h-3 text-cyan-400" />
            <span className="truncate max-w-[150px]">{project.client?.name || "Client"}</span>
          </div>

          <span className="text-[10px] font-mono text-slate-500">
            {new Date(project.createdAt).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <Link to={`/projects/${project.id}`} className="block">
          <h3 className="font-heading font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
            {project.name}
          </h3>
        </Link>

        {project.description && (
          <p className="text-xs text-slate-400 font-sans mt-1.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Footer: Manager + Link */}
      <div className="pt-4 mt-4 border-t border-graphite-border/70 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-[10px] text-slate-200">
            {project.manager?.name ? project.manager.name.charAt(0) : "M"}
          </div>
          <span className="truncate max-w-[120px] text-[11px]">
            {project.manager?.name || "Assigned PM"}
          </span>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="text-xs font-mono text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group/link"
        >
          <span>Explore</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
