import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ApiResponse } from "../../types/api";
import { Client } from "../../types/project";
import { useUiStore } from "../../store/uiStore";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";

const clientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters").max(150),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  company: z.string().max(150).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
}) => {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
    },
  });

  useEffect(() => {
    if (clientToEdit) {
      reset({
        name: clientToEdit.name,
        email: clientToEdit.email || "",
        company: clientToEdit.company || "",
      });
    } else {
      reset({
        name: "",
        email: "",
        company: "",
      });
    }
  }, [clientToEdit, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const payload: any = {
        name: data.name,
        email: data.email || undefined,
        company: data.company || undefined,
      };

      if (clientToEdit) {
        const res = await api.patch<ApiResponse<Client>>(`/clients/${clientToEdit.id}`, payload);
        return res.data.data;
      } else {
        const res = await api.post<ApiResponse<Client>>("/clients", payload);
        return res.data.data;
      }
    },
    onSuccess: (client) => {
      addToast({
        type: "success",
        title: clientToEdit ? "Client Updated" : "Client Registered",
        description: `Enterprise account "${client.name}" saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onClose();
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Operation Failed",
        description: err.response?.data?.error?.message || "Failed to save client.",
      });
    },
  });

  const onSubmit = (data: ClientFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? "Update Client Account" : "Register Enterprise Client"}
      subtitle="Configure enterprise partner account and contact channel."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Primary Client Name"
          placeholder="e.g. Acme Corporation"
          error={errors.name?.message}
          {...register("name")}
        />

        <Input
          label="Corporate Entity / Brand"
          placeholder="e.g. Acme Global Industries"
          error={errors.company?.message}
          {...register("company")}
        />

        <Input
          label="Contact Email"
          type="email"
          placeholder="contact@acme.io"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-graphite-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={mutation.isPending}>
            {clientToEdit ? "Save Changes" : "Register Client"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
