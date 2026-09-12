import React, { SelectHTMLAttributes, forwardRef } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-mono font-medium tracking-wider text-slate-300 uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full bg-obsidian-850 border text-slate-100 text-sm rounded-md transition-all duration-150 py-2 px-3 appearance-none ${
              error
                ? "border-rose-500/70 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/30"
                : "border-graphite-border hover:border-slate-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
            } focus:outline-none ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-obsidian-900 text-slate-500">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-obsidian-900 text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
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

Select.displayName = "Select";
