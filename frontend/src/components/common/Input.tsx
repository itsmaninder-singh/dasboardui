import React, { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label htmlFor={inputId} className="block text-xs font-mono font-medium tracking-wider text-slate-300 uppercase">
              {label}
            </label>
            {hint && <span className="text-[11px] text-slate-500 font-mono">{hint}</span>}
          </div>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-slate-500 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-obsidian-850 border text-slate-100 placeholder-slate-500 text-sm rounded-md transition-all duration-150 py-2 ${
              leftIcon ? "pl-9" : "pl-3"
            } ${rightElement ? "pr-10" : "pr-3"} ${
              error
                ? "border-rose-500/70 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/30"
                : "border-graphite-border hover:border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
            } focus:outline-none ${className}`}
            {...props}
          />
          {rightElement && <div className="absolute right-3 flex items-center">{rightElement}</div>}
        </div>
        {error && (
          <p className="text-xs text-rose-400 font-mono flex items-center gap-1 mt-1">
            <span className="inline-block w-1 h-1 rounded-full bg-rose-400" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
