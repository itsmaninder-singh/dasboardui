import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, Plus, UserCircle, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useSocketStore } from "../../store/socketStore";
import { useUiStore } from "../../store/uiStore";
import { useAuth } from "../../hooks/useAuth";
import { PresenceIndicator } from "../common/PresenceIndicator";
import { RoleBadge } from "../common/Badge";
import { Button } from "../common/Button";

export const Header: React.FC<{ onNewTaskClick?: () => void }> = ({ onNewTaskClick }) => {
  const user = useAuthStore((s) => s.user);
  const unreadCount = useSocketStore((s) => s.unreadCount);
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const canCreateTask = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  return (
    <header className="sticky top-0 z-20 glass-header h-14 px-4 sm:px-6 flex items-center justify-between gap-4">
      {}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 md:hidden">
          <div className="w-6 h-6 rounded bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
            <span className="font-heading font-black text-amber-400 text-xs">K</span>
          </div>
          <span className="font-heading font-bold text-sm tracking-wider text-slate-100">KINETIC</span>
        </Link>
      </div>

      {}
      <div className="hidden sm:flex items-center gap-3">
        {user?.role === "ADMIN" && (
          <PresenceIndicator />
        )}
      </div>

      {}
      <div className="flex items-center gap-2 sm:gap-3">
        {canCreateTask && onNewTaskClick && (
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={onNewTaskClick}
            className="hidden sm:inline-flex"
          >
            New Task
          </Button>
        )}

        {}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors border border-transparent hover:border-graphite-border"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
          )}
        </Link>

        {}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-graphite-border">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-medium text-slate-200 leading-none">{user.name}</p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{user.email}</p>
            </div>
            <RoleBadge role={user.role} />
          </div>
        )}
      </div>
    </header>
  );
};
