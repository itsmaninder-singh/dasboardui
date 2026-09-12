import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Search, Edit, ShieldCheck, Mail, Calendar, Check, X } from "lucide-react";
import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { User, Role } from "../types/auth";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { Button } from "../components/common/Button";
import { RoleBadge } from "../components/common/Badge";
import { UserModal } from "../components/users/UserModal";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const currentUser = useAuthStore((s) => s.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", "directory"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<User[]>>("/users?page=1&limit=100");
      return res.data.data;
    },
  });

  
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.patch<ApiResponse<User>>(`/users/${id}`, { isActive });
      return res.data.data;
    },
    onSuccess: (updatedUser) => {
      addToast({
        type: "success",
        title: "Account Status Updated",
        description: `${updatedUser.name} is now ${updatedUser.isActive ? "Active" : "Deactivated"}`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Update Failed",
        description: err.response?.data?.error?.message || "Could not modify status.",
      });
    },
  });

  const users = data || [];
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-xs text-amber-400 tracking-wider uppercase">
              SYSADMIN CLEARANCE ONLY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight mt-1">
            Team Directory & Access Control
          </h1>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setUserToEdit(null);
            setIsModalOpen(true);
          }}
        >
          Provision Operator
        </Button>
      </div>

      {}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search team by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-graphite-card border border-graphite-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
        />
      </div>

      {}
      {isLoading ? (
        <div className="h-64 bg-graphite-card rounded-xl skeleton-shimmer" />
      ) : isError ? (
        <ErrorState
          title="Could not load team directory"
          message={(error as any)?.message || "Failed to retrieve users."}
          onRetry={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No operators found"
          description={
            searchTerm
              ? `No operators matched query "${searchTerm}".`
              : "No operators are registered in this system."
          }
          actionLabel="Provision Operator"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-graphite-card border border-graphite-border rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-graphite-border bg-obsidian-850 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Clearance Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-border/60 text-xs">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-graphite-elevated/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-200">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-100">{u.name}</span>
                        {currentUser?.id === u.id && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>

                    <td className="py-3 px-4">
                      <RoleBadge role={u.role} />
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border ${
                          u.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.isActive ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        {u.isActive ? "ACTIVE" : "DISABLED"}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setUserToEdit(u);
                            setIsModalOpen(true);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title="Edit operator"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {currentUser?.id !== u.id && (
                          <button
                            onClick={() =>
                              toggleActiveMutation.mutate({
                                id: u.id,
                                isActive: !u.isActive,
                              })
                            }
                            className={`p-1 rounded transition-colors ${
                              u.isActive
                                ? "text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                                : "text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40"
                            }`}
                            title={u.isActive ? "Deactivate account" : "Activate account"}
                          >
                            {u.isActive ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {}
      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setUserToEdit(null);
          }}
          userToEdit={userToEdit}
        />
      )}
    </div>
  );
};
