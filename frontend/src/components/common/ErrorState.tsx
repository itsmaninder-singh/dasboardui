import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load data",
  message = "An unexpected error occurred while communicating with the service.",
  code,
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-xl border border-rose-900/40 bg-rose-950/20 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-rose-900/30 border border-rose-700/50 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-base font-heading font-semibold text-rose-200">
          {title}
        </h4>
        {code && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60">
            {code}
          </span>
        )}
      </div>

      <p className="text-xs text-rose-300/80 max-w-md mt-1 mb-4 font-sans">
        {message}
      </p>

      {onRetry && (
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={onRetry}
          className="border-rose-800/60 hover:bg-rose-900/40"
        >
          Retry Request
        </Button>
      )}
    </div>
  );
};
