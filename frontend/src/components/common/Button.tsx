import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "relative inline-flex items-center justify-center font-semibold font-sans select-none tracking-wide transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 rounded gap-1.5",
    md: "text-sm px-4 py-2 rounded-md gap-2",
    lg: "text-base px-5 py-2.5 rounded-lg gap-2.5 font-semibold",
  }[size];

  const variantClasses = {
    primary:
      "bg-gradient-to-b from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-black font-bold shadow-[0_1px_10px_rgba(229,84,139,0.25)] border border-amber-300/40 hover:shadow-[0_2px_16px_rgba(229,84,139,0.35)]",
    secondary:
      "bg-white hover:bg-graphite-elevated text-black border border-graphite-border hover:border-amber-300 shadow-sm",
    ghost:
      "bg-transparent hover:bg-amber-100 text-slate-300 hover:text-black border border-transparent",
    danger:
      "bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-700/50 hover:border-rose-500 shadow-[0_1px_10px_rgba(244,63,94,0.15)]",
    outline:
      "bg-white hover:bg-amber-100 text-amber-700 border border-amber-500/40 hover:border-amber-400",
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
