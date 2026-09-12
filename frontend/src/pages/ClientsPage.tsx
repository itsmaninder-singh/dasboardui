import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, Plus, Search, Mail, Briefcase, Trash2, Edit } from "lucide-react";
import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { Client } from "../types/project";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { Button } from "../components/common/Button";
import { ClientModal } from "../components/clients/ClientModal";
import { EmptyState } from "../components/common/EmptyState";
import { ErrorState } from "../components/common/ErrorState";

export const ClientsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const addToast = useUiStore((s) => s.addToast);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const isAdmin = user?.role === "ADMIN";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["clients", "list"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Client[]>>("/clients?page=1&limit=100");
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/clients/${id}`);
    },
    onSuccess: () => {
      addToast({
        type: "info",
        title: "Client Deleted",
        description: "Enterprise client removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Deletion Failed",
        description: err.response?.data?.error?.message || "Could not delete client.",
      });
    },
  });

  const clients = data || [];
  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-graphite-border">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs text-cyan-400 tracking-wider uppercase">
              ENTERPRISE ACCOUNTS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight mt-1">
            Client Directory
          </h1>
        </div>

        {isAdmin ? (
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setClientToEdit(null);
              setIsModalOpen(true);
            }}
          >
            Register Client
          </Button>
        ) : (
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-obsidian-850 text-slate-400 border border-graphite-border">
            READ-ONLY VIEW (PM)
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search clients by name, company, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-graphite-card border border-graphite-border rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-graphite-card rounded-xl skeleton-shimmer" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load clients"
          message={(error as any)?.message || "Failed to retrieve client directory."}
          onRetry={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No client accounts found"
          description={
            searchTerm
              ? `No clients matched "${searchTerm}".`
              : "No enterprise client accounts have been registered."
          }
          actionLabel={isAdmin ? "Register Client" : undefined}
          onAction={isAdmin ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-graphite-card border border-graphite-border rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-600 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-heading font-bold text-sm">
                    {client.name.charAt(0)}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setClientToEdit(client);
                          setIsModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete client "${client.name}"?`)) {
                            deleteMutation.mutate(client.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base text-slate-100">{client.name}</h3>

                {client.company && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-sans">
                    <Briefcase className="w-3 h-3 text-slate-500" />
                    <span>{client.company}</span>
                  </div>
                )}

                {client.email && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 mt-4 border-t border-graphite-border/70 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>REGISTERED</span>
                <span>{new Date(client.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ClientModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setClientToEdit(null);
          }}
          clientToEdit={clientToEdit}
        />
      )}
    </div>
  );
};
