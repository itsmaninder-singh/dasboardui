import React from "react";
import { useAuthStore } from "../store/authStore";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";
import { PmDashboard } from "../components/dashboard/PmDashboard";
import { DevDashboard } from "../components/dashboard/DevDashboard";

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "PROJECT_MANAGER":
      return <PmDashboard />;
    case "DEVELOPER":
      return <DevDashboard />;
    default:
      return <DevDashboard />;
  }
};
