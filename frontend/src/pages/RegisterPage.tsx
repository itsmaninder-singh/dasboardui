import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserPlus, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Valid email address required"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    await registerUser(data);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-obsidian-950 overflow-hidden">
      {/* Precision ambient background grid */}
      <div className="absolute inset-0 bg-ambient-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="glass-modal rounded-2xl p-7 border border-graphite-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          {/* Header */}
          <div className="mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <UserPlus className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-slate-100 tracking-tight">
              Developer Onboarding
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Create a new operator account. Roles other than Developer require Administrator provisioning.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. John Operator"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="e.g. j.operator@pm.dev"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Security Passphrase (8+ chars)"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2"
            >
              Complete Registration
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center">
            <span className="text-xs text-slate-400 font-sans">
              Already have credentials?{" "}
              <Link to="/login" className="text-amber-400 hover:underline font-medium">
                Log in
              </Link>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
