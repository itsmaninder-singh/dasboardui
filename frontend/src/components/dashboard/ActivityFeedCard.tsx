import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { ApiResponse } from "../../types/api";
import { ActivityLog } from "../../types/activity";
import { StatusBadge, RoleBadge } from "../common/Badge";
import { EmptyState } from "../common/EmptyState";
import { ErrorState } from "../common/ErrorState";

interface ActivityFeedCardProps {
  projectId?: string;
  limit?: number;
}

export const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({ projectId, limit = 15 }) => {
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["activity", { projectId, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId) params.append("projectId", projectId);
      params.append("limit", String(limit));
      params.append("page", "1");

      const res = await api.get<ApiResponse<ActivityLog[]>>(`/activity?${params.toString()}`);
      return res.data.data;
    },
  });

  const activities = data || [];

  const formatRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bg-graphite-card border border-graphite-border rounded-xl p-5 shadow-lg flex flex-col h-full">
      {}
      <div className="flex items-center justify-between pb-4 border-b border-graphite-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm text-slate-100">
              Audit & Activity Stream
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Real-time audit log scoped to your permission level
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-850 text-slate-400 border border-graphite-border">
          SOCKET SYNC
        </span>
      </div>

      {}
      <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3 max-h-[480px]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-obsidian-850/60 border border-graphite-border skeleton-shimmer"
              />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            message={(error as any)?.message || "Failed to stream activity logs"}
            onRetry={() => refetch()}
          />
        ) : activities.length === 0 ? (
          <EmptyState
            title="No activity recorded yet"
            description="When tasks are transitioned across lanes, state changes will stream here live."
          />
        ) : (
          <AnimatePresence initial={false}>
            {activities.map((item, idx) => {
              const taskTitle = item.task?.title || item.taskTitle || "Task";
              const userName = item.user?.name || item.changedBy?.name || "System";
              const userRole = item.user?.role || (item.changedBy?.role as any);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  className="p-3 rounded-lg bg-obsidian-850/90 border border-graphite-border hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-200">{userName}</span>
                      {userRole && <RoleBadge role={userRole} />}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-500">updated</span>
                    <Link
                      to={`/tasks/${item.taskId}`}
                      className="font-medium text-amber-400 hover:underline"
                    >
                      {taskTitle}
                    </Link>
                    {item.project?.name && (
                      <span className="text-slate-500 text-[11px]">
                        in <span className="text-slate-300">{item.project.name}</span>
                      </span>
                    )}
                  </div>

                  {}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-graphite-border/50">
                    {item.previousStatus && (
                      <>
                        <StatusBadge status={item.previousStatus} size="sm" />
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                      </>
                    )}
                    <StatusBadge status={item.newStatus} size="sm" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
