import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lock, Mail, Terminal, ArrowRight, ShieldCheck, UserCheck, Code } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";

const loginSchema = z.object({
  email: z.string().email("Valid email address required"),
  password: z.string().min(1, "Password cannot be empty"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@pm.dev",
      password: "Password123!",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    await login(data);
    setIsSubmitting(false);
  };

  const setDemoAccount = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "Password123!", { shouldValidate: true });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-obsidian-950 overflow-hidden">
      {}
      <div className="absolute inset-0 bg-ambient-grid opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />

      {}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="font-mono text-[11px] text-amber-400 tracking-wider">
              SYS.AUTH 
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">ENCRYPTION: AES-256</span>
        </div>

        {}
        <div className="glass-modal rounded-2xl p-7 border border-graphite-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          {}
          <div className="mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-slate-100 tracking-tight">
              Command Terminal
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Authenticate your identity to connect to the real-time project stream.
            </p>
          </div>

          {}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Operator Email"
              type="email"
              placeholder="e.g. operator@pm.dev"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Security Key"
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
              Initialize Session
            </Button>
          </form>

          {}
          <div className="mt-6 pt-5 border-t border-graphite-border">
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
              Rapid Role Fast-Switch:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount("admin@pm.dev")}
                className="flex flex-col items-center p-2 rounded-lg bg-obsidian-850 hover:bg-slate-800/80 border border-graphite-border hover:border-amber-500/40 transition-all text-left group"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-mono text-[10px] font-semibold text-slate-200">ADMIN</span>
                <span className="text-[9px] text-slate-500 truncate w-full text-center">Alice</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount("pm1@pm.dev")}
                className="flex flex-col items-center p-2 rounded-lg bg-obsidian-850 hover:bg-slate-800/80 border border-graphite-border hover:border-cyan-500/40 transition-all text-left group"
              >
                <UserCheck className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-mono text-[10px] font-semibold text-slate-200">PM</span>
                <span className="text-[9px] text-slate-500 truncate w-full text-center">Paul</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoAccount("dev1@pm.dev")}
                className="flex flex-col items-center p-2 rounded-lg bg-obsidian-850 hover:bg-slate-800/80 border border-graphite-border hover:border-emerald-500/40 transition-all text-left group"
              >
                <Code className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-mono text-[10px] font-semibold text-slate-200">DEV</span>
                <span className="text-[9px] text-slate-500 truncate w-full text-center">Dev 1</span>
              </button>
            </div>
          </div>

          {}
          <div className="mt-5 text-center">
            <span className="text-xs text-slate-400 font-sans">
              Need to register a new developer?{" "}
              <Link to="/register" className="text-amber-400 hover:underline font-medium">
                Create account
              </Link>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
