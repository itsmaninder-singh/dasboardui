import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { ApiResponse } from "../../types/api";
import { User, Role } from "../../types/auth";
import { useUiStore } from "../../store/uiStore";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Valid email address required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "DEVELOPER"]),
});

type UserFormData = z.infer<typeof createUserSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
}) => {
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(
      userToEdit
        ? z.object({
            name: z.string().min(2).max(100),
            role: z.enum(["ADMIN", "PROJECT_MANAGER", "DEVELOPER"]),
          }) as any
        : createUserSchema
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "DEVELOPER",
    },
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        password: "dummyPassword123!", // not edited
        role: userToEdit.role,
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        role: "DEVELOPER",
      });
    }
  }, [userToEdit, reset, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      if (userToEdit) {
        const payload = {
          name: data.name,
          role: data.role,
        };
        const res = await api.patch<ApiResponse<User>>(`/users/${userToEdit.id}`, payload);
        return res.data.data;
      } else {
        const res = await api.post<ApiResponse<User>>("/users", data);
        return res.data.data;
      }
    },
    onSuccess: (savedUser) => {
      addToast({
        type: "success",
        title: userToEdit ? "User Updated" : "User Provisioned",
        description: `Account for ${savedUser.name} (${savedUser.role}) configured.`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onClose();
    },
    onError: (err: any) => {
      addToast({
        type: "error",
        title: "Operation Failed",
        description: err.response?.data?.error?.message || "Failed to save user account.",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    mutation.mutate(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? "Modify Operator Account" : "Provision New Team Operator"}
      subtitle="Configure identity, role clearance, and authentication credentials."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Legal Name"
          placeholder="e.g. Rachel Martinez"
          error={errors.name?.message}
          {...register("name")}
        />

        {!userToEdit && (
          <>
            <Input
              label="Corporate Email Address"
              type="email"
              placeholder="r.martinez@pm.dev"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Initial Password (8+ characters)"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register("password")}
            />
          </>
        )}

        <Select
          label="Role Clearance Level"
          options={[
            { value: "DEVELOPER", label: "DEVELOPER (Task Worker)" },
            { value: "PROJECT_MANAGER", label: "PROJECT_MANAGER (Project Lead)" },
            { value: "ADMIN", label: "ADMIN (Global System Administrator)" },
          ]}
          error={errors.role?.message}
          {...register("role")}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-graphite-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={mutation.isPending}>
            {userToEdit ? "Update Operator" : "Provision User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
