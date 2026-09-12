import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Role } from "../../types/auth";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "../common/Button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
            <span className="font-heading font-black text-amber-400 text-lg">K</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>AUTHENTICATING TELEMETRY SESSION...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-700/60 flex items-center justify-center text-rose-400 mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono uppercase tracking-widest text-rose-400 mb-1">
          HTTP 403 // FORBIDDEN
        </span>
        <h2 className="text-2xl font-heading font-bold text-slate-100 mb-2">
          Restricted Perimeter
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-6 font-sans">
          Your current credentials (<span className="text-amber-400 font-mono">{user.role}</span>)
          do not have clearance for this resource. The backend strictly enforces role boundaries.
        </p>
        <Link to="/">
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Authorized Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
