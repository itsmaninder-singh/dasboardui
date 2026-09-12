import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Building2,
  Users,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { useSocketStore } from "../../store/socketStore";
import { useAuth } from "../../hooks/useAuth";
import { RoleBadge } from "../common/Badge";

export const CommandRail: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { railCollapsed, toggleRail } = useUiStore();
  const isConnected = useSocketStore((s) => s.isConnected);
  const unreadCount = useSocketStore((s) => s.unreadCount);
  const { logout } = useAuth();

  const role = user?.role;

  
  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      exact: true,
      allowed: true,
    },
    {
      to: "/projects",
      label: "Projects",
      icon: <FolderKanban className="w-4 h-4" />,
      allowed: role === "ADMIN" || role === "PROJECT_MANAGER",
    },
    {
      to: "/tasks",
      label: "Tasks & Board",
      icon: <CheckSquare className="w-4 h-4" />,
      allowed: true, 
    },
    {
      to: "/clients",
      label: "Clients",
      icon: <Building2 className="w-4 h-4" />,
      allowed: role === "ADMIN" || role === "PROJECT_MANAGER",
    },
    {
      to: "/notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
      allowed: true,
    },
    {
      to: "/users",
      label: "Team Directory",
      icon: <Users className="w-4 h-4" />,
      allowed: role === "ADMIN", 
    },
  ].filter((item) => item.allowed);

  return (
    <aside
      className={`hidden md:flex flex-col justify-between h-screen sticky top-0 z-30 transition-all duration-200 border-r border-graphite-border bg-obsidian-900/95 backdrop-blur-xl ${
        railCollapsed ? "w-18" : "w-60"
      }`}
    >
      {}
      <div>
        <div className="h-14 flex items-center justify-between px-4 border-b border-graphite-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {}
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <span className="font-heading font-black text-amber-400 text-sm tracking-tighter">K</span>
            </div>
            {!railCollapsed && (
              <div className="leading-none">
                <span className="font-heading font-bold text-sm tracking-wider text-slate-100 uppercase">
                  Kinetic
                </span>
                <span className="block text-[9px] font-mono text-amber-500/80 tracking-widest uppercase mt-0.5">
                  PM.OS v2.4
                </span>
              </div>
            )}
          </div>

          <button
            onClick={toggleRail}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {railCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2 rounded-md font-sans text-xs font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.12)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent"
                }`
              }
            >
              <div className="shrink-0">{item.icon}</div>
              {!railCollapsed && <span className="truncate">{item.label}</span>}
              {!railCollapsed && item.badge !== undefined && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500 text-obsidian-950">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {}
      <div className="p-3 border-t border-graphite-border space-y-2">
        {}
        <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-mono text-slate-500">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? "bg-emerald-400" : "bg-rose-500"
            }`}
          />
          {!railCollapsed && (
            <span className="truncate">
              {isConnected ? "SOCKET ONLINE" : "DISCONNECTED"}
            </span>
          )}
        </div>

        {}
        {user && (
          <div
            className={`flex items-center justify-between p-2 rounded-lg bg-graphite-card/80 border border-graphite-border ${
              railCollapsed ? "flex-col gap-2" : ""
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-200 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!railCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{user.name}</p>
                  <RoleBadge role={user.role} className="mt-0.5" />
                </div>
              )}
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
