import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocketStore } from "../../store/socketStore";

interface PresenceIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  className = "",
  showLabel = true,
}) => {
  const onlineCount = useSocketStore((s) => s.onlineCount);
  const isConnected = useSocketStore((s) => s.isConnected);

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-graphite-card/90 border border-graphite-border text-xs font-mono select-none ${className}`}
      title={isConnected ? `${onlineCount} users connected in real-time` : "Connecting to real-time telemetry..."}
    >
      {}
      <span
        className={`inline-flex rounded-full h-2 w-2 ${
          isConnected ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />

      {}
      <div className="flex items-center gap-1">
        <div className="relative h-4 overflow-hidden inline-flex items-center font-bold text-slate-100">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={onlineCount}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="inline-block min-w-[1ch] text-center"
            >
              {onlineCount}
            </motion.span>
          </AnimatePresence>
        </div>

        {showLabel && (
          <span className="text-[11px] text-slate-400 font-sans tracking-tight">
            {onlineCount === 1 ? "peer online" : "peers online"}
          </span>
        )}
      </div>
    </div>
  );
};
