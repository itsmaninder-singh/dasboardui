import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, ArrowRight } from "lucide-react";
import { useSocketStore } from "../../store/socketStore";
import { StatusBadge } from "./Badge";
import { Link } from "react-router-dom";

export const LiveActivityTicker: React.FC = () => {
  const recentActivities = useSocketStore((s) => s.recentActivities);
  const isConnected = useSocketStore((s) => s.isConnected);

  
  const displayItems = recentActivities.slice(0, 6);

  return (
    <div className="hidden lg:flex items-center h-9 px-3 bg-obsidian-900/90 border-y border-graphite-border text-xs overflow-hidden select-none">
      {}
      <div className="flex items-center gap-1.5 pr-3 border-r border-graphite-border/80 shrink-0 text-slate-400 font-mono text-[11px]">
        <Radio className={`w-3.5 h-3.5 ${isConnected ? "text-amber-400" : "text-slate-600"}`} />
        <span className="font-semibold tracking-wider text-slate-300 uppercase">LIVE STREAM</span>
      </div>

      {}
      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 pl-3 py-1">
        <AnimatePresence initial={false}>
          {displayItems.length === 0 ? (
            <span className="text-slate-500 font-mono text-[11px] italic">
              Awaiting telemetry events...
            </span>
          ) : (
            displayItems.map((item) => {
              const taskTitle = item.task?.title || item.taskTitle || "Task";
              const actorName = item.user?.name || item.changedBy?.name || "System";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 25, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0 flex items-center gap-2 bg-graphite-card/80 border border-graphite-border px-2.5 py-1 rounded text-slate-300 hover:border-amber-500/40 transition-colors"
                >
                  <span className="font-medium text-slate-200 text-[11px]">{actorName}</span>
                  <span className="text-slate-500 text-[10px]">moved</span>
                  <Link
                    to={`/tasks/${item.taskId}`}
                    className="font-mono text-amber-400/90 hover:underline max-w-[140px] truncate text-[11px]"
                  >
                    {taskTitle}
                  </Link>

                  {item.previousStatus && (
                    <>
                      <StatusBadge status={item.previousStatus} size="sm" />
                      <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                    </>
                  )}
                  <StatusBadge status={item.newStatus} size="sm" />
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
