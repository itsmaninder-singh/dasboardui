import React from "react";

export const TaskCardSkeleton: React.FC = () => (
  <div className="bg-graphite-card/80 border border-graphite-border/70 rounded-lg p-4 space-y-3 relative overflow-hidden">
    <div className="absolute inset-0 skeleton-shimmer" />
    <div className="flex items-center justify-between">
      <div className="w-16 h-4 bg-slate-800 rounded" />
      <div className="w-12 h-4 bg-slate-800 rounded" />
    </div>
    <div className="w-3/4 h-5 bg-slate-800 rounded" />
    <div className="w-full h-3 bg-slate-800/60 rounded" />
    <div className="pt-2 border-t border-graphite-border/40 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-slate-800" />
        <div className="w-20 h-3 bg-slate-800 rounded" />
      </div>
      <div className="w-14 h-3 bg-slate-800 rounded" />
    </div>
  </div>
);

export const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-graphite-card border border-graphite-border rounded-xl p-5 space-y-4 relative overflow-hidden">
    <div className="absolute inset-0 skeleton-shimmer" />
    <div className="flex items-start justify-between">
      <div className="space-y-1.5 w-2/3">
        <div className="w-20 h-3 bg-slate-800 rounded" />
        <div className="w-40 h-6 bg-slate-800 rounded" />
      </div>
      <div className="w-12 h-6 bg-slate-800 rounded" />
    </div>
    <div className="w-full h-8 bg-slate-800/40 rounded" />
    <div className="space-y-1.5">
      <div className="flex justify-between w-full">
        <div className="w-24 h-3 bg-slate-800 rounded" />
        <div className="w-10 h-3 bg-slate-800 rounded" />
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-graphite-border/60">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-3 px-4">
        <div className="h-4 bg-slate-800/80 rounded skeleton-shimmer w-full max-w-[140px]" />
      </td>
    ))}
  </tr>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-graphite-card border border-graphite-border rounded-xl p-5 relative overflow-hidden space-y-3">
    <div className="absolute inset-0 skeleton-shimmer" />
    <div className="flex justify-between items-center">
      <div className="w-24 h-3 bg-slate-800 rounded" />
      <div className="w-6 h-6 bg-slate-800 rounded" />
    </div>
    <div className="w-16 h-8 bg-slate-800 rounded" />
    <div className="w-32 h-3 bg-slate-800/60 rounded" />
  </div>
);
