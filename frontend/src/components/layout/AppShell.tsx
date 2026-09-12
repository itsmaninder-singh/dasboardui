import React, { useState } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CommandRail } from "./CommandRail";
import { Header } from "./Header";
import { LiveActivityTicker } from "../common/LiveActivityTicker";
import { ToastContainer } from "../common/ToastContainer";
import { useSocketSetup } from "../../hooks/useSocket";
import { useSocketStore } from "../../store/socketStore";
import { useUiStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Building2,
  Users,
  Bell,
  X,
} from "lucide-react";
import { TaskModal } from "../tasks/TaskModal";

export const AppShell: React.FC = () => {
  // Activate Socket.io lifecycle listener
  useSocketSetup();

  const location = useLocation();
  const unreadCount = useSocketStore((s) => s.unreadCount);
  const isConnected = useSocketStore((s) => s.isConnected);
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const user = useAuthStore((s) => s.user);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, exact: true, allowed: true },
    { to: "/projects", label: "Projects", icon: <FolderKanban className="w-5 h-5" />, allowed: user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER" },
    { to: "/tasks", label: "Tasks", icon: <CheckSquare className="w-5 h-5" />, allowed: true },
    { to: "/clients", label: "Clients", icon: <Building2 className="w-5 h-5" />, allowed: user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER" },
    { to: "/notifications", label: "Notifications", icon: <Bell className="w-5 h-5" />, badge: unreadCount, allowed: true },
    { to: "/users", label: "Users", icon: <Users className="w-5 h-5" />, allowed: user?.role === "ADMIN" },
  ].filter((i) => i.allowed);

  return (
    <div className="relative min-h-screen flex bg-obsidian-950 text-slate-100 overflow-x-hidden">
      {/* 1. SOFT PINK AMBIENT BACKGROUND LAYER */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle dot matrix grid */}
        <div className="absolute inset-0 bg-ambient-grid opacity-35" />
        <div className="absolute inset-0 bg-noise opacity-30" />

        {/* Floating pink orb (moves slowly) */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] transition-all duration-1000 ${
            unreadCount > 0 ? "bg-amber-500/15" : "bg-amber-600/10"
          }`}
        />

        {/* Floating pink orb for depth */}
        <motion.div
          animate={{
            x: [0, -35, 25, 0],
            y: [0, 45, -30, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-32 right-1/4 w-[28rem] h-[28rem] rounded-full bg-amber-100/70 blur-[160px]"
        />
      </div>

      {/* 2. DESKTOP COMMAND RAIL */}
      <CommandRail />

      {/* 3. MOBILE SLIDE-OVER NAVIGATION */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-black/25 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-64 max-w-[80vw] h-full bg-obsidian-900 border-r border-graphite-border p-4 flex flex-col justify-between z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-graphite-border">
                  <span className="font-heading font-bold text-base text-slate-100">KINETIC</span>
                  <button onClick={() => setMobileNavOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="mt-4 space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.exact}
                      onClick={() => setMobileNavOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                          isActive
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Header onNewTaskClick={() => setIsTaskModalOpen(true)} />
        <LiveActivityTicker />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet context={{ openTaskModal: () => setIsTaskModalOpen(true) }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 5. PHYSICAL TOAST NOTIFICATIONS */}
      <ToastContainer />

      {/* Global Task Creation Modal */}
      {isTaskModalOpen && (
        <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      )}
    </div>
  );
};
