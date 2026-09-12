import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { TasksPage } from "../pages/TasksPage";
import { TaskDetailPage } from "../pages/TaskDetailPage";
import { ClientsPage } from "../pages/ClientsPage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { UsersPage } from "../pages/UsersPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { AppShell } from "../components/layout/AppShell";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Shell Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {/* Role-specific Dashboard */}
        <Route path="/" element={<DashboardPage />} />

        {/* Projects (Admin & PM) */}
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Tasks (All roles - backend scopes visibility) */}
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />

        {/* Clients (Admin manage, PM read-only) */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}>
              <ClientsPage />
            </ProtectedRoute>
          }
        />

        {/* Notifications (All authenticated users) */}
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Users (Admin only) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback 404 inside layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
