import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-graphite-border/80 bg-graphite-card/30 ${className}`}
    >
      {/* Abstract Tech Geometric Wireframe Illustration */}
      <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
        {/* Outer rotating hex / square wireframe */}
        <div className="absolute inset-0 rounded-2xl border border-amber-500/20 rotate-6" />
        <div className="absolute inset-0 rounded-2xl border border-graphite-border -rotate-3" />
        {/* Inner technical grid reticle */}
        <div className="relative w-14 h-14 rounded-lg bg-obsidian-850 border border-amber-500/30 flex items-center justify-center shadow-inner">
          <svg
            className="w-7 h-7 text-amber-400/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7V4h3" />
            <path d="M20 7V4h-3" />
            <path d="M4 17v3h3" />
            <path d="M20 17v3h-3" />
            <circle cx="12" cy="12" r="3" strokeDasharray="2 2" />
          </svg>
        </div>
      </div>

      <h4 className="text-base font-heading font-semibold text-slate-200 tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4 font-sans leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button size="sm" variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
