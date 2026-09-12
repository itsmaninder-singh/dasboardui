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
      {}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        {}
        <Route path="/" element={<DashboardPage />} />

        {}
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

        {}
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />

        {}
        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}>
              <ClientsPage />
            </ProtectedRoute>
          }
        />

        {}
        <Route path="/notifications" element={<NotificationsPage />} />

        {}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
