import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Check, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { NotificationItem } from "../types/notification";
import { useSocketStore } from "../store/socketStore";
import { useUiStore } from "../store/uiStore";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const setUnreadCount = useSocketStore((s) => s.setUnreadCount);

  // Fetch Notifications
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notifications", "inbox"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<NotificationItem[]>>("/notifications?page=1&limit=50");
      return res.data.data;
    },
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // Refresh unread count
      api.get<ApiResponse<{ unreadCount: number }>>("/notifications/unread-count").then((res) => {
        setUnreadCount(res.data.data.unreadCount);
      });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      addToast({
        type: "success",
        title: "All Notifications Cleared",
        description: "Marked all items as read.",
      });
      setUnreadCount(0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data || [];
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs text-amber-400 tracking-wider uppercase">
              INBOX TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight mt-1">
            Notifications & Alerts
          </h1>
        </div>

        {unreadNotifications.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4 text-emerald-400" />}
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            Mark All as Read ({unreadNotifications.length})
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-graphite-card rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load notifications"
          message={(error as any)?.message || "Failed to load notification inbox."}
          onRetry={() => refetch()}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Inbox clear"
          description="You are caught up on all real-time assignment notifications and review requests."
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                item.read
                  ? "bg-graphite-card/60 border-graphite-border/70 opacity-75"
                  : "bg-graphite-card border-amber-500/30 shadow-md"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    item.read ? "bg-slate-600" : "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  }`}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-200">{item.message}</p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-obsidian-850 border border-graphite-border">
                      {item.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.taskId && (
                  <Link
                    to={`/tasks/${item.taskId}`}
                    className="p-1.5 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                    title="View related task"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}

                {!item.read && (
                  <button
                    onClick={() => markReadMutation.mutate(item.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
